import { useState, useEffect } from 'react'
import { ArrowRight, Activity, Target, Zap, LayoutDashboard, ChevronDown, Loader2, AlertCircle } from 'lucide-react'
import { saveSession, getCompanies } from '../supabaseClient'

const PROFILES = [
  { id: 'collaborateur', label: 'Collaborateur',    sub: 'Équipe & terrain',           symbol: '◎' },
  { id: 'manager',       label: 'Manager / Team Lead', sub: 'Encadrement opérationnel', symbol: '◉' },
  { id: 'directeur',     label: 'Directeur / Board', sub: 'Direction stratégique',      symbol: '●' },
]

const DIMS = [
  'Vision & Alignement', 'Gouvernance & Performance', 'Culture & Cohérence',
  'Coopération & Exécution', 'Leadership & Management', 'Cadre & Sécurité', 'Engagement & Robustesse',
]

export default function LandingPage({ onStart, onIntervenantAccess }) {
  const [form, setForm] = useState({ companyId: '', companyName: '', email: '', profile: '' })
  const [companies, setCompanies] = useState([])
  const [loadingCompanies, setLoadingCompanies] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /* Load companies on mount */
  useEffect(() => {
    getCompanies().then(({ data }) => {
      setCompanies(data ?? [])
      setLoadingCompanies(false)
    })
  }, [])

  const selectedCompany = companies.find(c => c.id === form.companyId) ?? null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.companyId) { setError('Veuillez sélectionner votre entreprise.'); return }
    if (!form.email.trim()) { setError('Veuillez renseigner votre email.'); return }
    if (!form.profile) { setError('Veuillez sélectionner votre profil.'); return }

    /* Domain validation */
    if (selectedCompany) {
      const domain = form.email.trim().split('@')[1]?.toLowerCase()
      if (!domain || domain !== selectedCompany.email_domain.toLowerCase()) {
        setError(`Votre email doit appartenir au domaine @${selectedCompany.email_domain}`)
        return
      }
    }

    setLoading(true)
    await saveSession({
      company: selectedCompany?.name ?? form.companyName,
      company_id: form.companyId,
      email: form.email.trim(),
      profile: form.profile,
      status: 'started',
    })
    setLoading(false)
    onStart({
      company: selectedCompany?.name ?? '',
      companyId: form.companyId,
      email: form.email.trim(),
      profile: form.profile,
    })
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
      <div aria-hidden className="pointer-events-none absolute -top-32 left-1/3 w-[600px] h-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)' }} />
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.07) 0%, transparent 70%)' }} />

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
            Plasticity Scan<sup className="text-electric text-[10px] ml-0.5">®</sup>
          </span>
        </div>
        <button onClick={onIntervenantAccess}
          className="hidden md:flex items-center gap-2 text-slate-500 hover:text-slate-300 text-xs font-manrope tracking-wider uppercase transition-colors group">
          <LayoutDashboard size={13} className="group-hover:text-electric transition-colors" />
          Connexion
        </button>
      </header>

      {/* ── Main ── */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pt-12 pb-24 flex-1">
        <div className="grid lg:grid-cols-[1fr_420px] gap-16 items-start">

          {/* ── Left: Hero ── */}
          <div>

            {/* Badge systémique */}
            <div className="anim-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-scan/30 bg-cyan-scan/10 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-scan animate-pulse inline-block" />
              <span className="text-cyan-scan text-[11px] font-manrope font-600 tracking-widest uppercase">
                Outil de diagnostic systémique
              </span>
            </div>

            {/* H1 */}
            <h1 className="anim-1 font-syne font-800 text-4xl md:text-[3.25rem] leading-[1.08] text-white mb-5">
              Mesurez la{' '}
              <span className="shimmer-text">plasticité</span>
              <br />
              de votre organisation
            </h1>

            {/* Vision statement */}
            <p className="anim-1 font-manrope text-base text-slate-500 italic leading-snug mb-6 border-l-2 border-electric/40 pl-4 max-w-[440px]">
              "Devenir un modèle de lecture des organisations à l'ère de la complexité,
              de l'incertitude et de l'IA."
            </p>

            {/* Description */}
            <p className="anim-2 font-manrope text-base text-slate-400 leading-relaxed mb-8 max-w-[480px]">
              Le <strong className="text-white font-600">Plasticity Scan®</strong> est un outil de diagnostic
              systémique rapide qui évalue la capacité réelle d'une organisation à{' '}
              <span className="text-slate-300">absorber les transformations</span>,{' '}
              <span className="text-slate-300">coopérer dans la complexité</span> et{' '}
              <span className="text-slate-300">maintenir sa capacité d'exécution</span> dans l'incertitude.
            </p>

            {/* Feature pills */}
            <div className="anim-3 flex flex-wrap gap-3 mb-8">
              {[
                { label: 'Diagnostic systémique', Icon: Target },
                { label: '3 niveaux de perception', Icon: Activity },
                { label: 'Leviers d\'action concrets', Icon: Zap },
              ].map(({ label, Icon }) => (
                <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-navy-700 border border-navy-600">
                  <Icon size={13} className="text-cyan-scan" />
                  <span className="text-slate-300 text-sm font-manrope font-500">{label}</span>
                </div>
              ))}
            </div>

            {/* 3 levels of perception — key differentiator */}
            <div className="anim-3 glass-light rounded-2xl p-5 mb-8">
              <p className="text-[11px] font-manrope font-600 uppercase tracking-widest text-slate-500 mb-4">
                Confrontation des perceptions
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { level: 'Terrain',     sub: 'Collaborateurs',        color: '#3B82F6', symbol: '◎' },
                  { level: 'Management',  sub: 'Managers & Team Leads',  color: '#14B8A6', symbol: '◉' },
                  { level: 'Direction',   sub: 'Dirigeants & Board',     color: '#8B5CF6', symbol: '●' },
                ].map(({ level, sub, color, symbol }) => (
                  <div key={level} className="flex flex-col items-center text-center gap-2 p-3 rounded-xl"
                    style={{ background: color + '0D', border: `1px solid ${color}20` }}>
                    <span className="text-2xl" style={{ color }}>{symbol}</span>
                    <div>
                      <p className="font-syne font-700 text-white text-sm">{level}</p>
                      <p className="font-manrope text-[10px] text-slate-500 leading-tight">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs font-manrope text-slate-600 mt-3 text-center leading-relaxed">
                Cartographie des écarts de perception, zones de rigidité et fragilités systémiques
              </p>
            </div>

            {/* What it produces */}
            <div className="anim-4 space-y-2">
              <p className="text-[11px] font-manrope font-600 uppercase tracking-widest text-slate-500 mb-3">
                Ce que le scan révèle
              </p>
              {[
                { label: 'Zones de rigidité organisationnelle',      color: '#EF4444' },
                { label: 'Écarts de perception inter-niveaux',       color: '#F59E0B' },
                { label: 'Fragilités systémiques cachées',            color: '#8B5CF6' },
                { label: 'Leviers d\'action prioritaires',            color: '#14B8A6' },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-3 font-manrope text-sm text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                  {label}
                </div>
              ))}
            </div>

          </div>

          {/* ── Right: Form ── */}
          <div className="anim-5 lg:sticky lg:top-8">
            <div className="glass rounded-2xl p-8 glow-blue">
              <div className="mb-7">
                <h2 className="font-syne font-700 text-white text-xl mb-1">Démarrer le diagnostic</h2>
                <p className="text-slate-400 text-sm font-manrope">5 minutes · Résultats immédiats · Confidentiel</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Company selector */}
                <div>
                  <label className="block text-slate-400 text-[11px] font-manrope font-600 uppercase tracking-wider mb-2">
                    Votre entreprise
                  </label>
                  {loadingCompanies ? (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-navy-800 border border-navy-600">
                      <Loader2 size={14} className="text-slate-500 animate-spin" />
                      <span className="text-slate-500 text-sm font-manrope">Chargement…</span>
                    </div>
                  ) : companies.length === 0 ? (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-navy-800 border border-amber-400/30">
                      <AlertCircle size={14} className="text-amber-400" />
                      <span className="text-amber-400 text-xs font-manrope">
                        Aucune entreprise configurée.<br />
                        <span className="text-slate-500">Contactez un intervenant HeR Labs.</span>
                      </span>
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        value={form.companyId}
                        onChange={e => {
                          const co = companies.find(c => c.id === e.target.value)
                          setForm({ ...form, companyId: e.target.value, companyName: co?.name ?? '', email: '' })
                          setError('')
                        }}
                        className="w-full appearance-none bg-navy-800 border border-navy-600 focus:border-electric rounded-xl px-4 py-3 pr-10 text-white font-manrope text-sm focus:outline-none focus:ring-2 focus:ring-electric/20 transition-all cursor-pointer"
                      >
                        <option value="">Sélectionner votre entreprise…</option>
                        {companies.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  )}

                  {/* Domain hint */}
                  {selectedCompany && (
                    <p className="mt-1.5 text-[11px] font-manrope text-slate-500 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-cyan-scan inline-block" />
                      Utilisez votre email <span className="text-cyan-scan">@{selectedCompany.email_domain}</span>
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-slate-400 text-[11px] font-manrope font-600 uppercase tracking-wider mb-2">
                    Email professionnel
                  </label>
                  <input type="email" value={form.email}
                    onChange={e => { setForm({ ...form, email: e.target.value }); setError('') }}
                    placeholder={selectedCompany ? `vous@${selectedCompany.email_domain}` : 'vous@entreprise.com'}
                    className="w-full bg-navy-800 border border-navy-600 focus:border-electric rounded-xl px-4 py-3 text-white font-manrope text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-electric/20 transition-all" />
                </div>

                {/* Profile */}
                <div>
                  <label className="block text-slate-400 text-[11px] font-manrope font-600 uppercase tracking-wider mb-3">
                    Votre profil
                  </label>
                  <div className="space-y-2">
                    {PROFILES.map(p => (
                      <button key={p.id} type="button"
                        onClick={() => setForm({ ...form, profile: p.id })}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border transition-all text-left ${
                          form.profile === p.id
                            ? 'border-electric bg-electric/10 text-white'
                            : 'border-navy-600 bg-navy-900 text-slate-400 hover:border-electric/40 hover:bg-navy-800'
                        }`}>
                        <span className="text-xl leading-none flex-shrink-0"
                          style={{ color: form.profile === p.id ? '#3B82F6' : '#64748B' }}>
                          {p.symbol}
                        </span>
                        <div className="min-w-0">
                          <div className="font-manrope font-600 text-sm truncate">{p.label}</div>
                          <div className="font-manrope text-xs text-slate-500">{p.sub}</div>
                        </div>
                        {form.profile === p.id && <div className="ml-auto w-2 h-2 rounded-full bg-cyan-scan flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-red-400 text-sm font-manrope">
                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading || companies.length === 0}
                  className="w-full mt-1 bg-gradient-to-r from-electric to-cyan-scan text-white font-syne font-700 py-4 rounded-xl flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 glow-blue">
                  {loading
                    ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><span>Démarrer le diagnostic</span><ArrowRight size={18} /></>
                  }
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
            Projet proposé et protégé par <span className="text-cyan-scan font-600">Sensup</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
