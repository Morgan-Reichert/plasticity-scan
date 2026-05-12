import { useEffect, useState, useMemo } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  PieChart, Pie,
} from 'recharts'
import {
  Activity, Users, TrendingUp, Award, RefreshCw, ArrowLeft,
  AlertCircle, Building2, Search, ChevronUp, ChevronDown,
  ChevronsUpDown, Download, FileJson, FileText, LogOut,
} from 'lucide-react'
import { supabase, getCompanies } from '../supabaseClient'
import { dimensions, plasticityLevel } from '../surveyData'
import CompanyManager from './CompanyManager'

/* ── Mock data ── */
const MOCK_COMPANIES = [
  { id: 'mock-1', name: 'Sensup', email_domain: 'sensup.com' },
  { id: 'mock-2', name: 'Acme Corp', email_domain: 'acme.com' },
]
const MOCK_SCANS = [
  { id: 'm1', company: 'Sensup',    company_id: 'mock-1', profile: 'manager',       global_score: 6.4, scores: [6,7,5,6,7,6,7], email: 'alice@sensup.com',    created_at: '2026-05-10T10:00:00Z', status: 'completed' },
  { id: 'm2', company: 'Acme Corp', company_id: 'mock-2', profile: 'directeur',     global_score: 7.1, scores: [8,7,7,6,7,8,7], email: 'bob@acme.com',        created_at: '2026-05-10T11:00:00Z', status: 'completed' },
  { id: 'm3', company: 'Sensup',    company_id: 'mock-1', profile: 'collaborateur', global_score: 3.9, scores: [4,3,4,4,4,3,4], email: 'carol@sensup.com',    created_at: '2026-05-11T09:00:00Z', status: 'completed' },
  { id: 'm4', company: 'Acme Corp', company_id: 'mock-2', profile: 'manager',       global_score: 5.5, scores: [5,6,5,5,6,5,6], email: 'dave@acme.com',       created_at: '2026-05-11T14:00:00Z', status: 'completed' },
  { id: 'm5', company: 'Sensup',    company_id: 'mock-1', profile: 'directeur',     global_score: 7.8, scores: [8,8,7,8,8,7,8], email: 'emma@sensup.com',     created_at: '2026-05-12T08:00:00Z', status: 'completed' },
  { id: 'm6', company: 'Acme Corp', company_id: 'mock-2', profile: 'collaborateur', global_score: 4.2, scores: [4,4,4,5,4,3,5], email: 'frank@acme.com',      created_at: '2026-05-12T10:00:00Z', status: 'completed' },
  { id: 'm7', company: 'Sensup',    company_id: 'mock-1', profile: 'manager',       global_score: 6.0, scores: [6,5,6,6,6,6,6], email: 'grace@sensup.com',    created_at: '2026-05-12T11:00:00Z', status: 'completed' },
  { id: 'm8', company: 'Acme Corp', company_id: 'mock-2', profile: 'collaborateur', global_score: 5.1, scores: [5,5,5,5,5,5,5], email: 'henry@acme.com',      created_at: '2026-05-12T13:00:00Z', status: 'completed' },
]

const PROFILE_LABELS = { collaborateur: 'Collaborateur', manager: 'Manager', directeur: 'Directeur' }
const PROFILE_COLORS = { collaborateur: '#3B82F6', manager: '#14B8A6', directeur: '#8B5CF6' }
const LEVER_MAP = { 1: 'Clarté', 2: 'Robustesse', 3: 'Cohérence', 4: 'Soutenabilité', 5: 'Clarté', 6: 'Soutenabilité', 7: 'Robustesse' }
const LEVER_COLORS = { Clarté: '#3B82F6', Cohérence: '#14B8A6', Soutenabilité: '#F59E0B', Robustesse: '#8B5CF6' }

/* ── Helpers ── */
const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs font-manrope">
      <p className="text-slate-300 mb-1">{label}</p>
      <p className="text-white font-600">{payload[0].value.toFixed(1)} / 9</p>
    </div>
  )
}

function ScorePill({ score }) {
  const { label, color } = plasticityLevel(score ?? 0)
  return (
    <span className="text-[10px] font-manrope font-600 uppercase tracking-wider px-2 py-0.5 rounded-full"
      style={{ background: color + '1A', color, border: `1px solid ${color}30` }}>
      {label}
    </span>
  )
}

function KpiCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="glass rounded-2xl p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: color + '20', border: `1px solid ${color}30` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-slate-500 text-[11px] font-manrope uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-white font-syne font-700 text-2xl leading-none mb-1">{value}</p>
        {sub && <p className="text-slate-500 text-xs font-manrope">{sub}</p>}
      </div>
    </div>
  )
}

function SortIcon({ field, sort }) {
  if (sort.field !== field) return <ChevronsUpDown size={12} className="text-slate-600" />
  return sort.dir === 'asc'
    ? <ChevronUp size={12} className="text-electric" />
    : <ChevronDown size={12} className="text-electric" />
}

function computeStats(scans) {
  if (!scans.length) return null
  const n = scans.length
  const dimAvgs = dimensions.map((dim, i) => {
    const avg = scans.reduce((s, sc) => {
      const raw = sc.scores ?? []
      const val = Array.isArray(raw) ? (raw[i] ?? 0) : 0
      return s + (typeof val === 'object' ? val.score ?? 0 : val)
    }, 0) / n
    return { ...dim, avg: parseFloat(avg.toFixed(1)) }
  })
  const globalAvg = dimAvgs.reduce((s, d) => s + d.avg, 0) / dimAvgs.length
  const profileCounts = {}
  scans.forEach(({ profile }) => { profileCounts[profile] = (profileCounts[profile] ?? 0) + 1 })
  const profileData = Object.entries(profileCounts).map(([k, v]) => ({
    name: PROFILE_LABELS[k] ?? k, value: v, pct: Math.round((v / n) * 100), color: PROFILE_COLORS[k] ?? '#64748B',
  }))
  const leverCounts = {}
  scans.forEach((sc) => {
    const raw = Array.isArray(sc.scores) ? sc.scores : []
    const vals = raw.map((v, i) => ({ i, s: typeof v === 'object' ? v.score ?? 0 : v }))
    vals.sort((a, b) => a.s - b.s)
    const seen = new Set()
    vals.slice(0, 3).forEach(({ i }) => {
      const lever = LEVER_MAP[i + 1]
      if (lever && !seen.has(lever)) { seen.add(lever); leverCounts[lever] = (leverCounts[lever] ?? 0) + 1 }
    })
  })
  const leverData = Object.entries(leverCounts).map(([k, v]) => ({ name: k, count: v, color: LEVER_COLORS[k] })).sort((a, b) => b.count - a.count)
  return { n, dimAvgs, globalAvg: parseFloat(globalAvg.toFixed(1)), profileData, leverData }
}

/* ── Export helpers ── */
function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function exportCSV(scans) {
  const SEP = ';'
  const headers = ['Entreprise', 'Email', 'Profil', 'Score Global', 'Niveau', 'Dim.1', 'Dim.2', 'Dim.3', 'Dim.4', 'Dim.5', 'Dim.6', 'Dim.7', 'Date']
  const rows = scans.map(s => {
    const raw = Array.isArray(s.scores) ? s.scores : []
    const dimScores = dimensions.map((_, i) => {
      const v = raw[i] ?? ''
      return typeof v === 'object' ? (v.score ?? '') : v
    })
    return [
      `"${s.company ?? ''}"`,
      `"${s.email ?? ''}"`,
      PROFILE_LABELS[s.profile] ?? s.profile ?? '',
      s.global_score?.toFixed(1) ?? '',
      plasticityLevel(s.global_score ?? 0).label,
      ...dimScores,
      s.created_at ? new Date(s.created_at).toLocaleDateString('fr-FR') : '',
    ].join(SEP)
  })
  const csv = '﻿' + [headers.join(SEP), ...rows].join('\n')
  downloadFile(csv, `plasticity-scan-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8')
}

function exportJSON(scans) {
  downloadFile(JSON.stringify(scans, null, 2), `plasticity-scan-${new Date().toISOString().slice(0, 10)}.json`, 'application/json')
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ════════════════════════════════════════════════════════════════════════ */
export default function DashboardPage({ authUser, onBack }) {
  const isDirigeant = authUser?.role === 'dirigeant'

  const [tab, setTab] = useState('stats')
  const [scans, setScans] = useState(null)
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [usingMock, setUsingMock] = useState(false)
  const [visible, setVisible] = useState(false)

  /* Filters */
  const [companyFilter, setCompanyFilter] = useState(isDirigeant ? (authUser?.companyId ?? 'all') : 'all')
  const [profileFilter, setProfileFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState({ field: 'created_at', dir: 'desc' })
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  const toggleSort = (field) => {
    setSort(prev => ({ field, dir: prev.field === field && prev.dir === 'asc' ? 'desc' : 'asc' }))
    setPage(1)
  }

  const fetchAll = async () => {
    setLoading(true)
    setVisible(false)
    let realScans = null
    let realCompanies = []

    if (supabase) {
      if (isDirigeant && authUser?.companyId) {
        // Dirigeant: fetch only their company's scans
        const scansRes = await supabase
          .from('scans')
          .select('*')
          .eq('status', 'completed')
          .eq('company_id', authUser.companyId)
          .order('created_at', { ascending: false })
        if (!scansRes.error) realScans = scansRes.data
        realCompanies = [{ id: authUser.companyId, name: authUser.companyName, email_domain: authUser.emailDomain }]
      } else {
        const [scansRes, companiesRes] = await Promise.all([
          supabase.from('scans').select('*').eq('status', 'completed').order('created_at', { ascending: false }),
          getCompanies(),
        ])
        if (!scansRes.error) realScans = scansRes.data
        if (!companiesRes.error) realCompanies = companiesRes.data ?? []
      }
    }

    if (realScans !== null) {
      setScans(realScans)
      setCompanies(realCompanies)
      setUsingMock(false)
    } else {
      setScans(isDirigeant ? [] : MOCK_SCANS)
      setCompanies(isDirigeant ? [] : MOCK_COMPANIES)
      setUsingMock(!isDirigeant)
    }
    setLoading(false)
    setTimeout(() => setVisible(true), 80)
  }

  useEffect(() => { fetchAll() }, [])

  /* ── Filtered + sorted scans ── */
  const filteredScans = useMemo(() => {
    if (!scans) return []
    let r = [...scans]
    if (companyFilter !== 'all') {
      const co = companies.find(c => c.id === companyFilter)
      r = r.filter(s => s.company_id === companyFilter || (co && s.company === co.name))
    }
    if (profileFilter !== 'all') r = r.filter(s => s.profile === profileFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(s => (s.company ?? '').toLowerCase().includes(q) || (s.email ?? '').toLowerCase().includes(q))
    }
    r.sort((a, b) => {
      const m = sort.dir === 'asc' ? 1 : -1
      if (sort.field === 'global_score') return ((a.global_score ?? 0) - (b.global_score ?? 0)) * m
      if (sort.field === 'created_at') return (new Date(a.created_at ?? 0) - new Date(b.created_at ?? 0)) * m
      const va = String(a[sort.field] ?? '').toLowerCase()
      const vb = String(b[sort.field] ?? '').toLowerCase()
      return (va > vb ? 1 : va < vb ? -1 : 0) * m
    })
    return r
  }, [scans, companyFilter, profileFilter, search, sort, companies])

  const totalPages = Math.max(1, Math.ceil(filteredScans.length / PAGE_SIZE))
  const pagedScans = filteredScans.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const stats = useMemo(() => computeStats(filteredScans), [filteredScans])

  const radarData = stats?.dimAvgs.map(d => ({ dimension: d.shortName, score: d.avg, fullMark: 9 }))
  const barData = stats?.dimAvgs.map(d => ({ name: d.shortName, score: d.avg, fill: d.color }))

  return (
    <div className="min-h-screen mesh-bg dot-grid">
      <div aria-hidden className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(ellipse at 20% 10%, rgba(139,92,246,0.07) 0%, transparent 55%), radial-gradient(ellipse at 80% 85%, rgba(20,184,166,0.06) 0%, transparent 55%)' }} />

      {/* ── Header ── */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-navy-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-scan animate-pulse" />
            <span className="font-syne font-700 text-white text-sm tracking-[0.12em] uppercase">
              {isDirigeant
                ? `${authUser?.companyName ?? 'Mon entreprise'} — Résultats`
                : 'Tableau de bord — Intervenants'}
            </span>
          </div>
          {isDirigeant && authUser?.emailDomain && (
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-electric/10 border border-electric/20 text-electric text-[10px] font-manrope font-600">
              @{authUser.emailDomain}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {usingMock && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20">
              <AlertCircle size={11} className="text-amber-400" />
              <span className="text-amber-400 text-[10px] font-manrope font-600 uppercase tracking-wider">Données démo</span>
            </div>
          )}
          {!isDirigeant && (
            <button onClick={fetchAll} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-navy-600 text-slate-400 hover:text-white hover:border-electric/40 text-sm font-manrope transition-all disabled:opacity-40">
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Actualiser
            </button>
          )}
          {isDirigeant && (
            <span className="hidden sm:block text-slate-500 text-xs font-manrope">{authUser?.email}</span>
          )}
          <button onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-navy-600 text-slate-400 hover:text-red-400 hover:border-red-400/30 text-sm font-manrope transition-all">
            <LogOut size={13} />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </header>

      {/* ── Tabs (intervenants only see Entreprises tab) ── */}
      {!isDirigeant && (
        <div className="relative z-10 border-b border-navy-700 px-6 md:px-12">
          <div className="flex gap-0">
            {[
              { id: 'stats', label: 'Statistiques', icon: Activity },
              { id: 'companies', label: 'Entreprises', icon: Building2 },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-manrope font-600 border-b-2 transition-all ${
                  tab === id
                    ? 'border-electric text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}>
                <Icon size={14} />
                {label}
                {id === 'stats' && scans !== null && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-600 ${tab === id ? 'bg-electric/20 text-electric' : 'bg-navy-700 text-slate-500'}`}>
                    {filteredScans.length}
                  </span>
                )}
                {id === 'companies' && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-600 ${tab === id ? 'bg-electric/20 text-electric' : 'bg-navy-700 text-slate-500'}`}>
                    {companies.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-navy-600 border-t-electric rounded-full animate-spin" />
            <span className="text-slate-500 font-manrope text-sm">Chargement des données…</span>
          </div>
        </div>
      ) : (
        <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-8"
          style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }}>

          {/* ════ TAB: STATS ════ */}
          {tab === 'stats' && (
            <div className="space-y-6">

              {/* Filter bar */}
              <div className="glass rounded-2xl p-4">
                <div className="flex flex-wrap gap-3 items-center">
                  {/* Search */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                      placeholder="Rechercher par entreprise ou email…"
                      className="w-full bg-navy-800 border border-navy-600 focus:border-electric rounded-xl pl-9 pr-4 py-2.5 text-white font-manrope text-sm placeholder:text-slate-600 focus:outline-none transition-all" />
                  </div>

                  {/* Company filter — hidden for dirigeants (auto-locked to their company) */}
                  {!isDirigeant ? (
                    <select value={companyFilter} onChange={e => { setCompanyFilter(e.target.value); setPage(1) }}
                      className="bg-navy-800 border border-navy-600 focus:border-electric rounded-xl px-4 py-2.5 text-sm font-manrope text-white focus:outline-none transition-all cursor-pointer">
                      <option value="all">Toutes les entreprises</option>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-800 border border-electric/20 text-electric text-sm font-manrope">
                      <Building2 size={13} />
                      {authUser?.companyName}
                    </div>
                  )}

                  {/* Profile filter */}
                  <select value={profileFilter} onChange={e => { setProfileFilter(e.target.value); setPage(1) }}
                    className="bg-navy-800 border border-navy-600 focus:border-electric rounded-xl px-4 py-2.5 text-sm font-manrope text-white focus:outline-none transition-all cursor-pointer">
                    <option value="all">Tous les profils</option>
                    <option value="collaborateur">Collaborateur</option>
                    <option value="manager">Manager</option>
                    <option value="directeur">Directeur</option>
                  </select>

                  {/* Spacer */}
                  <div className="flex-1 hidden lg:block" />

                  {/* Exports */}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs font-manrope hidden sm:block">Export :</span>
                    <button onClick={() => exportCSV(filteredScans)} disabled={!filteredScans.length}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-navy-600 text-slate-400 hover:text-white hover:border-cyan-scan/40 text-xs font-manrope transition-all disabled:opacity-30">
                      <FileText size={12} className="text-cyan-scan" /> CSV
                    </button>
                    <button onClick={() => exportJSON(filteredScans)} disabled={!filteredScans.length}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-navy-600 text-slate-400 hover:text-white hover:border-electric/40 text-xs font-manrope transition-all disabled:opacity-30">
                      <FileJson size={12} className="text-electric" /> JSON
                    </button>
                  </div>
                </div>

                {/* Active filters summary */}
                {(companyFilter !== 'all' || profileFilter !== 'all' || search) && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-navy-700">
                    <span className="text-slate-500 text-xs font-manrope">Filtres actifs :</span>
                    {companyFilter !== 'all' && (
                      <span className="px-2 py-0.5 rounded-full bg-electric/15 text-electric text-xs font-manrope font-600 cursor-pointer" onClick={() => setCompanyFilter('all')}>
                        {companies.find(c => c.id === companyFilter)?.name ?? companyFilter} ×
                      </span>
                    )}
                    {profileFilter !== 'all' && (
                      <span className="px-2 py-0.5 rounded-full bg-electric/15 text-electric text-xs font-manrope font-600 cursor-pointer" onClick={() => setProfileFilter('all')}>
                        {PROFILE_LABELS[profileFilter]} ×
                      </span>
                    )}
                    {search && (
                      <span className="px-2 py-0.5 rounded-full bg-electric/15 text-electric text-xs font-manrope font-600 cursor-pointer" onClick={() => setSearch('')}>
                        "{search}" ×
                      </span>
                    )}
                    <button onClick={() => { setCompanyFilter('all'); setProfileFilter('all'); setSearch('') }}
                      className="text-slate-500 hover:text-red-400 text-xs font-manrope ml-1 transition-colors">
                      Tout effacer
                    </button>
                  </div>
                )}
              </div>

              {/* No results */}
              {filteredScans.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <Activity size={28} className="text-navy-600 mx-auto mb-3" />
                    <p className="text-slate-400 font-manrope text-sm">
                      {scans?.length === 0 ? 'Aucun scan soumis pour le moment.' : 'Aucun résultat pour ces filtres.'}
                    </p>
                    {!usingMock && scans?.length === 0 && (
                      <div className="mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-cyan-scan/10 border border-cyan-scan/20 mx-auto w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-scan animate-pulse" />
                        <span className="text-cyan-scan text-xs font-manrope font-600">Base de données opérationnelle</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* KPI row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard icon={Users} label="Scans filtrés" value={filteredScans.length}
                      sub={`sur ${scans?.length ?? 0} total`} color="#3B82F6" />
                    <KpiCard icon={Activity} label="Score moyen"
                      value={stats ? `${stats.globalAvg} / 9` : '—'}
                      sub={stats ? plasticityLevel(stats.globalAvg).label : ''}
                      color={stats ? plasticityLevel(stats.globalAvg).color : '#64748B'} />
                    <KpiCard icon={TrendingUp} label="Dim. la + forte"
                      value={stats ? [...stats.dimAvgs].sort((a,b)=>b.avg-a.avg)[0].shortName : '—'}
                      sub={stats ? `Moy. ${[...stats.dimAvgs].sort((a,b)=>b.avg-a.avg)[0].avg}/9` : ''}
                      color="#14B8A6" />
                    <KpiCard icon={Award} label="Levier dominant"
                      value={stats?.leverData[0]?.name ?? '—'}
                      sub={stats ? `${stats.leverData[0]?.count ?? 0} occurrences` : ''}
                      color={LEVER_COLORS[stats?.leverData[0]?.name] ?? '#64748B'} />
                  </div>

                  {/* Charts row */}
                  {stats && (
                    <div className="grid lg:grid-cols-2 gap-6">
                      {/* Radar */}
                      <div className="glass rounded-2xl p-6 glow-teal">
                        <h2 className="font-syne font-700 text-white text-base mb-1">Profil moyen</h2>
                        <p className="text-slate-500 text-xs font-manrope mb-4">Scores moyens par dimension</p>
                        <div style={{ height: 280 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                              <PolarGrid stroke="rgba(59,130,246,0.15)" gridType="polygon" />
                              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'Manrope' }} />
                              <PolarRadiusAxis angle={90} domain={[0, 9]} tickCount={4} tick={{ fontSize: 8, fill: '#475569' }} axisLine={false} />
                              <Radar dataKey="score" stroke="#3B82F6" strokeWidth={2} fill="url(#dashRadar)" fillOpacity={0.45} />
                              <defs>
                                <radialGradient id="dashRadar" cx="50%" cy="50%" r="50%">
                                  <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.7} />
                                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.2} />
                                </radialGradient>
                              </defs>
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Bars + Profile donut */}
                      <div className="space-y-4">
                        {/* Bars */}
                        <div className="glass rounded-2xl p-5 glow-blue" style={{ height: 200 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 4 }}>
                              <XAxis type="number" domain={[0, 9]} tick={{ fontSize: 9, fill: '#475569' }} axisLine={false} tickLine={false} />
                              <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#94A3B8', fontFamily: 'Manrope' }} axisLine={false} tickLine={false} width={68} />
                              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(59,130,246,0.06)' }} />
                              <Bar dataKey="score" radius={[0, 5, 5, 0]} maxBarSize={14}>
                                {barData.map((e, i) => <Cell key={i} fill={e.fill} fillOpacity={0.85} />)}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Profile distribution */}
                        <div className="glass rounded-2xl p-4 flex items-center gap-5">
                          <div style={{ width: 100, height: 100, flexShrink: 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={stats.profileData} dataKey="value" innerRadius={30} outerRadius={46} paddingAngle={3}>
                                  {stats.profileData.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="space-y-2 flex-1">
                            {stats.profileData.map(p => (
                              <div key={p.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                                  <span className="text-slate-300 text-xs font-manrope">{p.name}</span>
                                </div>
                                <span className="text-white font-syne font-700 text-sm">{p.value} <span className="text-slate-500 font-manrope text-[10px]">({p.pct}%)</span></span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Sortable table ── */}
                  <div className="glass rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-navy-700 flex items-center justify-between">
                      <div>
                        <h2 className="font-syne font-700 text-white text-base">Réponses détaillées</h2>
                        <p className="text-slate-500 text-xs font-manrope">
                          {filteredScans.length} résultat{filteredScans.length !== 1 ? 's' : ''}
                          {filteredScans.length > PAGE_SIZE && ` · page ${page}/${totalPages}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => exportCSV(filteredScans)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-navy-600 text-slate-400 hover:text-cyan-scan hover:border-cyan-scan/40 text-xs font-manrope transition-all">
                          <Download size={11} /> CSV
                        </button>
                        <button onClick={() => exportJSON(filteredScans)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-navy-600 text-slate-400 hover:text-electric hover:border-electric/40 text-xs font-manrope transition-all">
                          <Download size={11} /> JSON
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm font-manrope">
                        <thead>
                          <tr className="border-b border-navy-700">
                            {[
                              { key: 'company',      label: 'Entreprise' },
                              { key: 'email',        label: 'Email' },
                              { key: 'profile',      label: 'Profil' },
                              { key: 'global_score', label: 'Score' },
                              { key: null,           label: 'Niveau' },
                              { key: 'created_at',   label: 'Date' },
                            ].map(({ key, label }) => (
                              <th key={label}
                                onClick={() => key && toggleSort(key)}
                                className={`text-left text-[10px] font-600 uppercase tracking-widest text-slate-500 px-5 py-3 ${key ? 'cursor-pointer hover:text-slate-300 select-none' : ''}`}>
                                <div className="flex items-center gap-1.5">
                                  {label}
                                  {key && <SortIcon field={key} sort={sort} />}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {pagedScans.map((sc, i) => {
                            const gs = sc.global_score ?? 0
                            return (
                              <tr key={sc.id ?? i} className="border-b border-navy-700/40 hover:bg-navy-800/40 transition-colors">
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-electric/10 flex items-center justify-center flex-shrink-0">
                                      <span className="text-electric font-syne font-700 text-[10px]">
                                        {(sc.company ?? '?').slice(0, 2).toUpperCase()}
                                      </span>
                                    </div>
                                    <span className="text-white font-500 truncate max-w-[120px]">{sc.company ?? '—'}</span>
                                  </div>
                                </td>
                                <td className="px-5 py-3 text-slate-400 text-xs truncate max-w-[160px]">{sc.email ?? '—'}</td>
                                <td className="px-5 py-3">
                                  <span className="text-xs px-2 py-0.5 rounded-full font-600"
                                    style={{ background: (PROFILE_COLORS[sc.profile] ?? '#64748B') + '18', color: PROFILE_COLORS[sc.profile] ?? '#94A3B8' }}>
                                    {PROFILE_LABELS[sc.profile] ?? sc.profile ?? '—'}
                                  </span>
                                </td>
                                <td className="px-5 py-3">
                                  <span className="font-syne font-700" style={{ color: plasticityLevel(gs).color }}>
                                    {gs.toFixed(1)}
                                  </span>
                                  <span className="text-slate-600 text-xs"> /9</span>
                                </td>
                                <td className="px-5 py-3"><ScorePill score={gs} /></td>
                                <td className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">
                                  {sc.created_at ? new Date(sc.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="px-6 py-4 border-t border-navy-700 flex items-center justify-between">
                        <span className="text-slate-500 text-xs font-manrope">
                          {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredScans.length)} sur {filteredScans.length}
                        </span>
                        <div className="flex gap-2">
                          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            className="px-3 py-1.5 rounded-lg border border-navy-600 text-slate-400 hover:text-white text-xs font-manrope transition-all disabled:opacity-30">
                            ← Préc.
                          </button>
                          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                            className="px-3 py-1.5 rounded-lg border border-navy-600 text-slate-400 hover:text-white text-xs font-manrope transition-all disabled:opacity-30">
                            Suiv. →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ════ TAB: COMPANIES ════ */}
          {tab === 'companies' && !isDirigeant && (
            <CompanyManager
              companies={companies}
              onRefresh={() => getCompanies().then(r => { if (!r.error) setCompanies(r.data ?? []) })}
            />
          )}

        </main>
      )}
    </div>
  )
}
