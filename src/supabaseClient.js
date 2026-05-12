import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export async function saveSession(data) {
  if (!supabase) {
    console.info('[Plasticity Scan] Supabase not configured — result not saved.', data)
    return { error: null }
  }
  const { error } = await supabase.from('scans').insert([data])
  if (error) console.error('[Plasticity Scan] Supabase insert error:', error)
  return { error }
}
