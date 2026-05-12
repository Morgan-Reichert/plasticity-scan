import { useEffect, useState } from 'react'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  PolarRadiusAxis,
} from 'recharts'
import { RotateCcw, TrendingUp, AlertTriangle, CheckCircle, Info, Users } from 'lucide-react'
import { computeScores, identifyLevers, leverDescriptions, plasticityLevel, computeLevelScores, getSystemicNarrative, levelMeta, dimensions } from '../surveyData'
import { saveSession, getCompanyScans } from '../supabaseClient'

function ScoreIcon({ score }) {
  if (score >= 7) return <CheckCircle size={14} className="text-cyan-scan" />
  if (score >= 4) return <TrendingUp size={14} className="text-amber-400" />
  return <AlertTriangle size={14} className="text-red-400" />
}

const CustomAngleAxis = ({ payload, x, y, cx, cy, ...rest }) => {
  const isLeft = x < cx
  return (
    <text
      x={x}
      y={y}
      textAnchor={isLeft ? 'end' : x === cx ? 'middle' : 'start'}
      dominantBaseline="central"
      className="font-manrope"
      fontSize={10}
      fill="#94A3B8"
    >
      {payload.value}
    </text>
  )
}

/* ── Compute company-wide aggregated scores from raw scans ── */
function computeCompanyStats(scans) {
  if (!scans || scans.length === 0) return null
  const n = scans.length
  const dimAvgs = dimensions.map((dim, i) => {
    const avg = scans.reduce((s, sc) => {
      const raw = sc.scores ?? []
      const v = Array.isArray(raw) ? (raw[i] ?? 0) : 0
      return s + (typeof v === 'object' ? v.score ?? 0 : v)
    }, 0) / n
    return { ...dim, avg: parseFloat(avg.toFixed(1)) }
  })
  const globalAvg = dimAvgs.reduce((s, d) => s + d.avg, 0) / dimAvgs.length
  return { n, dimAvgs, globalAvg: parseFloat(globalAvg.toFixed(1)) }
}

export default function ResultsPage({ userData, responses, onRestart, isDemo }) {
  const [visible, setVisible] = useState(false)
  const [companyScans, setCompanyScans] = useState([])
  const [loadingCompany, setLoadingCompany] = useState(false)
  const [displayScore, setDisplayScore] = useState(0)

  const scores = computeScores(responses)
  const globalAvg = scores.reduce((s, d) => s + d.score, 0) / scores.length
  const level = plasticityLevel(globalAvg)
  const levers = identifyLevers(scores)
  const levelScores = computeLevelScores(responses)
  const narrative = getSystemicNarrative(levelScores)

  const radarData = scores.map((d) => ({
    dimension: d.shortName,
    score: d.score,
    fullMark: 9,
  }))

  /* ── Demo auto-scroll ── */
  useEffect(() => {
    if (!isDemo) return
    // Smooth scroll down after score reveal
    const t1 = setTimeout(() => window.scrollTo({ top: 500,  behavior: 'smooth' }), 4000)
    const t2 = setTimeout(() => window.scrollTo({ top: 1100, behavior: 'smooth' }), 7500)
    const t3 = setTimeout(() => window.scrollTo({ top: 1800, behavior: 'smooth' }), 11000)
    const t4 = setTimeout(() => window.scrollTo({ top: 2400, behavior: 'smooth' }), 14000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [isDemo])

  /* ── Score count-up animation ── */
  useEffect(() => {
    const target = parseFloat(globalAvg.toFixed(1))
    const duration = 1800
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current = Math.min(current + increment, target)
      setDisplayScore(parseFloat(current.toFixed(1)))
      if (current >= target) clearInterval(timer)
    }, duration / steps)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    const doSave = async () => {
      await saveSession({
        company: userData?.company,
        company_id: userData?.companyId ?? null,
        email: userData?.email,
        profile: userData?.profile,
        responses,
        scores: scores.map(({ id, name, score }) => ({ id, name, score })),
        global_score: parseFloat(globalAvg.toFixed(2)),
        status: 'completed',
      })
      // After saving, fetch all company scans for aggregated view
      if (userData?.companyId) {
        setLoadingCompany(true)
        const { data } = await getCompanyScans(userData.companyId)
        setCompanyScans(data ?? [])
        setLoadingCompany(false)
      }
    }
    doSave()
    return () => clearTimeout(t)
  }, [])

  const companyStats = computeCompanyStats(companyScans)
  const companyRadarData = companyStats?.dimAvgs.map(d => ({ dimension: d.shortName, score: d.avg, fullMark: 9 }))

  return (
    <div className="min-h-screen mesh-bg dot-grid">
      {/* Ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 w-full h-full"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, rgba(59,130,246,0.06) 0%, transparent 60%),
                       radial-gradient(ellipse at 75% 80%, rgba(20,184,166,0.05) 0%, transparent 55%)`,
        }}
      />

      {/* ── Header ── */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-navy-700">
        <span className="font-syne font-700 text-white text-sm tracking-[0.15em] uppercase">
          Plasticity Scan<sup className="text-electric text-[10px]">®</sup>
        </span>
        <button
          onClick={onRestart}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-manrope transition-colors"
        >
          <RotateCcw size={14} />
          Nouveau diagnostic
        </button>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-12 space-y-10">

        {/* ── Title block ── */}
        <div
          className="text-center"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.6s ease' }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4"
            style={{ background: 'rgba(20,184,166,0.1)', borderColor: 'rgba(20,184,166,0.3)' }}>
            <Users size={11} className="text-cyan-scan" />
            <span className="text-[11px] font-manrope font-600 uppercase tracking-widest text-cyan-scan">
              Évaluation collective — {userData?.company}
            </span>
          </div>
          <h1 className="font-syne font-800 text-3xl md:text-4xl text-white mb-2">
            Résultats Plasticity Scan®
          </h1>
          <p className="text-slate-400 font-manrope text-sm">
            Votre profil : <span className="text-white capitalize">{userData?.profile}</span>
            {userData?.email && (
              <> · <span className="text-slate-500">{userData.email}</span></>
            )}
          </p>
        </div>

        {/* ── Company-wide results ── */}
        {userData?.companyId && (
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.7s ease 0.1s' }}>

            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-navy-700" />
              <h2 className="font-syne font-700 text-white text-lg whitespace-nowrap flex items-center gap-2">
                <Users size={16} className="text-cyan-scan" />
                Vision collective — {userData?.company}
              </h2>
              <div className="h-px flex-1 bg-navy-700" />
            </div>

            {loadingCompany ? (
              <div className="glass rounded-2xl p-8 flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-navy-600 border-t-electric rounded-full animate-spin" />
                <span className="text-slate-500 font-manrope text-sm">Chargement des données entreprise…</span>
              </div>
            ) : companyStats ? (
              <div className="grid md:grid-cols-[160px_1fr] gap-6 items-center">
                {/* Company global score */}
                <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center text-center glow-teal md:self-stretch">
                  <span className="text-slate-400 text-[11px] font-manrope font-600 uppercase tracking-widest mb-2">
                    Score entreprise
                  </span>
                  <span className="font-syne font-800 text-5xl leading-none mb-1"
                    style={{ color: plasticityLevel(companyStats.globalAvg).color }}>
                    {companyStats.globalAvg}
                  </span>
                  <span className="text-slate-500 font-manrope text-sm mb-3">/ 9</span>
                  <div className="w-full bg-navy-700 rounded-full h-1.5 overflow-hidden mb-3">
                    <div className="h-full rounded-full"
                      style={{
                        width: visible ? `${(companyStats.globalAvg / 9) * 100}%` : '0%',
                        background: 'linear-gradient(to right, #3B82F6, #14B8A6)',
                        transition: 'width 1.2s ease 0.5s',
                      }} />
                  </div>
                  <span className="text-[10px] font-manrope font-600 uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: plasticityLevel(companyStats.globalAvg).color + '20', color: plasticityLevel(companyStats.globalAvg).color }}>
                    {plasticityLevel(companyStats.globalAvg).label}
                  </span>
                  <p className="text-slate-600 text-[11px] font-manrope mt-3">
                    {companyStats.n} réponse{companyStats.n > 1 ? 's' : ''}
                  </p>
                </div>

                {/* Company radar */}
                <div className="glass rounded-2xl p-4 glow-teal" style={{ height: 300 }}>
                  <p className="text-[10px] font-manrope font-600 uppercase tracking-widest text-slate-500 mb-1 px-2">
                    Profil moyen — {userData?.company}
                  </p>
                  <ResponsiveContainer width="100%" height="90%">
                    <RadarChart data={companyRadarData} margin={{ top: 10, right: 24, bottom: 10, left: 24 }}>
                      <PolarGrid stroke="rgba(20,184,166,0.15)" gridType="polygon" />
                      <PolarAngleAxis dataKey="dimension" tick={<CustomAngleAxis />} />
                      <PolarRadiusAxis angle={90} domain={[0, 9]} tickCount={4}
                        tick={{ fontSize: 9, fill: '#475569' }} axisLine={false} />
                      <Radar dataKey="score" stroke="#14B8A6" strokeWidth={2}
                        fill="url(#companyRadarFill)" fillOpacity={0.4} />
                      <defs>
                        <radialGradient id="companyRadarFill" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.7} />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.15} />
                        </radialGradient>
                      </defs>
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="glass rounded-2xl px-6 py-8 text-center">
                <Users size={24} className="text-navy-600 mx-auto mb-2" />
                <p className="text-slate-500 font-manrope text-sm">
                  Vous êtes le premier à compléter ce diagnostic pour {userData?.company}.<br />
                  Les données collectives s'afficheront dès qu'il y aura plusieurs réponses.
                </p>
              </div>
            )}

            {/* Dimension comparison bar — only if company data available */}
            {companyStats && (
              <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {companyStats.dimAvgs.map((dim) => {
                  const personal = scores.find(s => s.id === dim.id)
                  return (
                    <div key={dim.id} className="glass-light rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-[10px] font-manrope font-600 uppercase tracking-widest text-slate-500 mb-0.5">
                            Dim. {dim.id}
                          </div>
                          <div className="font-manrope font-600 text-white text-sm leading-tight">
                            {dim.shortName}
                          </div>
                        </div>
                        <span className="font-syne font-700 text-lg" style={{ color: dim.color }}>
                          {dim.avg}
                        </span>
                      </div>
                      {/* Company bar */}
                      <div className="mb-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[9px] font-manrope text-slate-600 uppercase tracking-wider">Collectif</span>
                          <span className="text-[9px] font-manrope text-slate-500">{dim.avg}/9</span>
                        </div>
                        <div className="h-1 bg-navy-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full"
                            style={{ width: visible ? `${(dim.avg / 9) * 100}%` : '0%', background: dim.color, transition: `width 0.8s ease ${0.4 + dim.id * 0.06}s`, opacity: 0.85 }} />
                        </div>
                      </div>
                      {/* Personal bar */}
                      {personal && (
                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[9px] font-manrope text-slate-600 uppercase tracking-wider">Vous</span>
                            <span className="text-[9px] font-manrope text-slate-500">{personal.score}/9</span>
                          </div>
                          <div className="h-1 bg-navy-700 rounded-full overflow-hidden">
                            <div className="h-full rounded-full"
                              style={{ width: visible ? `${(personal.score / 9) * 100}%` : '0%', background: '#64748B', transition: `width 0.8s ease ${0.5 + dim.id * 0.06}s`, opacity: 0.6 }} />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Separator before personal results ── */}
        {userData?.companyId && companyStats && (
          <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease 0.3s' }}>
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-navy-700" />
              <p className="text-slate-500 text-[11px] font-manrope font-600 uppercase tracking-widest whitespace-nowrap">
                Votre contribution personnelle
              </p>
              <div className="h-px flex-1 bg-navy-700" />
            </div>
          </div>
        )}

        {/* ── Score hero + Radar ── */}
        <div
          className="grid md:grid-cols-[160px_1fr] gap-6 items-center"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'all 0.7s ease 0.15s' }}
        >
          {/* Global score */}
          <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center text-center glow-blue md:self-stretch">
            <span className="text-slate-400 text-[11px] font-manrope font-600 uppercase tracking-widest mb-3">
              Score global
            </span>
            <span
              className="font-syne font-800 text-6xl leading-none mb-1 tabular-nums"
              style={{ color: level.color, transition: 'color 0.3s' }}
            >
              {displayScore.toFixed(1)}
            </span>
            <span className="text-slate-500 font-manrope text-sm">/ 9</span>
            <div className="mt-4 w-full bg-navy-700 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: visible ? `${(globalAvg / 9) * 100}%` : '0%',
                  background: `linear-gradient(to right, #3B82F6, ${level.color})`,
                  transition: 'width 1.2s ease 0.4s',
                }}
              />
            </div>
          </div>

          {/* Radar */}
          <div className="glass rounded-2xl p-4 glow-teal" style={{ height: 340 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 16, right: 24, bottom: 16, left: 24 }}>
                <PolarGrid stroke="rgba(59,130,246,0.15)" gridType="polygon" />
                <PolarAngleAxis dataKey="dimension" tick={<CustomAngleAxis />} />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 9]}
                  tickCount={4}
                  tick={{ fontSize: 9, fill: '#475569' }}
                  axisLine={false}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#radarFill)"
                  fillOpacity={0.4}
                />
                <defs>
                  <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.2} />
                  </radialGradient>
                </defs>
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Dimension scores ── */}
        <div
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'all 0.7s ease 0.25s' }}
        >
          <h2 className="font-syne font-700 text-white text-lg mb-4">
            Scores par dimension
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {scores.map((dim) => {
              const pct = (dim.score / 9) * 100
              return (
                <div key={dim.id} className="glass-light rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-[10px] font-manrope font-600 uppercase tracking-widest text-slate-500 mb-0.5">
                        Dim. {dim.id}
                      </div>
                      <div className="font-manrope font-600 text-white text-sm leading-tight">
                        {dim.shortName}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ScoreIcon score={dim.score} />
                      <span className="font-syne font-700 text-lg" style={{ color: dim.color }}>
                        {dim.score}
                      </span>
                    </div>
                  </div>
                  <div className="h-1 bg-navy-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: visible ? `${pct}%` : '0%',
                        background: dim.color,
                        transition: `width 0.8s ease ${0.3 + dim.id * 0.07}s`,
                        opacity: 0.85,
                      }}
                    />
                  </div>
                  <div className="mt-2 text-[10px] font-manrope text-slate-600 uppercase tracking-wider">
                    Levier · {dim.lever}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Lecture systémique 3 niveaux ── */}
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'all 0.7s ease 0.3s' }}>

          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-navy-700" />
            <h2 className="font-syne font-700 text-white text-lg whitespace-nowrap flex items-center gap-2">
              Lecture systémique
              <span className="text-[10px] font-manrope font-400 text-slate-500 normal-case tracking-normal">— 3 niveaux</span>
            </h2>
            <div className="h-px flex-1 bg-navy-700" />
          </div>

          {/* 3 level score cards */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            {Object.values(levelMeta).map((meta) => {
              const score = levelScores[meta.key]
              const lv = plasticityLevel(score)
              return (
                <div key={meta.key} className="glass rounded-2xl p-5 relative overflow-hidden"
                  style={{ borderColor: `${meta.color}25` }}>
                  <div className="absolute top-0 left-0 right-0 h-0.5"
                    style={{ background: `linear-gradient(to right, ${meta.color}, transparent)` }} />
                  <div className="text-2xl mb-2">{meta.symbol}</div>
                  <p className="text-[10px] font-manrope font-600 uppercase tracking-widest mb-1"
                    style={{ color: meta.color }}>
                    {meta.label}
                  </p>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="font-syne font-800 text-3xl leading-none" style={{ color: lv.color }}>
                      {score.toFixed(1)}
                    </span>
                    <span className="text-slate-600 text-xs font-manrope mb-0.5">/9</span>
                  </div>
                  <div className="h-1 bg-navy-700 rounded-full overflow-hidden mb-3">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: visible ? `${(score / 9) * 100}%` : '0%',
                        background: meta.color,
                        transition: 'width 1s ease 0.5s',
                        opacity: 0.85,
                      }} />
                  </div>
                  <p className="text-[11px] font-manrope text-slate-500 leading-snug hidden sm:block">
                    {meta.description}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Narrative tension block */}
          <div className="glass rounded-2xl p-6 relative overflow-hidden"
            style={{
              borderColor: narrative.urgency === 'critical' ? 'rgba(239,68,68,0.3)'
                : narrative.urgency === 'high'   ? 'rgba(245,158,11,0.3)'
                : narrative.urgency === 'low'    ? 'rgba(20,184,166,0.3)'
                : 'rgba(59,130,246,0.2)',
            }}>
            <div className="absolute top-0 left-0 right-0 h-0.5"
              style={{
                background: narrative.urgency === 'critical' ? 'linear-gradient(to right,#EF4444,transparent)'
                  : narrative.urgency === 'high'   ? 'linear-gradient(to right,#F59E0B,transparent)'
                  : narrative.urgency === 'low'    ? 'linear-gradient(to right,#14B8A6,transparent)'
                  : 'linear-gradient(to right,#3B82F6,transparent)',
              }} />
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: narrative.urgency === 'critical' ? 'rgba(239,68,68,0.12)'
                      : narrative.urgency === 'high'   ? 'rgba(245,158,11,0.12)'
                      : narrative.urgency === 'low'    ? 'rgba(20,184,166,0.12)'
                      : 'rgba(59,130,246,0.12)',
                  }}>
                  <Info size={15} style={{
                    color: narrative.urgency === 'critical' ? '#EF4444'
                      : narrative.urgency === 'high'   ? '#F59E0B'
                      : narrative.urgency === 'low'    ? '#14B8A6'
                      : '#3B82F6',
                  }} />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-syne font-700 text-white text-base mb-2">{narrative.tension}</p>
                <p className="font-manrope text-sm text-slate-400 leading-relaxed">{narrative.text}</p>
              </div>
            </div>
          </div>

          {/* POC disclaimer */}
          <div className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-800 border border-navy-700">
            <span className="w-1 h-1 rounded-full bg-slate-600 flex-shrink-0" />
            <p className="text-[11px] font-manrope text-slate-600 leading-relaxed">
              <span className="text-slate-500 font-600">Lecture indicative · Version POC</span>
              {' '}— Basée sur {Object.values(levelMeta).reduce((a, m) => a + m.questionCount, 0)} questions (distribution variable par niveau).
              La version complète mobilisera 3 questions par niveau par dimension pour une fiabilité optimale.
            </p>
          </div>
        </div>

        {/* ── Diagnostic levers ── */}
        <div
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'all 0.7s ease 0.35s' }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-navy-700" />
            <h2 className="font-syne font-700 text-white text-lg whitespace-nowrap">
              Leviers d'action identifiés
            </h2>
            <div className="h-px flex-1 bg-navy-700" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {levers.map((dim, idx) => {
              const info = leverDescriptions[dim.lever]
              return (
                <div
                  key={dim.lever}
                  className="glass rounded-2xl p-6 relative overflow-hidden"
                  style={{ borderColor: `${dim.color}30` }}
                >
                  {/* accent strip */}
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5"
                    style={{ background: `linear-gradient(to right, ${dim.color}, transparent)` }}
                  />
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="text-[11px] font-manrope font-600 uppercase tracking-widest px-2 py-0.5 rounded"
                      style={{ background: `${dim.color}18`, color: dim.color }}
                    >
                      #{idx + 1} prioritaire
                    </span>
                  </div>
                  <h3 className="font-syne font-700 text-white text-base mb-2">{info.title}</h3>
                  <p className="text-slate-400 font-manrope text-sm leading-relaxed mb-4">
                    {info.description}
                  </p>
                  <div className="border-t border-navy-600 pt-3">
                    <p className="text-xs font-manrope text-slate-500 leading-relaxed">
                      <span className="text-cyan-scan font-600">Action · </span>
                      {info.action}
                    </p>
                  </div>
                  <div className="mt-3 text-[11px] font-manrope text-slate-600">
                    Dimensison concernée :&nbsp;
                    <span style={{ color: dim.color }}>{dim.name}</span>
                    &nbsp;({dim.score}/9)
                  </div>
                </div>
              )
            })}
          </div>
        </div>


      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 text-center py-8 border-t border-navy-700 mt-8">
        <p className="text-slate-600 text-xs font-manrope">
          Plasticity Scan<sup className="text-[8px]">®</sup> — Diagnostic Systémique · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  )
}
