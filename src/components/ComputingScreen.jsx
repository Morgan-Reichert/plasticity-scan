import { useEffect, useState } from 'react'

const STEPS = [
  'Analyse des 7 dimensions systémiques…',
  'Détection des leviers prioritaires…',
  'Lecture des 3 niveaux organisationnels…',
  'Calcul du profil de plasticité…',
  'Génération du rapport…',
]

export default function ComputingScreen({ onComplete }) {
  const [stepIdx,  setStepIdx]  = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let pct = 0
    const progressTimer = setInterval(() => {
      pct += 2
      setProgress(Math.min(pct, 100))
      if (pct >= 100) clearInterval(progressTimer)
    }, 48) // 48ms × 50 = 2400ms

    const stepTimers = STEPS.map((_, i) =>
      setTimeout(() => setStepIdx(i), i * 480)
    )
    // In demo seek mode, don't auto-complete (let the developer inspect the screen)
    const doneTimer = typeof window.__DEMO_SEEK__ === 'number'
      ? null
      : setTimeout(() => onComplete(), 2800)

    return () => {
      clearInterval(progressTimer)
      stepTimers.forEach(clearTimeout)
      if (doneTimer) clearTimeout(doneTimer)
    }
  }, []) // eslint-disable-line

  return (
    <div className="min-h-screen mesh-bg dot-grid flex flex-col items-center justify-center relative overflow-hidden">

      {/* Deep ambient gradient */}
      <div aria-hidden className="pointer-events-none fixed inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 45%, rgba(59,130,246,0.14) 0%, rgba(20,184,166,0.06) 35%, transparent 60%),
            radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.05) 0%, transparent 45%)
          `,
        }} />

      {/* Drifting particles */}
      {Array.from({ length: 14 }).map((_, i) => {
        const seed = i * 37.1
        const px = (seed * 11.3) % 100
        const py = (seed * 9.7) % 100
        const size = 2 + (i % 3)
        const col = ['#3B82F6','#14B8A6','#8B5CF6','#60A5FA'][i % 4]
        const dur = 6 + (i % 5) * 1.4
        return (
          <div key={i} aria-hidden
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${px}%`, top: `${py}%`,
              width: size, height: size, background: col,
              opacity: 0.35,
              boxShadow: `0 0 ${size*4}px ${col}`,
              animation: `pulseRing ${dur}s ease-in-out infinite`,
              animationDelay: `${(i % 6) * 0.3}s`,
            }} />
        )
      })}

      {/* ═════════════ SCAN VISUAL ═════════════ */}
      <div data-demo="computing-center" className="relative z-10 mb-12"
        style={{ width: 280, height: 280 }}>

        {/* Emanating pulse waves (3 ripples staggered) */}
        {[0, 1, 2].map((i) => (
          <div key={i} aria-hidden
            className="absolute inset-0 rounded-full border-2 border-electric/50 animate-pulseOut"
            style={{ animationDelay: `${i * 1}s` }} />
        ))}

        {/* Outermost slow guide ring */}
        <div aria-hidden className="absolute inset-0 rounded-full orbit-cw"
          style={{
            border: '1px solid rgba(59,130,246,0.18)',
            animationDuration: '14s',
          }} />

        {/* Outer ring + orbiting marker */}
        <div aria-hidden className="absolute inset-0 orbit-cw" style={{ animationDuration: '7s' }}>
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
            style={{
              background: '#3B82F6',
              boxShadow: '0 0 18px #3B82F6, 0 0 32px rgba(59,130,246,0.5)',
            }} />
        </div>

        {/* Mid ring */}
        <div aria-hidden className="absolute inset-10 rounded-full orbit-ccw"
          style={{
            border: '1px solid rgba(20,184,166,0.25)',
            animationDuration: '10s',
          }} />

        {/* Mid ring + orbiting marker */}
        <div aria-hidden className="absolute inset-10 orbit-ccw" style={{ animationDuration: '5.5s' }}>
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
            style={{
              background: '#14B8A6',
              boxShadow: '0 0 14px #14B8A6, 0 0 26px rgba(20,184,166,0.5)',
            }} />
        </div>

        {/* Inner ring */}
        <div aria-hidden className="absolute inset-20 rounded-full orbit-cw"
          style={{
            border: '1px solid rgba(139,92,246,0.3)',
            animationDuration: '6s',
          }} />

        {/* Radar sweep (conic gradient rotating) */}
        <div aria-hidden className="absolute inset-12 rounded-full animate-scanSweep"
          style={{
            background: `conic-gradient(from 0deg,
              transparent 0deg,
              transparent 270deg,
              rgba(59,130,246,0.0) 290deg,
              rgba(59,130,246,0.25) 330deg,
              rgba(20,184,166,0.55) 358deg,
              transparent 360deg)`,
            mask: 'radial-gradient(circle at center, transparent 35%, black 36%, black 100%)',
            WebkitMask: 'radial-gradient(circle at center, transparent 35%, black 36%, black 100%)',
          }} />

        {/* Core glow halo */}
        <div aria-hidden className="absolute rounded-full animate-coreBreathe"
          style={{
            inset: 88,
            background: 'radial-gradient(circle at 35% 30%, #60A5FA 0%, #3B82F6 35%, #14B8A6 100%)',
            boxShadow: `
              0 0 60px rgba(59,130,246,0.7),
              0 0 130px rgba(20,184,166,0.4),
              inset 0 -12px 28px rgba(0,0,0,0.25),
              inset 0 8px 20px rgba(255,255,255,0.18)
            `,
          }} />

        {/* Center hot spot */}
        <div aria-hidden className="absolute rounded-full bg-white animate-pulse"
          style={{
            inset: 120,
            opacity: 0.85,
            filter: 'blur(1px)',
            boxShadow: '0 0 20px rgba(255,255,255,0.8)',
          }} />

        {/* Crosshair micro-lines on the core */}
        <div aria-hidden className="absolute inset-[114px] rounded-full pointer-events-none"
          style={{
            background: `
              linear-gradient(0deg, transparent 49.5%, rgba(255,255,255,0.4) 50%, transparent 50.5%),
              linear-gradient(90deg, transparent 49.5%, rgba(255,255,255,0.4) 50%, transparent 50.5%)
            `,
          }} />
      </div>

      {/* Refined logo */}
      <img src="/plasticity-scan-logo.png" alt="Plasticity Scan"
        className="relative z-10 h-9 w-auto object-contain mb-2 opacity-95" />

      <p className="relative z-10 text-slate-500 text-[10px] font-manrope tracking-[0.35em] uppercase mb-10">
        Analyse en cours
      </p>

      {/* Progress */}
      <div className="relative z-10 w-80">
        <div className="flex justify-between mb-2">
          <span className="text-slate-600 text-sm font-manrope truncate pr-4 transition-opacity duration-300">
            {STEPS[stepIdx]}
          </span>
          <span className="text-electric font-syne font-700 text-sm flex-shrink-0 tabular-nums">
            {progress}%
          </span>
        </div>

        <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(to right, #3B82F6, #14B8A6)',
              boxShadow: '0 0 12px rgba(59,130,246,0.6)',
              transition: 'width 0.05s linear',
            }}
          />
        </div>

        <div className="flex justify-between mt-3">
          {STEPS.map((_, i) => (
            <div key={i}
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{
                background: i <= stepIdx ? '#3B82F6' : '#E2E8F0',
                boxShadow: i <= stepIdx ? '0 0 8px rgba(59,130,246,0.6)' : 'none',
                transform: i === stepIdx ? 'scale(1.4)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
