'use client'

/** Browser-side helpers for the signed session token issued at login. */

const TOKEN_KEY = 'sessionToken'

export function saveSession(token: string, profileId: string, role: 'student' | 'apprentice') {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(role === 'student' ? 'studentId' : 'apprenticeId', profileId)
  localStorage.setItem('userType', role)
}

export function clearSession() {
  localStorage.clear()
}

export function authHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Fetch wrapper that attaches the session token and unwraps JSON errors. */
export async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...options.headers },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? 'Request failed')
  return data
}
