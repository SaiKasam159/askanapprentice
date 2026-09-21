import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export function getSupabase(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('Supabase URL:', supabaseUrl)
  console.log('Supabase Key:', supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + '...' : 'NOT SET')

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(`Missing Supabase vars. URL: ${!!supabaseUrl}, Key: ${!!supabaseAnonKey}`)
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = getSupabase()
