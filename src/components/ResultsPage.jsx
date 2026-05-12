import { useEffect, useState } from 'react'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  PolarRadiusAxis,
} from 'recharts'
import { ArrowRight, RotateCcw, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { computeScores, identifyLevers, leverDescriptions, plasticityLevel } from '../surveyData'
import { saveSession } from '../supabaseClient'

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

export default function ResultsPage({ userData, responses, onRestart }) {
  const [visible, setVisible] = useState(false)

  const scores = computeScores(responses)
  const globalAvg = scores.reduce((s, d) => s + d.score, 0) / scores.length
  const level = plasticityLevel(globalAvg)
  const levers = identifyLevers(scores)

  const radarData = scores.map((d) => ({
    dimension: d.shortName,
    score: d.score,
    fullMark: 9,
  }))

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    saveSession({
      company: userData?.company,
      email: userData?.email,
      profile: userData?.profile,
      responses,
      scores: scores.map(({ id, name, score }) => ({ id, name, score })),
      global_score: parseFloat(globalAvg.toFixed(2)),
      status: 'completed',
    })
    return () => clearTimeout(t)
  }, [])

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
            style={{ background: level.bg, borderColor: level.color + '40' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: level.color }} />
            <span className="text-[11px] font-manrope font-600 uppercase tracking-widest" style={{ color: level.color }}>
              {level.label}
            </span>
          </div>
          <h1 className="font-syne font-800 text-3xl md:text-4xl text-white mb-2">
            Résultats — {userData?.company}
          </h1>
          <p className="text-slate-400 font-manrope text-sm">
            Profil : <span className="text-white capitalize">{userData?.profile}</span>
            {userData?.email && (
              <> · <span className="text-slate-500">{userData.email}</span></>
            )}
          </p>
        </div>

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
              className="font-syne font-800 text-6xl leading-none mb-1"
              style={{ color: level.color }}
            >
              {globalAvg.toFixed(1)}
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

        {/* ── CTA ── */}
        <div
          className="glass rounded-2xl p-8 text-center glow-blue"
          style={{ opacity: visible ? 1 : 0, transition: 'all 0.7s ease 0.45s' }}
        >
          <p className="text-[11px] font-manrope font-600 uppercase tracking-widest text-slate-500 mb-3">
            Aller plus loin
          </p>
          <h3 className="font-syne font-700 text-white text-2xl mb-3">
            Transformez ces insights en plan d'action
          </h3>
          <p className="text-slate-400 font-manrope text-sm max-w-md mx-auto mb-7 leading-relaxed">
            Un expert Plasticity Scan® analyse vos résultats en détail et co-construit avec vous
            une feuille de route de transformation adaptée à votre contexte.
          </p>
          <button className="inline-flex items-center gap-3 bg-gradient-to-r from-electric to-cyan-scan text-white font-syne font-700 px-8 py-4 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all glow-blue">
            Demander un accompagnement
            <ArrowRight size={18} />
          </button>
          <p className="text-slate-600 text-xs font-manrope mt-4">
            Réponse sous 24h · Entretien découverte gratuit
          </p>
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
