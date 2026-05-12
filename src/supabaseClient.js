import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

/* ── Scans ── */
export async function saveSession(data) {
  if (!supabase) {
    console.info('[Plasticity Scan] Supabase not configured — result not saved.', data)
    return { error: null }
  }
  const { error } = await supabase.from('scans').insert([data])
  if (error) console.error('[Plasticity Scan] Supabase insert error:', error)
  return { error }
}

/* ── Companies ── */
export async function getCompanies() {
  if (!supabase) return { data: [], error: null }
  return await supabase.from('companies').select('*').order('name')
}

export async function createCompany({ name, email_domain }) {
  if (!supabase) return { data: null, error: new Error('Supabase non configuré') }
  return await supabase
    .from('companies')
    .insert([{ name: name.trim(), email_domain: email_domain.trim().replace(/^@/, '').toLowerCase() }])
    .select()
    .single()
}

export async function deleteCompany(id) {
  if (!supabase) return { error: new Error('Supabase non configuré') }
  return await supabase.from('companies').delete().eq('id', id)
}
