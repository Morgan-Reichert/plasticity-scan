import { useEffect, useState } from 'react'
import { Activity } from 'lucide-react'

const STEPS = [
  { text: 'Analyse des 7 dimensions systémiques…',    pct: 20 },
  { text: 'Détection des leviers d\'action prioritaires…', pct: 45 },
  { text: 'Lecture des 3 niveaux organisationnels…',  pct: 68 },
  { text: 'Calcul du profil de plasticité global…',   pct: 88 },
  { text: 'Génération du rapport…',                   pct: 100 },
]

export default function ComputingScreen({ onComplete }) {
  const [stepIdx, setStepIdx]   = useState(0)
  const [progress, setProgress] = useState(0)
  const [done, setDone]         = useState(false)

  useEffect(() => {
    const duration = 2600 // ms total before onComplete
    const stepInterval = duration / STEPS.length

    /* Advance through steps */
    const timers = STEPS.map((s, i) =>
      setTimeout(() => {
        setStepIdx(i)
        setProgress(s.pct)
      }, i * stepInterval)
    )

    /* Complete */
    const endTimer = setTimeout(() => {
      setDone(true)
      setTimeout(onComplete, 400)
    }, duration)

    return () => { timers.forEach(clearTimeout); clearTimeout(endTimer) }
  }, [])

  return (
    <div className="min-h-screen mesh-bg dot-grid flex flex-col items-center justify-center relative overflow-hidden">

      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(59,130,246,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(20,184,166,0.08) 0%, transparent 50%)' }} />

      {/* Orbiting ring */}
      <div aria-hidden className="absolute" style={{
        width: 340, height: 340,
        borderRadius: '50%',
        border: '1px solid rgba(59,130,246,0.12)',
        animation: 'spin 8s linear infinite',
      }} />
      <div aria-hidden className="absolute" style={{
        width: 240, height: 240,
        borderRadius: '50%',
        border: '1px solid rgba(20,184,166,0.10)',
        animation: 'spin 5s linear infinite reverse',
      }} />

      {/* Center icon */}
      <div className="relative z-10 mb-10">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-electric/15 animate-pulseRing" />
          <span className="absolute inset-2 rounded-full bg-electric/10 animate-pulseRing" style={{ animationDelay: '0.4s' }} />
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-electric to-cyan-scan flex items-center justify-center glow-blue">
            <Activity size={26} className="text-white" />
          </div>
        </div>
      </div>

      {/* Brand */}
      <p className="relative z-10 font-syne font-800 text-white text-xl tracking-[0.18em] uppercase mb-1">
        Plasticity Scan<sup className="text-electric text-[11px]">®</sup>
      </p>
      <p className="relative z-10 text-slate-500 text-xs font-manrope tracking-widest uppercase mb-10">
        Diagnostic Systémique
      </p>

      {/* Progress track */}
      <div className="relative z-10 w-80">
        <div className="flex items-center justify-between mb-2">
          <span
            key={stepIdx}
            className="text-slate-400 text-sm font-manrope transition-all duration-500"
            style={{ opacity: done ? 0 : 1 }}
          >
            {STEPS[stepIdx]?.text}
          </span>
          <span className="text-electric font-syne font-700 text-sm ml-4 flex-shrink-0">
            {progress}%
          </span>
        </div>

        {/* Bar */}
        <div className="h-1 bg-navy-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(to right, #3B82F6, #14B8A6)',
              boxShadow: '0 0 8px rgba(59,130,246,0.5)',
            }}
          />
        </div>

        {/* Step dots */}
        <div className="flex justify-between mt-3">
          {STEPS.map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{ background: i <= stepIdx ? '#3B82F6' : '#1E293B' }} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
