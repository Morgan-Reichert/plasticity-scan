import { useState, useEffect } from 'react'
import { Plus, Trash2, Building2, AtSign, AlertCircle, Check, Loader2, UserPlus, Users, Eye, EyeOff, KeyRound } from 'lucide-react'
import { createCompany, deleteCompany, createDirigeant, deleteDirigeant, getDirigeantsByCompany } from '../supabaseClient'

/* ── Dirigeant row ── */
function DirigeantRow({ d, onDelete }) {
  const [deleting, setDeleting] = useState(false)
  return (
    <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white border border-slate-200 group">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-electric/10 flex items-center justify-center flex-shrink-0">
          <span className="text-electric font-syne font-700 text-[10px]">
            {d.email.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <span className="text-slate-700 text-sm font-manrope truncate">{d.email}</span>
      </div>
      <button onClick={async () => { setDeleting(true); await onDelete(d.id); setDeleting(false) }}
        disabled={deleting}
        className="opacity-0 group-hover:opacity-100 ml-3 p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0 disabled:opacity-50">
        {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
      </button>
    </div>
  )
}

/* ── Company card with dirigeant management ── */
function CompanyCard({ company, onDeleteCompany, onRefresh }) {
  const [dirigeants, setDirigeants] = useState([])
  const [loadingDir, setLoadingDir] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [addForm, setAddForm] = useState({ email: '', password: '', show: false })
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')
  const [addSuccess, setAddSuccess] = useState('')
  const [showPwd, setShowPwd] = useState(false)

  const loadDirigeants = async () => {
    setLoadingDir(true)
    const { data } = await getDirigeantsByCompany(company.id)
    setDirigeants(data ?? [])
    setLoadingDir(false)
  }

  const toggleExpand = () => {
    if (!expanded) loadDirigeants()
    setExpanded(!expanded)
  }

  const handleAddDirigeant = async (e) => {
    e.preventDefault()
    if (!addForm.email || !addForm.password) { setAddError('Email et mot de passe requis.'); return }
    if (addForm.password.length < 6) { setAddError('Mot de passe : 6 caractères minimum.'); return }
    setAddError(''); setAdding(true)
    const { error } = await createDirigeant({ email: addForm.email, password: addForm.password, company_id: company.id })
    setAdding(false)
    if (error) {
      setAddError(error.message?.includes('unique') ? 'Cet email est déjà enregistré.' : 'Erreur lors de la création.')
    } else {
      setAddSuccess('Compte créé.')
      setAddForm({ email: '', password: '', show: false })
      setTimeout(() => setAddSuccess(''), 3000)
      loadDirigeants()
    }
  }

  const handleDeleteDirigeant = async (id) => {
    await deleteDirigeant(id)
    setDirigeants(d => d.filter(x => x.id !== id))
  }

  return (
    <div className="glass rounded-2xl overflow-hidden border border-slate-200">
      {/* Company header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-electric/15 border border-electric/20 flex items-center justify-center flex-shrink-0">
            <span className="font-syne font-700 text-electric text-xs">{company.name.slice(0, 2).toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-slate-900 font-manrope font-600 text-sm truncate">{company.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <AtSign size={10} className="text-cyan-scan flex-shrink-0" />
              <span className="text-cyan-scan text-[11px] font-manrope">{company.email_domain}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={toggleExpand}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-manrope font-600 border transition-all ${
              expanded ? 'border-electric/40 bg-electric/10 text-electric' : 'border-slate-200 text-slate-500 hover:border-electric/40 hover:text-slate-900'
            }`}>
            <Users size={11} />
            Dirigeants
          </button>
          <button onClick={() => onDeleteCompany(company)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Dirigeants panel */}
      {expanded && (
        <div className="border-t border-slate-200 px-5 py-4 bg-slate-50/80">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-manrope font-600 uppercase tracking-widest text-slate-500">
              Comptes dirigeants
            </p>
            <button onClick={() => setAddForm(f => ({ ...f, show: !f.show }))}
              className="flex items-center gap-1.5 text-[11px] font-manrope font-600 text-electric hover:text-electric/80 transition-colors">
              <UserPlus size={12} /> Ajouter
            </button>
          </div>

          {/* Add form */}
          {addForm.show && (
            <form onSubmit={handleAddDirigeant} className="mb-4 p-4 rounded-xl bg-white border border-slate-200 space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-manrope font-600 uppercase tracking-wider text-slate-500 mb-1.5">
                    Email dirigeant
                  </label>
                  <input type="email" value={addForm.email}
                    onChange={e => { setAddForm(f => ({ ...f, email: e.target.value })); setAddError('') }}
                    placeholder={`dirigeant@${company.email_domain}`}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-electric rounded-lg px-3 py-2 text-slate-900 text-sm font-manrope placeholder:text-slate-400 focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-manrope font-600 uppercase tracking-wider text-slate-500 mb-1.5">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input type={showPwd ? 'text' : 'password'} value={addForm.password}
                      onChange={e => { setAddForm(f => ({ ...f, password: e.target.value })); setAddError('') }}
                      placeholder="6 caractères min."
                      className="w-full bg-slate-50 border border-slate-200 focus:border-electric rounded-lg px-3 py-2 pr-9 text-slate-900 text-sm font-manrope placeholder:text-slate-400 focus:outline-none transition-all" />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPwd ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  </div>
                </div>
              </div>
              {addError && <p className="text-red-400 text-xs font-manrope flex items-center gap-1"><AlertCircle size={11} />{addError}</p>}
              {addSuccess && <p className="text-cyan-scan text-xs font-manrope flex items-center gap-1"><Check size={11} />{addSuccess}</p>}
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setAddForm(f => ({ ...f, show: false }))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-xs font-manrope hover:text-slate-900 transition-all">
                  Annuler
                </button>
                <button type="submit" disabled={adding}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-electric text-white text-xs font-manrope font-600 hover:bg-electric/90 transition-all disabled:opacity-50">
                  {adding ? <Loader2 size={11} className="animate-spin" /> : <><UserPlus size={11} /> Créer le compte</>}
                </button>
              </div>
            </form>
          )}

          {/* Dirigeant list */}
          {loadingDir ? (
            <div className="flex justify-center py-4">
              <Loader2 size={16} className="animate-spin text-slate-400" />
            </div>
          ) : dirigeants.length === 0 ? (
            <div className="text-center py-5">
              <KeyRound size={20} className="text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 text-xs font-manrope">Aucun compte dirigeant pour cette entreprise.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {dirigeants.map(d => (
                <DirigeantRow key={d.id} d={d} onDelete={handleDeleteDirigeant} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ════ Main CompanyManager ════ */
export default function CompanyManager({ companies, onRefresh }) {
  const [form, setForm] = useState({ name: '', email_domain: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleting, setDeleting] = useState(null)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email_domain.trim()) { setError('Nom et domaine requis.'); return }
    const domain = form.email_domain.trim().replace(/^@/, '').toLowerCase()
    if (!domain.includes('.')) { setError('Domaine invalide. Ex : sensup.com'); return }
    setError(''); setLoading(true)
    const { error: err } = await createCompany({ name: form.name, email_domain: domain })
    setLoading(false)
    if (err) { setError('Erreur : ' + (err.message ?? 'Impossible de créer.')) }
    else {
      setSuccess(`"${form.name}" ajoutée.`)
      setForm({ name: '', email_domain: '' })
      setTimeout(() => setSuccess(''), 3000)
      onRefresh()
    }
  }

  const handleDelete = async (company) => {
    if (!window.confirm(`Supprimer "${company.name}" et tous ses comptes dirigeants ?`)) return
    setDeleting(company.id)
    await deleteCompany(company.id)
    setDeleting(null)
    onRefresh()
  }

  return (
    <div className="space-y-6">

      {/* Add company form */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-syne font-700 text-slate-900 text-base mb-5 flex items-center gap-2">
          <Plus size={16} className="text-electric" /> Ajouter une entreprise
        </h3>
        <form onSubmit={handleAdd} className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <div>
            <label className="block text-slate-500 text-[11px] font-manrope font-600 uppercase tracking-wider mb-2">
              Nom
            </label>
            <div className="relative">
              <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Ex : Sensup"
                className="w-full bg-slate-50 border border-slate-200 focus:border-electric rounded-xl pl-9 pr-4 py-3 text-slate-900 font-manrope text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-electric/20 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-slate-500 text-[11px] font-manrope font-600 uppercase tracking-wider mb-2">
              Domaine email
            </label>
            <div className="relative">
              <AtSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={form.email_domain} onChange={e => setForm({ ...form, email_domain: e.target.value })}
                placeholder="sensup.com"
                className="w-full bg-slate-50 border border-slate-200 focus:border-electric rounded-xl pl-9 pr-4 py-3 text-slate-900 font-manrope text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-electric/20 transition-all" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-electric to-cyan-scan text-white font-syne font-700 text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 whitespace-nowrap glow-blue">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <><Plus size={15} /> Ajouter</>}
          </button>
        </form>
        {error && <p className="mt-3 text-red-400 text-sm font-manrope flex items-center gap-2"><AlertCircle size={13} />{error}</p>}
        {success && <p className="mt-3 text-cyan-scan text-sm font-manrope flex items-center gap-2"><Check size={13} />{success}</p>}
      </div>

      {/* Companies list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-syne font-700 text-slate-900 text-base flex items-center gap-2">
            <Building2 size={15} className="text-cyan-scan" />
            Entreprises & comptes dirigeants
          </h3>
          <span className="text-slate-500 font-manrope text-sm">
            {companies.length} entreprise{companies.length !== 1 ? 's' : ''}
          </span>
        </div>

        {companies.length === 0 ? (
          <div className="glass rounded-2xl px-6 py-12 text-center">
            <Building2 size={28} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-manrope text-sm">Aucune entreprise. Ajoutez-en une ci-dessus.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {companies.map(c => (
              <CompanyCard key={c.id} company={c} onDeleteCompany={handleDelete} onRefresh={onRefresh} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
