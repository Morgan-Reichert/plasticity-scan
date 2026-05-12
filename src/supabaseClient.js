import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

/* ── Scans ── */
export async function saveSession(data) {
  if (!supabase) { console.info('[PS] Supabase not configured', data); return { error: null } }
  const { error } = await supabase.from('scans').insert([data])
  if (error) console.error('[PS] insert scan error:', error)
  return { error }
}

export async function getCompanyScans(companyId) {
  if (!supabase || !companyId) return { data: [], error: null }
  return await supabase
    .from('scans')
    .select('*')
    .eq('company_id', companyId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
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
    .select().single()
}

export async function deleteCompany(id) {
  if (!supabase) return { error: new Error('Supabase non configuré') }
  return await supabase.from('companies').delete().eq('id', id)
}

/* ── Dirigeants (POC — password en clair, à sécuriser en production) ── */
export async function getDirigeantsByCompany(companyId) {
  if (!supabase) return { data: [], error: null }
  return await supabase.from('dirigeants').select('id, email, created_at, company_id').eq('company_id', companyId)
}

export async function createDirigeant({ email, password, company_id }) {
  if (!supabase) return { data: null, error: new Error('Supabase non configuré') }
  return await supabase
    .from('dirigeants')
    .insert([{ email: email.trim().toLowerCase(), password, company_id }])
    .select().single()
}

export async function deleteDirigeant(id) {
  if (!supabase) return { error: new Error('Supabase non configuré') }
  return await supabase.from('dirigeants').delete().eq('id', id)
}

export async function signInDirigeant(email, password) {
  if (!supabase) return { data: null, error: new Error('Supabase non configuré') }
  const { data, error } = await supabase
    .from('dirigeants')
    .select('*, companies(id, name, email_domain)')
    .eq('email', email.trim().toLowerCase())
    .eq('password', password)
    .single()
  return { data, error }
}
