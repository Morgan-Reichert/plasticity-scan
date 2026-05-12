import { useEffect, useRef } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell,
} from 'recharts'
import { plasticityLevel } from '../surveyData'

const PROFILE_LABELS = { collaborateur: 'Collaborateur', manager: 'Manager', directeur: 'Directeur' }
const PROFILE_COLORS = { collaborateur: '#3B82F6', manager: '#14B8A6', directeur: '#8B5CF6' }
const LEVER_COLORS  = { Clarté: '#3B82F6', Cohérence: '#14B8A6', Soutenabilité: '#F59E0B', Robustesse: '#8B5CF6' }

/* ── Score bar (SVG-based, prints perfectly) ── */
function PrintBar({ score, color, maxScore = 9 }) {
  const pct = Math.round((score / maxScore) * 100)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 28, textAlign: 'right' }}>
        {typeof score === 'number' ? score.toFixed(1) : score}
      </span>
    </div>
  )
}

/* ── Level badge ── */
function LevelBadge({ score }) {
  const { label, color } = plasticityLevel(score ?? 0)
  return (
    <span style={{
      display: 'inline-block', fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.08em', padding: '2px 8px', borderRadius: 20,
      background: color + '18', color, border: `1px solid ${color}30`,
    }}>
      {label}
    </span>
  )
}

/* ══════════════════════════════════════════════
   MAIN PDF REPORT
   ══════════════════════════════════════════════ */
export default function PdfReport({ stats, filteredScans, companies, companyFilter, profileFilter, onClose }) {
  const ref = useRef(null)

  /* Trigger print immediately after mount */
  useEffect(() => {
    const timer = setTimeout(() => window.print(), 400)
    const handleAfterPrint = () => onClose()
    window.addEventListener('afterprint', handleAfterPrint)
    return () => { clearTimeout(timer); window.removeEventListener('afterprint', handleAfterPrint) }
  }, [])

  const now  = new Date()
  const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  const companyName = companyFilter !== 'all'
    ? (companies.find(c => c.id === companyFilter)?.name ?? 'Toutes')
    : 'Toutes les entreprises'
  const profileName = profileFilter !== 'all'
    ? (PROFILE_LABELS[profileFilter] ?? profileFilter)
    : 'Tous les profils'

  const radarData = stats?.dimAvgs.map(d => ({ dimension: d.shortName, score: d.avg, fullMark: 9 }))
  const barData   = stats?.dimAvgs.map(d => ({ name: d.name, score: d.avg, fill: d.color }))

  return (
    <>
      {/* ── Print stylesheet injected inline ── */}
      <style>{`
        @media print {
          html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
          body > *:not(#pdf-report-root) { display: none !important; }
          #pdf-report-root { display: block !important; }
          @page { size: A4; margin: 12mm 14mm; }
        }
        @media screen {
          #pdf-report-root {
            position: fixed; inset: 0; z-index: 9999;
            background: rgba(0,0,0,0.85);
            display: flex; align-items: flex-start; justify-content: center;
            overflow-y: auto; padding: 32px 16px;
          }
        }
      `}</style>

      <div id="pdf-report-root" ref={ref}>

        {/* ── Screen wrapper (close button) ── */}
        <div className="no-print" style={{ position: 'fixed', top: 16, right: 16, zIndex: 10001 }}>
          <button onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 8, padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'Manrope, sans-serif' }}>
            ✕ Fermer
          </button>
        </div>

        {/* ══════════ A4 PAPER ══════════ */}
        <div style={{
          width: 794, minHeight: 1123, background: '#ffffff',
          fontFamily: "'Manrope', 'Helvetica Neue', Arial, sans-serif",
          color: '#1E293B', fontSize: 12, lineHeight: 1.5,
          padding: '36px 44px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          borderRadius: 4,
        }}>

          {/* ── COVER HEADER ── */}
          <div style={{ borderBottom: '2px solid #1E3A5F', paddingBottom: 20, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                {/* Logo area */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'linear-gradient(135deg, #3B82F6, #14B8A6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid white', opacity: 0.9 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0F172A', fontFamily: "'Syne', sans-serif" }}>
                      Plasticity Scan<sup style={{ fontSize: 8, verticalAlign: 'super' }}>®</sup>
                    </div>
                    <div style={{ fontSize: 9, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      Diagnostic Systémique · HeR Labs
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#64748B' }}>Rapport généré le</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>{dateStr}</div>
              </div>
            </div>

            <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { label: 'Entreprise', value: companyName },
                { label: 'Profil', value: profileName },
                { label: 'Scans analysés', value: filteredScans.length },
                { label: 'Score moyen', value: stats ? `${stats.globalAvg} / 9` : '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  background: '#F1F5F9', borderRadius: 6, padding: '5px 12px',
                  display: 'flex', flexDirection: 'column', gap: 1,
                }}>
                  <span style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', fontWeight: 700 }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>{value}</span>
                </div>
              ))}
              {stats && (
                <div style={{ padding: '5px 12px', display: 'flex', alignItems: 'flex-end' }}>
                  <LevelBadge score={stats.globalAvg} />
                </div>
              )}
            </div>
          </div>

          {/* ── SECTION 1 : SCORES PAR DIMENSION ── */}
          {stats && (
            <section style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 3, height: 16, background: 'linear-gradient(to bottom, #3B82F6, #14B8A6)', borderRadius: 2 }} />
                <h2 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1E293B', fontFamily: "'Syne', sans-serif", margin: 0 }}>
                  Scores par dimension
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {stats.dimAvgs.map((dim) => (
                  <div key={dim.id} style={{
                    background: '#F8FAFC', border: '1px solid #E2E8F0',
                    borderRadius: 8, padding: '10px 14px',
                    borderLeft: `3px solid ${dim.color}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div>
                        <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', fontWeight: 700 }}>
                          Dim. {dim.id} · {dim.lever}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }}>
                          {dim.shortName}
                        </div>
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: dim.color, lineHeight: 1, fontFamily: "'Syne', sans-serif" }}>
                        {dim.avg}
                      </div>
                    </div>
                    <PrintBar score={dim.avg} color={dim.color} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── SECTION 2 : GRAPHIQUES ── */}
          {stats && (
            <section style={{ marginBottom: 28, pageBreakInside: 'avoid' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 3, height: 16, background: 'linear-gradient(to bottom, #14B8A6, #8B5CF6)', borderRadius: 2 }} />
                <h2 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1E293B', fontFamily: "'Syne', sans-serif", margin: 0 }}>
                  Profil systémique
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
                {/* Radar */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', fontWeight: 700, marginBottom: 6 }}>
                    Radar des dimensions
                  </div>
                  <div style={{ height: 210 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                        <PolarGrid stroke="#CBD5E1" gridType="polygon" />
                        <PolarAngleAxis dataKey="dimension"
                          tick={{ fontSize: 9, fill: '#64748B', fontFamily: 'Manrope, sans-serif' }} />
                        <PolarRadiusAxis angle={90} domain={[0, 9]} tickCount={4}
                          tick={{ fontSize: 7, fill: '#94A3B8' }} axisLine={false} />
                        <Radar dataKey="score" stroke="#3B82F6" strokeWidth={2}
                          fill="#3B82F6" fillOpacity={0.15} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bars + Profile */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* Bar chart */}
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 10 }}>
                    <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', fontWeight: 700, marginBottom: 6 }}>
                      Comparatif dimensions
                    </div>
                    <div style={{ height: 120 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 4 }}>
                          <XAxis type="number" domain={[0, 9]} tick={{ fontSize: 8, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 8, fill: '#64748B', fontFamily: 'Manrope, sans-serif' }} axisLine={false} tickLine={false} width={60} />
                          <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={10}>
                            {barData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Profile distribution */}
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', fontWeight: 700, marginBottom: 8 }}>
                      Répartition profils
                    </div>
                    {stats.profileData.map(p => (
                      <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 10, color: '#475569', flex: 1 }}>{p.name}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#1E293B' }}>{p.value}</span>
                        <span style={{ fontSize: 9, color: '#94A3B8', minWidth: 32, textAlign: 'right' }}>{p.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── SECTION 3 : TABLEAU DÉTAILLÉ ── */}
          <section style={{ pageBreakBefore: 'always' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 3, height: 16, background: 'linear-gradient(to bottom, #8B5CF6, #3B82F6)', borderRadius: 2 }} />
              <h2 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1E293B', fontFamily: "'Syne', sans-serif", margin: 0 }}>
                Réponses détaillées
                <span style={{ fontSize: 10, fontWeight: 400, textTransform: 'none', color: '#94A3B8', marginLeft: 8 }}>
                  {filteredScans.length} résultat{filteredScans.length !== 1 ? 's' : ''}
                </span>
              </h2>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
              <thead>
                <tr style={{ background: '#F1F5F9' }}>
                  {['Entreprise', 'Email', 'Profil', 'Score', 'Niveau', 'Date'].map(h => (
                    <th key={h} style={{
                      padding: '7px 10px', textAlign: 'left',
                      fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.08em',
                      color: '#64748B', fontWeight: 700, borderBottom: '1px solid #CBD5E1',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredScans.map((sc, i) => {
                  const gs = sc.global_score ?? 0
                  const { color } = plasticityLevel(gs)
                  return (
                    <tr key={sc.id ?? i} style={{ borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? '#fff' : '#FAFBFC' }}>
                      <td style={{ padding: '6px 10px', fontWeight: 600, color: '#1E293B' }}>
                        {sc.company ?? '—'}
                      </td>
                      <td style={{ padding: '6px 10px', color: '#64748B', fontSize: 9 }}>
                        {sc.email ?? '—'}
                      </td>
                      <td style={{ padding: '6px 10px' }}>
                        <span style={{
                          fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 12,
                          background: (PROFILE_COLORS[sc.profile] ?? '#64748B') + '18',
                          color: PROFILE_COLORS[sc.profile] ?? '#94A3B8',
                        }}>
                          {PROFILE_LABELS[sc.profile] ?? sc.profile ?? '—'}
                        </span>
                      </td>
                      <td style={{ padding: '6px 10px', fontWeight: 800, color, fontFamily: "'Syne', sans-serif", fontSize: 13 }}>
                        {gs.toFixed(1)}
                      </td>
                      <td style={{ padding: '6px 10px' }}>
                        <LevelBadge score={gs} />
                      </td>
                      <td style={{ padding: '6px 10px', color: '#94A3B8', fontSize: 9 }}>
                        {sc.created_at ? new Date(sc.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </section>

          {/* ── FOOTER ── */}
          <div style={{
            marginTop: 36, paddingTop: 14, borderTop: '1px solid #E2E8F0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 8, color: '#CBD5E1', letterSpacing: '0.06em' }}>
              PLASTICITY SCAN® — DIAGNOSTIC SYSTÉMIQUE · HER LABS 2026 · SENSUP
            </span>
            <span style={{ fontSize: 8, color: '#CBD5E1' }}>
              Document confidentiel · {dateStr}
            </span>
          </div>

        </div>
        {/* end A4 paper */}
      </div>
    </>
  )
}
