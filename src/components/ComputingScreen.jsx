import { useEffect, useState } from 'react'
import { Activity } from 'lucide-react'

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
    // Progress: 0 → 100 over 2400ms
    let pct = 0
    const progressTimer = setInterval(() => {
      pct += 2
      setProgress(Math.min(pct, 100))
      if (pct >= 100) clearInterval(progressTimer)
    }, 48) // 48ms × 50 steps = 2400ms

    // Steps: change label every 480ms
    const stepTimers = STEPS.map((_, i) =>
      setTimeout(() => setStepIdx(i), i * 480)
    )

    // Done at 2800ms
    const doneTimer = setTimeout(() => onComplete(), 2800)

    return () => {
      clearInterval(progressTimer)
      stepTimers.forEach(clearTimeout)
      clearTimeout(doneTimer)
    }
  }, []) // eslint-disable-line

  return (
    <div className="min-h-screen mesh-bg dot-grid flex flex-col items-center justify-center relative overflow-hidden">

      {/* Ambient glow */}
      <div aria-hidden className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(59,130,246,0.13) 0%, transparent 60%)' }} />

      {/* Orbiting rings */}
      <div aria-hidden className="orbit-cw absolute rounded-full"
        style={{ width: 320, height: 320, border: '1px solid rgba(59,130,246,0.15)' }} />
      <div aria-hidden className="orbit-ccw absolute rounded-full"
        style={{ width: 220, height: 220, border: '1px solid rgba(20,184,166,0.12)' }} />

      {/* Center */}
      <div className="relative z-10 mb-10">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-electric/15 animate-pulseRing" />
          <span className="absolute inset-2 rounded-full bg-electric/10 animate-pulseRing" style={{ animationDelay: '0.5s' }} />
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
        Analyse en cours
      </p>

      {/* Progress */}
      <div className="relative z-10 w-72">
        <div className="flex justify-between mb-2">
          <span className="text-slate-400 text-sm font-manrope truncate pr-4">
            {STEPS[stepIdx]}
          </span>
          <span className="text-electric font-syne font-700 text-sm flex-shrink-0">
            {progress}%
          </span>
        </div>

        <div className="h-1 bg-navy-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(to right, #3B82F6, #14B8A6)',
              boxShadow: '0 0 8px rgba(59,130,246,0.6)',
              transition: 'width 0.05s linear',
            }}
          />
        </div>

        <div className="flex justify-between mt-3">
          {STEPS.map((_, i) => (
            <div key={i}
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{ background: i <= stepIdx ? '#3B82F6' : '#1E293B' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
