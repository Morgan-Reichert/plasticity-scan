import { useEffect, useState } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  PieChart, Pie,
} from 'recharts'
import { Activity, Users, TrendingUp, Award, RefreshCw, ArrowLeft, AlertCircle } from 'lucide-react'
import { supabase } from '../supabaseClient'
import { dimensions, plasticityLevel } from '../surveyData'

/* ── Mock data (used when Supabase is not configured) ── */
const MOCK = [
  { company: 'Acme Corp', profile: 'manager', global_score: 6.4, scores: [6,7,5,6,7,6,7] },
  { company: 'TechVision', profile: 'directeur', global_score: 7.1, scores: [8,7,7,6,7,8,7] },
  { company: 'Humanis RH', profile: 'collaborateur', global_score: 3.9, scores: [4,3,4,4,4,3,4] },
  { company: 'Groupe Nexia', profile: 'manager', global_score: 5.5, scores: [5,6,5,5,6,5,6] },
  { company: 'Innova SAS', profile: 'directeur', global_score: 7.8, scores: [8,8,7,8,8,7,8] },
  { company: 'LabCo', profile: 'collaborateur', global_score: 4.2, scores: [4,4,4,5,4,3,5] },
  { company: 'Meridian', profile: 'manager', global_score: 6.0, scores: [6,5,6,6,6,6,6] },
  { company: 'Synapse', profile: 'collaborateur', global_score: 5.1, scores: [5,5,5,5,5,5,5] },
  { company: 'Orbis Group', profile: 'directeur', global_score: 6.7, scores: [7,7,6,6,7,7,6] },
  { company: 'Catalys', profile: 'manager', global_score: 4.8, scores: [5,4,5,5,5,4,5] },
]

const PROFILE_LABELS = { collaborateur: 'Collaborateur', manager: 'Manager', directeur: 'Directeur' }
const PROFILE_COLORS = { collaborateur: '#3B82F6', manager: '#14B8A6', directeur: '#8B5CF6' }

const LEVER_MAP = {
  1: 'Clarté', 2: 'Robustesse', 3: 'Cohérence',
  4: 'Soutenabilité', 5: 'Clarté', 6: 'Soutenabilité', 7: 'Robustesse',
}
const LEVER_COLORS = {
  Clarté: '#3B82F6', Cohérence: '#14B8A6',
  Soutenabilité: '#F59E0B', Robustesse: '#8B5CF6',
}

/* ── Custom tooltip for BarChart ── */
const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs font-manrope">
      <p className="text-slate-300 mb-1">{label}</p>
      <p className="text-white font-600">{payload[0].value.toFixed(1)} / 9</p>
    </div>
  )
}

/* ── Score pill ── */
function ScorePill({ score }) {
  const { label, color } = plasticityLevel(score)
  return (
    <span
      className="text-[10px] font-manrope font-600 uppercase tracking-wider px-2 py-0.5 rounded-full"
      style={{ background: color + '1A', color, border: `1px solid ${color}30` }}
    >
      {label}
    </span>
  )
}

/* ── KPI Card ── */
function KpiCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="glass rounded-2xl p-5 flex items-start gap-4">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: color + '20', border: `1px solid ${color}30` }}
      >
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

/* ── Compute stats from raw scan rows ── */
function computeStats(scans) {
  if (!scans.length) return null

  const n = scans.length

  // Per-dimension averages
  const dimAvgs = dimensions.map((dim, i) => {
    const avg = scans.reduce((s, sc) => {
      const raw = sc.scores ?? []
      const score = Array.isArray(raw) ? (raw[i] ?? 0) : (raw[dim.name] ?? 0)
      return s + (typeof score === 'object' ? score.score ?? 0 : score)
    }, 0) / n
    return { ...dim, avg: parseFloat(avg.toFixed(1)) }
  })

  // Global avg
  const globalAvg = dimAvgs.reduce((s, d) => s + d.avg, 0) / dimAvgs.length

  // Profile distribution
  const profileCounts = {}
  scans.forEach(({ profile }) => {
    profileCounts[profile] = (profileCounts[profile] ?? 0) + 1
  })
  const profileData = Object.entries(profileCounts).map(([k, v]) => ({
    name: PROFILE_LABELS[k] ?? k,
    value: v,
    pct: Math.round((v / n) * 100),
    color: PROFILE_COLORS[k] ?? '#64748B',
  }))

  // Lever frequency (from weakest dimensions per scan)
  const leverCounts = {}
  scans.forEach((sc) => {
    const scores = Array.isArray(sc.scores)
      ? sc.scores
      : dimensions.map((d) => sc.scores?.[d.name] ?? 5)
    const indexed = scores.map((s, i) => ({ i, s: typeof s === 'object' ? s.score ?? 0 : s }))
    indexed.sort((a, b) => a.s - b.s)
    const seen = new Set()
    indexed.slice(0, 3).forEach(({ i }) => {
      const lever = LEVER_MAP[i + 1]
      if (!seen.has(lever)) { seen.add(lever); leverCounts[lever] = (leverCounts[lever] ?? 0) + 1 }
    })
  })
  const leverData = Object.entries(leverCounts)
    .map(([k, v]) => ({ name: k, count: v, color: LEVER_COLORS[k] }))
    .sort((a, b) => b.count - a.count)

  return { n, dimAvgs, globalAvg: parseFloat(globalAvg.toFixed(1)), profileData, leverData }
}

/* ═══ Main Dashboard ════════════════════════════════════════════════════ */
export default function DashboardPage({ onBack }) {
  const [scans, setScans] = useState(null)
  const [loading, setLoading] = useState(true)
  const [usingMock, setUsingMock] = useState(false)
  const [visible, setVisible] = useState(false)

  const fetchScans = async () => {
    setLoading(true)
    if (supabase) {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
      if (error) {
        console.error('Supabase error:', error)
        setScans(MOCK)
        setUsingMock(true)
      } else {
        // Table connectée — on affiche les vraies données même si vides
        setScans(data ?? [])
        setUsingMock(false)
      }
    } else {
      // Pas de Supabase configuré → données démo
      setScans(MOCK)
      setUsingMock(true)
    }
    setLoading(false)
    setTimeout(() => setVisible(true), 80)
  }

  useEffect(() => { fetchScans() }, [])

  const stats = scans ? computeStats(scans) : null

  const radarData = stats?.dimAvgs.map((d) => ({
    dimension: d.shortName,
    score: d.avg,
    fullMark: 9,
  }))

  const barData = stats?.dimAvgs.map((d) => ({
    name: d.shortName,
    score: d.avg,
    fill: d.color,
  }))

  return (
    <div className="min-h-screen mesh-bg dot-grid">
      {/* ambient */}
      <div aria-hidden className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(ellipse at 20% 10%, rgba(139,92,246,0.07) 0%, transparent 55%), radial-gradient(ellipse at 80% 85%, rgba(20,184,166,0.06) 0%, transparent 55%)' }} />

      {/* ── Header ── */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-navy-700">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-manrope transition-colors"
          >
            <ArrowLeft size={15} />
            Retour
          </button>
          <div className="w-px h-5 bg-navy-600" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-scan animate-pulse" />
            <span className="font-syne font-700 text-white text-sm tracking-[0.12em] uppercase">
              Tableau de bord — Intervenants
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {usingMock && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20">
              <AlertCircle size={11} className="text-amber-400" />
              <span className="text-amber-400 text-[10px] font-manrope font-600 uppercase tracking-wider">Données démo</span>
            </div>
          )}
          <button
            onClick={fetchScans}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-navy-600 text-slate-400 hover:text-white hover:border-electric/40 text-sm font-manrope transition-all disabled:opacity-40"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-navy-600 border-t-electric rounded-full animate-spin" />
            <span className="text-slate-500 font-manrope text-sm">Chargement des données…</span>
          </div>
        </div>
      ) : !usingMock && scans?.length === 0 ? (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-5 text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-navy-700 border border-navy-600 flex items-center justify-center">
              <Activity size={28} className="text-slate-600" />
            </div>
            <div>
              <h2 className="font-syne font-700 text-white text-xl mb-2">Aucun scan pour le moment</h2>
              <p className="text-slate-400 font-manrope text-sm leading-relaxed">
                Supabase est connecté ✓<br />
                Les statistiques apparaîtront ici dès que des participants auront complété leur diagnostic.
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-scan/10 border border-cyan-scan/20">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-scan animate-pulse" />
              <span className="text-cyan-scan text-xs font-manrope font-600">Base de données opérationnelle</span>
            </div>
            <button
              onClick={fetchScans}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-navy-600 text-slate-400 hover:text-white hover:border-electric/40 text-sm font-manrope transition-all"
            >
              <RefreshCw size={13} />
              Actualiser
            </button>
          </div>
        </div>
      ) : stats ? (
        <main
          className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-10 space-y-8"
          style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}
        >

          {/* ── KPI row ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              icon={Users}
              label="Scans réalisés"
              value={stats.n}
              sub="réponses collectées"
              color="#3B82F6"
            />
            <KpiCard
              icon={Activity}
              label="Score global moyen"
              value={`${stats.globalAvg} / 9`}
              sub={plasticityLevel(stats.globalAvg).label}
              color={plasticityLevel(stats.globalAvg).color}
            />
            <KpiCard
              icon={TrendingUp}
              label="Dimension la + forte"
              value={[...stats.dimAvgs].sort((a,b) => b.avg - a.avg)[0].shortName}
              sub={`Moy. ${[...stats.dimAvgs].sort((a,b) => b.avg - a.avg)[0].avg} / 9`}
              color="#14B8A6"
            />
            <KpiCard
              icon={Award}
              label="Levier dominant"
              value={stats.leverData[0]?.name ?? '—'}
              sub={`${stats.leverData[0]?.count ?? 0} occurrences`}
              color={LEVER_COLORS[stats.leverData[0]?.name] ?? '#64748B'}
            />
          </div>

          {/* ── Radar + Bars ── */}
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Radar */}
            <div className="glass rounded-2xl p-6 glow-teal">
              <h2 className="font-syne font-700 text-white text-base mb-1">Profil moyen global</h2>
              <p className="text-slate-500 text-xs font-manrope mb-4">Scores moyens par dimension — toutes réponses agrégées</p>
              <div style={{ height: 300 }}>
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

            {/* Bar chart */}
            <div className="glass rounded-2xl p-6 glow-blue">
              <h2 className="font-syne font-700 text-white text-base mb-1">Scores par dimension</h2>
              <p className="text-slate-500 text-xs font-manrope mb-4">Moyenne sur l'ensemble des réponses (/ 9)</p>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
                    <XAxis type="number" domain={[0, 9]} tick={{ fontSize: 9, fill: '#475569' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'Manrope' }} axisLine={false} tickLine={false} width={72} />
                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(59,130,246,0.06)' }} />
                    <Bar dataKey="score" radius={[0, 6, 6, 0]} maxBarSize={20}>
                      {barData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} fillOpacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ── Profile distribution + Levers ── */}
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Profile donut */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-syne font-700 text-white text-base mb-1">Répartition des profils</h2>
              <p className="text-slate-500 text-xs font-manrope mb-4">Distribution des répondants par niveau</p>
              <div className="flex items-center gap-6">
                <div style={{ width: 160, height: 160, flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.profileData} dataKey="value" innerRadius={48} outerRadius={72} paddingAngle={3} startAngle={90} endAngle={450}>
                        {stats.profileData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} stroke="transparent" />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 flex-1">
                  {stats.profileData.map((p) => (
                    <div key={p.name} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
                        <span className="text-slate-300 font-manrope text-sm">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-syne font-700 text-sm">{p.value}</span>
                        <span className="text-slate-500 font-manrope text-xs">({p.pct}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Lever frequency */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-syne font-700 text-white text-base mb-1">Fréquence des leviers</h2>
              <p className="text-slate-500 text-xs font-manrope mb-5">Leviers identifiés le plus souvent comme prioritaires</p>
              <div className="space-y-4">
                {stats.leverData.map((lev) => {
                  const maxCount = stats.leverData[0].count
                  return (
                    <div key={lev.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-white font-manrope font-600 text-sm">{lev.name}</span>
                        <span className="text-slate-400 font-manrope text-xs">{lev.count} scans</span>
                      </div>
                      <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${(lev.count / maxCount) * 100}%`,
                            background: lev.color,
                            opacity: 0.85,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── Recent scans table ── */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-navy-700 flex items-center justify-between">
              <div>
                <h2 className="font-syne font-700 text-white text-base">Réponses récentes</h2>
                <p className="text-slate-500 text-xs font-manrope">
                  {stats.n} scan{stats.n > 1 ? 's' : ''} collecté{stats.n > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-manrope">
                <thead>
                  <tr className="border-b border-navy-700">
                    {['Entreprise', 'Profil', 'Score global', 'Niveau', 'Dimension faible'].map((h) => (
                      <th key={h} className="text-left text-[10px] font-600 uppercase tracking-widest text-slate-500 px-6 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scans.slice(0, 10).map((sc, i) => {
                    const scores = Array.isArray(sc.scores) ? sc.scores : []
                    const weakestIdx = scores.indexOf(Math.min(...scores))
                    const weakestDim = dimensions[weakestIdx]?.shortName ?? '—'
                    const globalScore = sc.global_score ?? (scores.reduce((a, b) => a + (typeof b === 'object' ? b.score ?? 0 : b), 0) / (scores.length || 1))
                    return (
                      <tr key={i} className="border-b border-navy-700/50 hover:bg-navy-800/40 transition-colors">
                        <td className="px-6 py-3 text-white font-500">{sc.company ?? '—'}</td>
                        <td className="px-6 py-3">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-600"
                            style={{
                              background: (PROFILE_COLORS[sc.profile] ?? '#64748B') + '18',
                              color: PROFILE_COLORS[sc.profile] ?? '#94A3B8',
                            }}
                          >
                            {PROFILE_LABELS[sc.profile] ?? sc.profile ?? '—'}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span className="font-syne font-700" style={{ color: plasticityLevel(globalScore).color }}>
                            {typeof globalScore === 'number' ? globalScore.toFixed(1) : '—'}
                          </span>
                          <span className="text-slate-600 text-xs"> / 9</span>
                        </td>
                        <td className="px-6 py-3">
                          <ScorePill score={globalScore} />
                        </td>
                        <td className="px-6 py-3 text-slate-400 text-xs">{weakestDim}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-slate-700 text-xs font-manrope pb-4">
            Plasticity Scan<sup className="text-[9px]">®</sup> · Tableau de bord intervenants · Hackathon HeR Labs 2026 · Sensup
          </p>
        </main>
      ) : null}
    </div>
  )
}
