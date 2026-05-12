import { useState } from 'react'
import { ArrowRight, Activity, Target, Zap, LayoutDashboard } from 'lucide-react'
import { saveSession } from '../supabaseClient'

const PROFILES = [
  {
    id: 'collaborateur',
    label: 'Collaborateur',
    sub: 'Équipe & terrain',
    symbol: '◎',
  },
  {
    id: 'manager',
    label: 'Manager / Team Lead',
    sub: 'Encadrement opérationnel',
    symbol: '◉',
  },
  {
    id: 'directeur',
    label: 'Directeur / Board',
    sub: 'Direction stratégique',
    symbol: '●',
  },
]

const DIMS = [
  'Vision & Alignement',
  'Gouvernance & Performance',
  'Culture & Cohérence',
  'Coopération & Exécution',
  'Leadership & Management',
  'Cadre & Sécurité',
  'Engagement & Robustesse',
]

export default function LandingPage({ onStart, onIntervenantAccess }) {
  const [form, setForm] = useState({ company: '', email: '', profile: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.company.trim() || !form.email.trim() || !form.profile) {
      setError('Veuillez remplir tous les champs pour continuer.')
      return
    }
    setError('')
    setLoading(true)
    await saveSession({ company: form.company, email: form.email, profile: form.profile, status: 'started' })
    setLoading(false)
    onStart(form)
  }

  return (
    <div className="min-h-screen mesh-bg dot-grid relative overflow-hidden flex flex-col">
      {/* ── Hackathon banner ── */}
      <div className="relative z-20 w-full bg-gradient-to-r from-electric/15 via-navy-800 to-cyan-scan/15 border-b border-electric/20 py-2 px-4 text-center">
        <span className="font-manrope text-xs text-slate-300">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-electric animate-pulse mr-2 align-middle" />
          Démonstration réalisée dans le cadre du{' '}
          <span className="text-white font-600">Hackathon HeR Labs 2026</span>
          <span className="mx-2 text-slate-600">·</span>
          Projet proposé et protégé par{' '}
          <span className="text-cyan-scan font-600">Sensup</span>
        </span>
      </div>

      {/* Ambient blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/3 w-[600px] h-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.07) 0%, transparent 70%)' }}
      />

      {/* ── Header ── */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-electric/20 animate-pulseRing" />
            <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-electric to-cyan-scan flex items-center justify-center">
              <Activity size={12} className="text-white" />
            </div>
          </div>
          <span className="font-syne font-700 text-white text-sm tracking-[0.18em] uppercase">
            Plasticity Scan
            <sup className="text-electric text-[10px] ml-0.5">®</sup>
          </span>
        </div>
        <button
          onClick={onIntervenantAccess}
          className="hidden md:flex items-center gap-2 text-slate-500 hover:text-slate-300 text-xs font-manrope tracking-wider uppercase transition-colors group"
        >
          <LayoutDashboard size={13} className="group-hover:text-electric transition-colors" />
          Espace intervenants
        </button>
      </header>

      {/* ── Main ── */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pt-12 pb-24">
        <div className="grid lg:grid-cols-[1fr_420px] gap-16 items-start">

          {/* ── Left: Hero ── */}
          <div>
            <div className="anim-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-scan/30 bg-cyan-scan/10 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-scan animate-pulse inline-block" />
              <span className="text-cyan-scan text-[11px] font-manrope font-600 tracking-widest uppercase">
                Outil de diagnostic organisationnel
              </span>
            </div>

            <h1 className="anim-1 font-syne font-800 text-4xl md:text-[3.25rem] leading-[1.08] text-white mb-6">
              Mesurez la{' '}
              <span className="shimmer-text">plasticité</span>
              <br />
              de votre organisation
            </h1>

            <p className="anim-2 font-manrope text-lg text-slate-400 leading-relaxed mb-10 max-w-[480px]">
              Le <strong className="text-white font-600">Plasticity Scan®</strong> cartographie vos zones de
              rigidité, détecte les fragilités systémiques et identifie les leviers d'action
              pour piloter des transformations robustes à l'ère de la complexité et de l'IA.
            </p>

            <div className="anim-3 flex flex-wrap gap-3 mb-12">
              {[
                { label: '7 Dimensions', Icon: Target },
                { label: '14 Questions', Icon: Activity },
                { label: 'Score 0–9', Icon: Zap },
              ].map(({ label, Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-navy-700 border border-navy-600"
                >
                  <Icon size={13} className="text-cyan-scan" />
                  <span className="text-slate-300 text-sm font-manrope font-500">{label}</span>
                </div>
              ))}
            </div>

            {/* Dimension list */}
            <div className="anim-4 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
              {DIMS.map((d, i) => (
                <div key={d} className="flex items-center gap-2 text-slate-500 text-sm font-manrope">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: `hsl(${200 + i * 22}, 70%, 60%)` }}
                  />
                  {d}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Form card ── */}
          <div className="anim-5 lg:sticky lg:top-8">
            <div className="glass rounded-2xl p-8 glow-blue">
              <div className="mb-7">
                <h2 className="font-syne font-700 text-white text-xl mb-1">
                  Démarrer le diagnostic
                </h2>
                <p className="text-slate-400 text-sm font-manrope">
                  5 minutes · Résultats immédiats · Confidentiel
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Company */}
                <div>
                  <label className="block text-slate-400 text-[11px] font-manrope font-600 uppercase tracking-wider mb-2">
                    Nom de l'entreprise
                  </label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="Ex : Acme Corp"
                    className="w-full bg-navy-800 border border-navy-600 focus:border-electric rounded-xl px-4 py-3 text-white font-manrope text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-electric/20 transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-slate-400 text-[11px] font-manrope font-600 uppercase tracking-wider mb-2">
                    Email professionnel
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="vous@entreprise.com"
                    className="w-full bg-navy-800 border border-navy-600 focus:border-electric rounded-xl px-4 py-3 text-white font-manrope text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-electric/20 transition-all"
                  />
                </div>

                {/* Profile */}
                <div>
                  <label className="block text-slate-400 text-[11px] font-manrope font-600 uppercase tracking-wider mb-3">
                    Votre profil
                  </label>
                  <div className="space-y-2">
                    {PROFILES.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setForm({ ...form, profile: p.id })}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border transition-all text-left ${
                          form.profile === p.id
                            ? 'border-electric bg-electric/10 text-white'
                            : 'border-navy-600 bg-navy-900 text-slate-400 hover:border-electric/40 hover:bg-navy-800'
                        }`}
                      >
                        <span
                          className="text-xl leading-none flex-shrink-0"
                          style={{ color: form.profile === p.id ? '#3B82F6' : '#64748B' }}
                        >
                          {p.symbol}
                        </span>
                        <div className="min-w-0">
                          <div className="font-manrope font-600 text-sm truncate">{p.label}</div>
                          <div className="font-manrope text-xs text-slate-500">{p.sub}</div>
                        </div>
                        {form.profile === p.id && (
                          <div className="ml-auto w-2 h-2 rounded-full bg-cyan-scan flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <p className="text-red-400 text-sm font-manrope">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 bg-gradient-to-r from-electric to-cyan-scan text-white font-syne font-700 py-4 rounded-xl flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 glow-blue"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Démarrer le diagnostic
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-slate-600 text-xs font-manrope mt-5">
                Vos données restent strictement confidentielles
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 mt-auto border-t border-navy-700 py-5 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-manrope text-xs text-slate-600">
            Plasticity Scan<sup className="text-[9px]">®</sup> — Diagnostic Systémique · {new Date().getFullYear()}
          </p>
          <p className="font-manrope text-xs text-slate-600 text-center">
            <span className="text-slate-500">Hackathon HeR Labs 2026</span>
            <span className="mx-2 text-slate-700">·</span>
            Projet proposé et protégé par{' '}
            <span className="text-cyan-scan font-600">Sensup</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
