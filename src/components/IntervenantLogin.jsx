import { useState } from 'react'
import { Lock, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react'

const PASS = import.meta.env.VITE_DASHBOARD_PASSWORD ?? 'sensup2026'

export default function IntervenantLogin({ onSuccess, onBack }) {
  const [pwd, setPwd] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (pwd === PASS) {
      onSuccess()
    } else {
      setError('Code incorrect. Veuillez réessayer.')
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setPwd('')
    }
  }

  return (
    <div className="min-h-screen mesh-bg dot-grid flex flex-col">
      {/* Ambient */}
      <div aria-hidden className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(139,92,246,0.09) 0%, transparent 60%)' }} />

      {/* Header */}
      <header className="relative z-10 px-6 md:px-12 py-5 border-b border-slate-200 bg-white/80">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-manrope transition-colors"
        >
          <ArrowLeft size={15} />
          Retour à l'accueil
        </button>
      </header>

      {/* Center */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div
          className="w-full max-w-sm"
          style={{
            animation: shake ? 'none' : undefined,
            transform: shake ? 'translateX(0)' : undefined,
          }}
        >
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-electric/20 animate-pulseRing" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-electric to-cyan-scan flex items-center justify-center glow-blue">
                <Lock size={22} className="text-white" />
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-8 glow-blue" style={shake ? { animation: 'shake 0.4s ease' } : {}}>
            <div className="text-center mb-7">
              <h1 className="font-syne font-800 text-slate-900 text-xl mb-1">Espace Intervenants</h1>
              <p className="text-slate-500 font-manrope text-sm">
                Accès réservé aux organisateurs et intervenants HeR Labs 2026
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-500 text-[11px] font-manrope font-600 uppercase tracking-wider mb-2">
                  Code d'accès
                </label>
                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    value={pwd}
                    onChange={(e) => { setPwd(e.target.value); setError('') }}
                    placeholder="••••••••••"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-electric rounded-xl px-4 py-3 pr-11 text-slate-900 font-manrope text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-electric/20 transition-all"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm font-manrope flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-electric to-cyan-scan text-white font-syne font-700 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all glow-blue mt-2"
              >
                Accéder au tableau de bord
                <ArrowRight size={16} />
              </button>
            </form>

            <p className="text-center text-slate-400 text-xs font-manrope mt-5">
              Code par défaut :{' '}
              <code className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">sensup2026</code>
            </p>
          </div>

          <p className="text-center text-slate-400 text-xs font-manrope mt-5">
            Hackathon HeR Labs 2026 · Sensup
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-6px); }
          80%       { transform: translateX(6px); }
        }
      `}</style>
    </div>
  )
}
