import { useState } from 'react'
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Building2, AlertCircle, Activity } from 'lucide-react'
import { signInDirigeant } from '../supabaseClient'

const INTERVENANT_CODE = import.meta.env.VITE_DASHBOARD_PASSWORD ?? 'sensup2026'

export default function ConnectionPage({ onIntervenantSuccess, onDirigeantSuccess, onBack }) {
  const [tab, setTab] = useState('intervenant')

  /* Intervenant */
  const [code, setCode] = useState('')
  const [showCode, setShowCode] = useState(false)
  const [codeError, setCodeError] = useState('')
  const [codeShake, setCodeShake] = useState(false)

  /* Dirigeant */
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [dirError, setDirError] = useState('')
  const [dirLoading, setDirLoading] = useState(false)

  /* ── Intervenant login ── */
  const handleCode = (e) => {
    e.preventDefault()
    if (code === INTERVENANT_CODE) {
      onIntervenantSuccess()
    } else {
      setCodeError('Code incorrect.')
      setCodeShake(true)
      setCode('')
      setTimeout(() => setCodeShake(false), 500)
    }
  }

  /* ── Dirigeant login ── */
  const handleDirigeant = async (e) => {
    e.preventDefault()
    setDirError('')
    if (!email || !password) { setDirError('Veuillez remplir tous les champs.'); return }
    setDirLoading(true)
    const { data, error } = await signInDirigeant(email, password)
    setDirLoading(false)
    if (error || !data) {
      setDirError('Email ou mot de passe incorrect.')
    } else {
      onDirigeantSuccess({
        role: 'dirigeant',
        email: data.email,
        companyId: data.company_id,
        companyName: data.companies?.name ?? '',
        emailDomain: data.companies?.email_domain ?? '',
      })
    }
  }

  return (
    <div className="min-h-screen mesh-bg dot-grid flex flex-col">
      <div aria-hidden className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(59,130,246,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(20,184,166,0.06) 0%, transparent 50%)' }} />

      {/* Header */}
      <header className="relative z-10 px-6 md:px-12 py-5 flex items-center justify-between border-b border-navy-700">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-manrope transition-colors">
          <ArrowLeft size={15} /> Retour
        </button>
        <div className="flex items-center gap-2">
          <div className="relative w-7 h-7 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-electric/20 animate-pulseRing" />
            <div className="relative w-5 h-5 rounded-full bg-gradient-to-br from-electric to-cyan-scan flex items-center justify-center">
              <Activity size={10} className="text-white" />
            </div>
          </div>
          <span className="font-syne font-700 text-white text-sm tracking-[0.15em] uppercase">
            Plasticity Scan<sup className="text-electric text-[10px]">®</sup>
          </span>
        </div>
      </header>

      {/* Center */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <span className="absolute inset-0 rounded-full bg-electric/15 animate-pulseRing" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-electric to-cyan-scan flex items-center justify-center glow-blue">
                <Lock size={22} className="text-white" />
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="font-syne font-800 text-white text-2xl mb-2">Connexion</h1>
            <p className="text-slate-400 font-manrope text-sm">
              Accès réservé aux intervenants et dirigeants d'entreprise
            </p>
          </div>

          {/* Tabs */}
          <div className="glass rounded-2xl overflow-hidden glow-blue">
            <div className="flex border-b border-navy-700">
              {[
                { id: 'intervenant', label: 'Intervenant', icon: Lock },
                { id: 'dirigeant',   label: 'Dirigeant',   icon: Building2 },
              ].map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => { setTab(id); setCodeError(''); setDirError('') }}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-manrope font-600 border-b-2 transition-all ${
                    tab === id ? 'border-electric text-white bg-electric/5' : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}>
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            <div className="p-8">

              {/* ── Intervenant ── */}
              {tab === 'intervenant' && (
                <form onSubmit={handleCode} className="space-y-5">
                  <div className="text-center mb-6">
                    <p className="text-slate-400 text-sm font-manrope leading-relaxed">
                      Accès au tableau de bord complet.<br />
                      Renseignez le code d'accès HeR Labs.
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] font-manrope font-600 uppercase tracking-wider mb-2">
                      Code d'accès
                    </label>
                    <div className="relative" style={codeShake ? { animation: 'shake 0.4s ease' } : {}}>
                      <input type={showCode ? 'text' : 'password'} value={code}
                        onChange={e => { setCode(e.target.value); setCodeError('') }}
                        placeholder="••••••••••" autoFocus
                        className="w-full bg-navy-800 border border-navy-600 focus:border-electric rounded-xl px-4 py-3 pr-11 text-white font-manrope text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-electric/20 transition-all" />
                      <button type="button" onClick={() => setShowCode(!showCode)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showCode ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {codeError && (
                    <div className="flex items-center gap-2 text-red-400 text-sm font-manrope">
                      <AlertCircle size={13} />{codeError}
                    </div>
                  )}

                  <button type="submit"
                    className="w-full bg-gradient-to-r from-electric to-cyan-scan text-white font-syne font-700 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all glow-blue">
                    Accéder au tableau de bord <ArrowRight size={16} />
                  </button>
                </form>
              )}

              {/* ── Dirigeant ── */}
              {tab === 'dirigeant' && (
                <form onSubmit={handleDirigeant} className="space-y-5">
                  <div className="text-center mb-6">
                    <p className="text-slate-400 text-sm font-manrope leading-relaxed">
                      Accédez aux résultats de votre entreprise.<br />
                      Compte créé par un intervenant HeR Labs.
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] font-manrope font-600 uppercase tracking-wider mb-2">
                      Email
                    </label>
                    <input type="email" value={email}
                      onChange={e => { setEmail(e.target.value); setDirError('') }}
                      placeholder="vous@entreprise.com" autoFocus
                      className="w-full bg-navy-800 border border-navy-600 focus:border-electric rounded-xl px-4 py-3 text-white font-manrope text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-electric/20 transition-all" />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] font-manrope font-600 uppercase tracking-wider mb-2">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <input type={showPwd ? 'text' : 'password'} value={password}
                        onChange={e => { setPassword(e.target.value); setDirError('') }}
                        placeholder="••••••••••"
                        className="w-full bg-navy-800 border border-navy-600 focus:border-electric rounded-xl px-4 py-3 pr-11 text-white font-manrope text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-electric/20 transition-all" />
                      <button type="button" onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {dirError && (
                    <div className="flex items-center gap-2 text-red-400 text-sm font-manrope">
                      <AlertCircle size={13} />{dirError}
                    </div>
                  )}

                  <button type="submit" disabled={dirLoading}
                    className="w-full bg-gradient-to-r from-electric to-cyan-scan text-white font-syne font-700 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 glow-blue">
                    {dirLoading
                      ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><span>Voir les résultats</span><ArrowRight size={16} /></>}
                  </button>
                </form>
              )}
            </div>
          </div>

          <p className="text-center text-slate-700 text-xs font-manrope mt-6">
            Hackathon HeR Labs 2026 · Sensup
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-5px); }
          80%      { transform: translateX(5px); }
        }
      `}</style>
    </div>
  )
}
