import { useState } from 'react'
import { Plus, Trash2, Building2, AtSign, AlertCircle, Check, Loader2 } from 'lucide-react'
import { createCompany, deleteCompany } from '../supabaseClient'

export default function CompanyManager({ companies, onRefresh }) {
  const [form, setForm] = useState({ name: '', email_domain: '' })
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email_domain.trim()) {
      setError('Nom et domaine email requis.')
      return
    }
    const domain = form.email_domain.trim().replace(/^@/, '').toLowerCase()
    if (!domain.includes('.')) {
      setError('Domaine invalide. Ex : sensup.com')
      return
    }
    setError('')
    setLoading(true)
    const { error: err } = await createCompany({ name: form.name, email_domain: domain })
    setLoading(false)
    if (err) {
      setError('Erreur : ' + (err.message ?? 'Impossible de créer l\'entreprise.'))
    } else {
      setSuccess(`"${form.name}" ajoutée avec succès.`)
      setForm({ name: '', email_domain: '' })
      setTimeout(() => setSuccess(''), 3000)
      onRefresh()
    }
  }

  const handleDelete = async (company) => {
    if (!window.confirm(`Supprimer "${company.name}" ? Cette action est irréversible.`)) return
    setDeleting(company.id)
    await deleteCompany(company.id)
    setDeleting(null)
    onRefresh()
  }

  return (
    <div className="space-y-6">

      {/* ── Add form ── */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-syne font-700 text-white text-base mb-5 flex items-center gap-2">
          <Plus size={16} className="text-electric" />
          Ajouter une entreprise
        </h3>

        <form onSubmit={handleAdd} className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          {/* Nom */}
          <div>
            <label className="block text-slate-500 text-[11px] font-manrope font-600 uppercase tracking-wider mb-2">
              Nom de l'entreprise
            </label>
            <div className="relative">
              <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex : Sensup"
                className="w-full bg-navy-800 border border-navy-600 focus:border-electric rounded-xl pl-9 pr-4 py-3 text-white font-manrope text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-electric/20 transition-all"
              />
            </div>
          </div>

          {/* Domain */}
          <div>
            <label className="block text-slate-500 text-[11px] font-manrope font-600 uppercase tracking-wider mb-2">
              Domaine email (sans @)
            </label>
            <div className="relative">
              <AtSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={form.email_domain}
                onChange={(e) => setForm({ ...form, email_domain: e.target.value })}
                placeholder="sensup.com"
                className="w-full bg-navy-800 border border-navy-600 focus:border-electric rounded-xl pl-9 pr-4 py-3 text-white font-manrope text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-electric/20 transition-all"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-electric to-cyan-scan text-white font-syne font-700 text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 whitespace-nowrap glow-blue"
          >
            {loading
              ? <Loader2 size={15} className="animate-spin" />
              : <><Plus size={15} /> Ajouter</>
            }
          </button>
        </form>

        {error && (
          <div className="mt-3 flex items-center gap-2 text-red-400 text-sm font-manrope">
            <AlertCircle size={13} />
            {error}
          </div>
        )}
        {success && (
          <div className="mt-3 flex items-center gap-2 text-cyan-scan text-sm font-manrope">
            <Check size={13} />
            {success}
          </div>
        )}
      </div>

      {/* ── Company list ── */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-navy-700">
          <h3 className="font-syne font-700 text-white text-base flex items-center gap-2">
            <Building2 size={15} className="text-cyan-scan" />
            Entreprises enregistrées
            <span className="ml-auto text-slate-500 font-manrope font-400 text-sm">
              {companies.length} entreprise{companies.length !== 1 ? 's' : ''}
            </span>
          </h3>
        </div>

        {companies.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Building2 size={28} className="text-navy-600 mx-auto mb-3" />
            <p className="text-slate-500 font-manrope text-sm">
              Aucune entreprise enregistrée.<br />
              Ajoutez la première ci-dessus.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm font-manrope">
            <thead>
              <tr className="border-b border-navy-700">
                <th className="text-left text-[10px] font-600 uppercase tracking-widest text-slate-500 px-6 py-3">Entreprise</th>
                <th className="text-left text-[10px] font-600 uppercase tracking-widest text-slate-500 px-6 py-3">Domaine email</th>
                <th className="text-left text-[10px] font-600 uppercase tracking-widest text-slate-500 px-6 py-3">Créée le</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id} className="border-b border-navy-700/50 hover:bg-navy-800/40 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-electric/15 border border-electric/20 flex items-center justify-center flex-shrink-0">
                        <span className="font-syne font-700 text-electric text-xs">
                          {c.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-white font-600">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-scan/10 border border-cyan-scan/20">
                      <AtSign size={11} className="text-cyan-scan" />
                      <span className="text-cyan-scan text-xs font-600">{c.email_domain}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(c)}
                      disabled={deleting === c.id}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 ml-auto px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all text-xs disabled:opacity-50"
                    >
                      {deleting === c.id
                        ? <Loader2 size={11} className="animate-spin" />
                        : <Trash2 size={11} />
                      }
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
