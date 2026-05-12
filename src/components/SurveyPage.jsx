import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { dimensions, levelMeta } from '../surveyData'

const LEVEL_LABELS = {
  individuel:   { label: 'Individuel',    color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)'  },
  equipe:       { label: 'Équipe & BU',   color: '#14B8A6', bg: 'rgba(20,184,166,0.12)',  border: 'rgba(20,184,166,0.3)'  },
  organisation: { label: 'Organisation',  color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)'  },
}

function LevelBadge({ level }) {
  const meta = LEVEL_LABELS[level]
  if (!meta) return null
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-manrope font-600 uppercase tracking-wider px-2 py-1 rounded-full"
      style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
    >
      <span className="w-1 h-1 rounded-full inline-block" style={{ background: meta.color }} />
      Lecture {meta.label}
    </span>
  )
}

function SliderQuestion({ label, questionText, level, value, onChange }) {
  const pct = (value / 9) * 100
  const trackStyle = { '--range-pct': `${pct}%` }

  return (
    <div className="glass-light rounded-2xl p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-manrope font-600 text-slate-500 uppercase tracking-widest">
          {label}
        </p>
        <LevelBadge level={level} />
      </div>

      <p className="font-manrope font-500 text-white text-base leading-relaxed mb-8">
        {questionText}
      </p>

      <div className="relative">
        <input
          type="range" min={0} max={9} step={1}
          value={value} style={trackStyle}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between mt-2 px-0.5">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className={`flex flex-col items-center gap-1 transition-all ${i === value ? 'scale-110' : ''}`}>
              <div className={`w-0.5 h-1.5 rounded-full transition-colors ${i <= value ? 'bg-electric' : 'bg-navy-600'}`} />
              <span className={`text-[10px] font-manrope transition-colors ${i === value ? 'text-electric font-700' : 'text-slate-600'}`}>
                {i}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-3">
        <span className="text-[11px] text-slate-500 font-manrope">Jamais / Pas du tout</span>
        <span className="text-[11px] text-slate-500 font-manrope">Toujours / Complètement</span>
      </div>

      <div className="flex justify-center mt-4">
        <div
          className="px-4 py-1.5 rounded-full font-syne font-700 text-lg transition-all"
          style={{
            background: `rgba(59,130,246,${0.1 + (value / 9) * 0.15})`,
            border: `1px solid rgba(59,130,246,${0.2 + (value / 9) * 0.4})`,
            color: `hsl(${195 + (value / 9) * 25}, 80%, ${55 + (value / 9) * 10}%)`,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  )
}

export default function SurveyPage({ userData, onComplete, isDemo }) {
  const [dimIndex, setDimIndex] = useState(0)
  const [responses, setResponses] = useState({})
  const [transitioning, setTransitioning] = useState(false)
  const cardRef = useRef(null)

  const dim = dimensions[dimIndex]
  const totalDims = dimensions.length
  const overallProgress = ((dimIndex + 1) / totalDims) * 100

  const q0key = `${dim.id}_0`
  const q1key = `${dim.id}_1`
  const q0val = responses[q0key] ?? 5
  const q1val = responses[q1key] ?? 5

  const setQ = (key, val) => setResponses((prev) => ({ ...prev, [key]: val }))

  /* ── Demo mode: animate sliders then auto-advance through 2 dims ── */
  useEffect(() => {
    if (!isDemo) return
    // Animate q0 slider 5→7 over 600ms, then q1 slider 5→8 over 600ms
    let v0 = 5, v1 = 5
    const animQ0 = setInterval(() => {
      v0 = Math.min(v0 + 1, 7)
      setQ(`${dimensions[0].id}_0`, v0)
      if (v0 >= 7) clearInterval(animQ0)
    }, 200)
    const animQ1 = setTimeout(() => {
      const i1 = setInterval(() => {
        v1 = Math.min(v1 + 1, 8)
        setQ(`${dimensions[0].id}_1`, v1)
        if (v1 >= 8) clearInterval(i1)
      }, 200)
    }, 800)
    // advance to dim 2 after 2.5s
    const adv1 = setTimeout(() => {
      setTransitioning(true)
      setTimeout(() => { setDimIndex(1); setTransitioning(false) }, 300)
    }, 2500)
    // animate dim 2 sliders
    const animDim2 = setTimeout(() => {
      let a = 5, b = 5
      const iA = setInterval(() => {
        a = Math.min(a + 1, 6)
        setQ(`${dimensions[1].id}_0`, a)
        if (a >= 6) clearInterval(iA)
      }, 220)
      const iB = setTimeout(() => {
        const iC = setInterval(() => {
          b = Math.min(b + 1, 7)
          setQ(`${dimensions[1].id}_1`, b)
          if (b >= 7) clearInterval(iC)
        }, 220)
      }, 700)
    }, 3300)

    return () => { clearInterval(animQ0); clearTimeout(animQ1); clearTimeout(adv1); clearTimeout(animDim2) }
  }, [isDemo])

  const goNext = () => {
    if (transitioning) return
    setTransitioning(true)
    setTimeout(() => {
      if (dimIndex < totalDims - 1) setDimIndex((i) => i + 1)
      else onComplete(responses)
      setTransitioning(false)
    }, 300)
  }

  const goPrev = () => {
    if (transitioning || dimIndex === 0) return
    setTransitioning(true)
    setTimeout(() => { setDimIndex((i) => i - 1); setTransitioning(false) }, 300)
  }

  const isLast = dimIndex === totalDims - 1

  return (
    <div className="min-h-screen mesh-bg dot-grid flex flex-col">

      {/* ── Top bar ── */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-navy-700">
        <span className="font-syne font-700 text-white text-sm tracking-[0.15em] uppercase opacity-80">
          Plasticity Scan<sup className="text-electric text-[10px]">®</sup>
        </span>
        <span className="text-slate-500 text-sm font-manrope">
          Dimension <span className="text-white font-600">{dimIndex + 1}</span> / {totalDims}
        </span>
      </header>

      {/* ── Progress bar ── */}
      <div className="h-1 bg-navy-700 flex-shrink-0">
        <div className="h-full bg-gradient-to-r from-electric to-cyan-scan transition-all duration-500 ease-out"
          style={{ width: `${overallProgress}%` }} />
      </div>

      {/* ── Content ── */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-10 max-w-2xl mx-auto w-full">

        {/* Dimension header */}
        <div className="w-full mb-6 text-center"
          style={{ opacity: transitioning ? 0 : 1, transform: transitioning ? 'translateY(-10px)' : 'translateY(0)', transition: 'all 0.3s ease' }}>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-5">
            {dimensions.map((_, i) => (
              <div key={i} className="rounded-full transition-all duration-300"
                style={{ width: i === dimIndex ? 20 : 6, height: 6,
                  background: i < dimIndex ? '#14B8A6' : i === dimIndex ? '#3B82F6' : '#1E293B' }} />
            ))}
          </div>

          <div className="inline-block px-3 py-1 rounded-full text-[11px] font-manrope font-600 uppercase tracking-widest mb-3"
            style={{ background: `${dim.color}18`, color: dim.color, border: `1px solid ${dim.color}30` }}>
            Dimension {dim.id} · {dim.shortName}
          </div>

          <h2 className="font-syne font-700 text-white text-2xl md:text-3xl mb-4">{dim.name}</h2>

          {/* Systemic intro */}
          <div className="glass-light rounded-xl px-5 py-4 text-left mb-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full rounded-l-xl"
              style={{ background: `linear-gradient(to bottom, ${dim.color}, transparent)` }} />
            <p className="text-[11px] font-manrope font-600 uppercase tracking-widest mb-2 flex items-center gap-2"
              style={{ color: dim.color }}>
              <span className="w-1 h-1 rounded-full inline-block" style={{ background: dim.color }} />
              Lecture systémique
            </p>
            <p className="text-slate-400 font-manrope text-sm leading-relaxed">
              {dim.systemicIntro}
            </p>

            {/* Level indicators for this dimension */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-navy-700">
              <span className="text-[10px] text-slate-600 font-manrope uppercase tracking-wider">Niveaux évalués :</span>
              {dim.questionLevels.map((level) => (
                <LevelBadge key={level} level={level} />
              ))}
            </div>
          </div>
        </div>

        {/* Questions */}
        <div ref={cardRef} className="w-full space-y-4"
          style={{ opacity: transitioning ? 0 : 1, transform: transitioning ? 'translateY(16px)' : 'translateY(0)', transition: 'all 0.3s ease' }}>
          <SliderQuestion
            label="Question 1"
            questionText={dim.questions[0]}
            level={dim.questionLevels[0]}
            value={q0val}
            onChange={(v) => setQ(q0key, v)}
          />
          <SliderQuestion
            label="Question 2"
            questionText={dim.questions[1]}
            level={dim.questionLevels[1]}
            value={q1val}
            onChange={(v) => setQ(q1key, v)}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between w-full mt-8 gap-4">
          <button onClick={goPrev} disabled={dimIndex === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-navy-600 text-slate-400 font-manrope font-600 text-sm hover:border-electric/40 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronLeft size={16} /> Précédent
          </button>
          <button onClick={goNext}
            className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-electric to-cyan-scan text-white font-syne font-700 text-sm hover:opacity-90 active:scale-[0.98] transition-all glow-blue">
            {isLast ? <><span>Voir les résultats</span><Check size={16} /></> : <><span>Suivant</span><ChevronRight size={16} /></>}
          </button>
        </div>

        {userData && (
          <p className="mt-8 text-slate-600 text-xs font-manrope text-center">
            {userData.company} · {userData.profile}
          </p>
        )}
      </main>
    </div>
  )
}
