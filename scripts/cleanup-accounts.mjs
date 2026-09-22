#!/usr/bin/env node
/**
 * Account cleanup for ApprentaCall.
 *
 *   node scripts/cleanup-accounts.mjs                   # dry run, shows everything
 *   node scripts/cleanup-accounts.mjs --delete-orphans  # remove only mismatched records
 *   node scripts/cleanup-accounts.mjs --delete-all      # wipe every account
 *
 * Uses the REST API directly so it runs on any Node with fetch (18+).
 */
import { readFileSync } from 'node:fs'

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const match = line.match(/^([A-Z_]+)=(.*)$/)
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim()
}

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL_BASE || !KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }

async function api(path, options = {}) {
  const res = await fetch(`${URL_BASE}${path}`, { ...options, headers })
  if (!res.ok) throw new Error(`${options.method ?? 'GET'} ${path} -> ${res.status} ${await res.text()}`)
  return res.status === 204 ? null : res.json()
}

const deleteAll = process.argv.includes('--delete-all')
const deleteOrphans = process.argv.includes('--delete-orphans')

const authUsers = (await api('/auth/v1/admin/users?per_page=1000')).users ?? []

async function table(name) {
  try { return await api(`/rest/v1/${name}?select=id,email,name`) }
  catch (err) { console.warn(`  (could not read ${name}: ${err.message})`); return [] }
}
const students = await table('students')
const apprentices = await table('apprentices')

const profileIds = new Set([...students, ...apprentices].map(r => r.id))
const authIds = new Set(authUsers.map(u => u.id))

const orphanAuth = authUsers.filter(u => !profileIds.has(u.id))
const orphanStudents = students.filter(r => !authIds.has(r.id))
const orphanApprentices = apprentices.filter(r => !authIds.has(r.id))

const show = (label, rows, fmt) => {
  console.log(`\n${label} (${rows.length})`)
  rows.forEach(r => console.log('  ' + fmt(r)))
}

console.log('='.repeat(64))
console.log('CURRENT STATE')
console.log('='.repeat(64))
show('Auth users', authUsers, u => `${(u.email ?? '?').padEnd(34)} ${u.id}`)
show('Students', students, r => `${(r.email ?? '(no email)').padEnd(34)} ${r.name ?? ''}`)
show('Apprentices', apprentices, r => `${(r.email ?? '(no email)').padEnd(34)} ${r.name ?? ''}`)

console.log('\n' + '='.repeat(64))
console.log('ORPHANS  (broken records from the failed-signup period)')
console.log('='.repeat(64))
show('Auth users with no profile — these emails cannot sign up again', orphanAuth, u => u.email)
show('Student rows with no auth user — cannot log in', orphanStudents, r => r.email ?? r.id)
show('Apprentice rows with no auth user — cannot log in', orphanApprentices, r => r.email ?? r.id)

if (!deleteAll && !deleteOrphans) {
  console.log('\nDry run. Nothing was deleted.')
  console.log('  --delete-orphans   remove only the broken records listed above')
  console.log('  --delete-all       remove every account')
  process.exit(0)
}

const authToDelete = deleteAll ? authUsers : orphanAuth
const studentsToDelete = deleteAll ? students : orphanStudents
const apprenticesToDelete = deleteAll ? apprentices : orphanApprentices

console.log(`\nDeleting ${authToDelete.length} auth users, ${studentsToDelete.length} students, ${apprenticesToDelete.length} apprentices...\n`)

for (const row of studentsToDelete) await api(`/rest/v1/students?id=eq.${row.id}`, { method: 'DELETE' })
for (const row of apprenticesToDelete) await api(`/rest/v1/apprentices?id=eq.${row.id}`, { method: 'DELETE' })
for (const user of authToDelete) {
  try {
    await api(`/auth/v1/admin/users/${user.id}`, { method: 'DELETE' })
    console.log(`  deleted ${user.email}`)
  } catch (err) {
    console.log(`  FAILED  ${user.email}: ${err.message}`)
  }
}

console.log('\nDone.')
