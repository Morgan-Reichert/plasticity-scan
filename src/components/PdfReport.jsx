import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell,
} from 'recharts'
import { plasticityLevel } from '../surveyData'

const PROFILE_LABELS = { collaborateur: 'Collaborateur', manager: 'Manager', directeur: 'Directeur' }
const PROFILE_COLORS = { collaborateur: '#3B82F6', manager: '#14B8A6', directeur: '#8B5CF6' }
const LEVER_COLORS   = { Clarté: '#3B82F6', Cohérence: '#14B8A6', Soutenabilité: '#F59E0B', Robustesse: '#8B5CF6' }
const PHASE_COLORS   = ['#3B82F6', '#14B8A6', '#8B5CF6']

/* ── Score bar ── */
function PrintBar({ score, color, maxScore = 9 }) {
  const pct = Math.round((score / maxScore) * 100)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
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
    }}>{label}</span>
  )
}

/* ── Section header (divider + title) ── */
function SectionHeader({ title, gradient = 'linear-gradient(to bottom, #3B82F6, #14B8A6)', sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <div style={{ width: 3, height: 18, background: gradient, borderRadius: 2, flexShrink: 0 }} />
      <h2 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1E293B', fontFamily: "'Syne', sans-serif", margin: 0 }}>
        {title}
        {sub && <span style={{ fontSize: 10, fontWeight: 400, textTransform: 'none', color: '#94A3B8', marginLeft: 8 }}>{sub}</span>}
      </h2>
    </div>
  )
}

/* ══════════════════════════════════════════════
   AI DEBRIEF SECTION (rendered inside A4 paper)
   ══════════════════════════════════════════════ */
function AiDebriefSection({ ai }) {
  if (!ai) return null
  return (
    <section style={{ marginTop: 8, pageBreakBefore: 'always' }}>

      {/* ── Section header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 18, paddingBottom: 12,
        borderBottom: '1.5px solid #E2E8F0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13,
          }}>✦</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#1E293B', fontFamily: "'Syne', sans-serif", letterSpacing: '0.04em' }}>
              Analyse IA — Debrief Intervenant
            </div>
            <div style={{ fontSize: 9, color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Généré par Claude · Document confidentiel HeR Labs
            </div>
          </div>
        </div>
        <div style={{
          fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
          color: '#8B5CF6', background: '#8B5CF618', border: '1px solid #8B5CF630',
          padding: '3px 10px', borderRadius: 20,
        }}>
          Usage interne
        </div>
      </div>

      {/* ── 1. Synthèse exécutive ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748B', marginBottom: 8 }}>
          Synthèse exécutive
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #EFF6FF, #F0FDFB)',
          border: '1px solid #BFDBFE', borderLeft: '4px solid #3B82F6',
          borderRadius: '0 8px 8px 0', padding: '12px 16px',
          fontSize: 12, color: '#1E3A5F', lineHeight: 1.7, fontStyle: 'italic',
        }}>
          {ai.synthese}
        </div>
      </div>

      {/* ── 2. Tensions systémiques ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748B', marginBottom: 8 }}>
          Tensions systémiques identifiées
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {ai.tensions?.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                background: ['#3B82F6', '#F59E0B', '#EF4444'][i] + '15',
                border: `1.5px solid ${['#3B82F6', '#F59E0B', '#EF4444'][i]}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 800, color: ['#3B82F6', '#F59E0B', '#EF4444'][i],
              }}>
                {i + 1}
              </div>
              <div style={{ fontSize: 11, color: '#334155', lineHeight: 1.6, flex: 1, paddingTop: 2 }}>{t}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Directives d'intervention ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748B', marginBottom: 8 }}>
          Directives d'intervention par levier
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: ai.directives?.length > 1 ? '1fr 1fr' : '1fr', gap: 10 }}>
          {ai.directives?.map((dir, i) => {
            const color = LEVER_COLORS[dir.levier] ?? dir.couleur ?? '#64748B'
            return (
              <div key={i} style={{
                background: '#FAFBFC', border: `1px solid ${color}25`,
                borderTop: `3px solid ${color}`, borderRadius: '0 0 8px 8px',
                padding: '12px 14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <div style={{
                    fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                    color, background: color + '15', border: `1px solid ${color}30`,
                    padding: '2px 8px', borderRadius: 12,
                  }}>
                    #{dir.priorite} — {dir.levier}
                  </div>
                </div>
                {dir.actions?.map((a, j) => (
                  <div key={j} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 5 }}>
                    <div style={{
                      width: 5, height: 5, borderRadius: '50%', background: color,
                      marginTop: 5, flexShrink: 0, opacity: 0.7,
                    }} />
                    <span style={{ fontSize: 10, color: '#475569', lineHeight: 1.5 }}>{a}</span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 4. Feuille de route ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748B', marginBottom: 8 }}>
          Feuille de route recommandée
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {ai.roadmap?.map((phase, i) => {
            const c = PHASE_COLORS[i] ?? '#64748B'
            return (
              <div key={i} style={{
                background: '#FAFBFC', border: `1px solid ${c}20`,
                borderRadius: 8, padding: '10px 12px', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: `linear-gradient(to right, ${c}, ${c}60)`,
                }} />
                <div style={{ fontSize: 8, fontWeight: 700, color: c, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                  {phase.delai}
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#1E293B', lineHeight: 1.3, marginBottom: 4 }}>
                  {phase.phase}
                </div>
                <div style={{ fontSize: 9, color: '#64748B', lineHeight: 1.5, marginBottom: 7, fontStyle: 'italic' }}>
                  {phase.focus}
                </div>
                {phase.actions?.map((a, j) => (
                  <div key={j} style={{ display: 'flex', gap: 5, alignItems: 'flex-start', marginBottom: 3 }}>
                    <span style={{ color: c, fontSize: 9, marginTop: 1, flexShrink: 0 }}>→</span>
                    <span style={{ fontSize: 9, color: '#475569', lineHeight: 1.4 }}>{a}</span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 5. Points de vigilance ── */}
      {ai.vigilance?.length > 0 && (
        <div style={{
          background: '#FFF7ED', border: '1px solid #FED7AA',
          borderLeft: '4px solid #F59E0B', borderRadius: '0 8px 8px 0',
          padding: '12px 16px',
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#92400E', marginBottom: 8 }}>
            ⚠ Points de vigilance
          </div>
          {ai.vigilance.map((v, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: i < ai.vigilance.length - 1 ? 6 : 0 }}>
              <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: 10, flexShrink: 0 }}>•</span>
              <span style={{ fontSize: 10, color: '#78350F', lineHeight: 1.6 }}>{v}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/* ══════════════════════════════════════════════
   MAIN PDF REPORT
   ══════════════════════════════════════════════ */
export default function PdfReport({ stats, filteredScans, companies, companyFilter, profileFilter, onClose }) {
  const ref = useRef(null)
  const [aiContent, setAiContent] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const now = new Date()
  const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  const companyName = companyFilter !== 'all'
    ? (companies.find(c => c.id === companyFilter)?.name ?? 'Toutes')
    : 'Toutes les entreprises'
  const profileName = profileFilter !== 'all'
    ? (PROFILE_LABELS[profileFilter] ?? profileFilter)
    : 'Tous les profils'

  const radarData = stats?.dimAvgs.map(d => ({ dimension: d.shortName, score: d.avg, fullMark: 9 }))
  const barData   = stats?.dimAvgs.map(d => ({ name: d.shortName, score: d.avg, fill: d.color }))

  /* ── Generate AI debrief ── */
  const handleGenerate = async () => {
    setAiLoading(true)
    setAiError('')
    try {
      const dimensionsText = stats.dimAvgs
        .map(d => `  • ${d.name} (${d.shortName}) : ${d.avg}/9 — Levier : ${d.lever}`)
        .join('\n')
      const leversText = stats.leverData
        .slice(0, 3)
        .map((l, i) => `${i + 1}. ${l.name} (${l.count} occurrence${l.count > 1 ? 's' : ''})`)
        .join(', ')
      const profilesText = stats.profileData
        .map(p => `${p.name} : ${p.value} répondant${p.value > 1 ? 's' : ''} (${p.pct}%)`)
        .join(' | ')

      const res = await fetch('/api/generate-debrief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          n: stats.n,
          globalAvg: stats.globalAvg,
          globalLevel: plasticityLevel(stats.globalAvg).label,
          dimensions: dimensionsText,
          levers: leversText,
          profiles: profilesText,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? `Erreur ${res.status}`)
      }
      const data = await res.json()
      setAiContent(data)
    } catch (e) {
      setAiError(e.message ?? 'Erreur lors de la génération.')
    } finally {
      setAiLoading(false)
    }
  }

  return createPortal(
    <div id="pdf-report-root" ref={ref}>

      {/* ── Styles ── */}
      <style>{`
        @media print {
          html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
          body > *:not(#pdf-report-root) { display: none !important; }
          #pdf-report-root {
            position: static !important; background: transparent !important;
            padding: 0 !important; overflow: visible !important;
            display: block !important;
          }
          .pdf-screen-only { display: none !important; }
          @page { size: A4; margin: 10mm 12mm; }
        }
        @media screen {
          #pdf-report-root {
            position: fixed; inset: 0; z-index: 9999;
            background: rgba(8,12,24,0.94);
            display: flex; flex-direction: column;
            align-items: center; overflow-y: auto;
            padding: 0 0 60px;
          }
          .pdf-topbar {
            position: sticky; top: 0; z-index: 10;
            width: 100%; background: rgba(8,12,24,0.96);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(255,255,255,0.08);
            display: flex; align-items: center; justify-content: space-between;
            padding: 12px 24px; gap: 12px; flex-shrink: 0;
          }
        }
      `}</style>

      {/* ── Top control bar (screen only) ── */}
      <div className="pdf-screen-only pdf-topbar">
        {/* Left: branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94A3B8', fontSize: 12, fontFamily: 'Manrope, sans-serif' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6', animation: 'pulse 2s infinite' }} />
          <span style={{ fontWeight: 700, color: '#fff' }}>Rapport Plasticity Scan®</span>
          <span style={{ opacity: 0.5 }}>—</span>
          <span>{companyName}</span>
          {aiContent && (
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8B5CF6', background: '#8B5CF615', border: '1px solid #8B5CF630', padding: '2px 8px', borderRadius: 12 }}>
              ✦ Analyse IA incluse
            </span>
          )}
        </div>

        {/* Right: actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

          {/* Generate AI */}
          {!aiContent && (
            <button onClick={handleGenerate} disabled={aiLoading}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 18px', borderRadius: 10, cursor: aiLoading ? 'wait' : 'pointer',
                background: aiLoading ? 'rgba(139,92,246,0.1)' : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                border: '1px solid rgba(139,92,246,0.4)',
                color: aiLoading ? '#8B5CF6' : '#fff',
                fontSize: 12, fontWeight: 700, fontFamily: 'Manrope, sans-serif',
                opacity: aiLoading ? 0.8 : 1, transition: 'all 0.2s',
              }}>
              {aiLoading ? (
                <>
                  <div style={{ width: 12, height: 12, border: '2px solid rgba(139,92,246,0.3)', borderTop: '2px solid #8B5CF6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Génération en cours…
                </>
              ) : (
                <>✦ Générer l'analyse IA</>
              )}
            </button>
          )}

          {aiContent && (
            <button onClick={handleGenerate} disabled={aiLoading}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 10, cursor: 'pointer',
                background: 'transparent', border: '1px solid rgba(139,92,246,0.3)',
                color: '#8B5CF6', fontSize: 11, fontWeight: 600, fontFamily: 'Manrope, sans-serif',
              }}>
              ↺ Régénérer
            </button>
          )}

          {/* Print */}
          <button onClick={() => window.print()}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 18px', borderRadius: 10, cursor: 'pointer',
              background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.35)',
              color: '#60A5FA', fontSize: 12, fontWeight: 700, fontFamily: 'Manrope, sans-serif',
            }}>
            🖨 Imprimer / PDF
          </button>

          {/* Close */}
          <button onClick={onClose}
            style={{
              padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: '#94A3B8', fontSize: 12, fontWeight: 600, fontFamily: 'Manrope, sans-serif',
            }}>
            ✕
          </button>
        </div>
      </div>

      {/* Error banner */}
      {aiError && (
        <div className="pdf-screen-only" style={{
          width: 794, marginTop: 16, padding: '10px 16px', borderRadius: 8,
          background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B',
          fontSize: 12, fontFamily: 'Manrope, sans-serif',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          ⚠ {aiError}
        </div>
      )}

      {/* Loading overlay on paper */}
      {aiLoading && (
        <div className="pdf-screen-only" style={{
          width: 794, marginTop: 16, padding: '20px', borderRadius: 8,
          background: 'rgba(139,92,246,0.06)', border: '1px dashed rgba(139,92,246,0.3)',
          display: 'flex', alignItems: 'center', gap: 14,
          fontFamily: 'Manrope, sans-serif',
        }}>
          <div style={{ width: 20, height: 20, border: '2.5px solid rgba(139,92,246,0.2)', borderTop: '2.5px solid #8B5CF6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#8B5CF6' }}>Claude analyse le diagnostic…</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>Génération du debrief et des directives d'intervention en cours</div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>

      {/* ══════════ A4 PAPER ══════════ */}
      <div style={{
        width: 794,
        background: '#ffffff',
        fontFamily: "'Manrope', 'Helvetica Neue', Arial, sans-serif",
        color: '#1E293B', fontSize: 12, lineHeight: 1.5,
        padding: '36px 44px',
        marginTop: 20,
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        borderRadius: 4,
      }}>

        {/* ── COVER HEADER ── */}
        <div style={{ borderBottom: '2px solid #1E3A5F', paddingBottom: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                  Diagnostic Systémique · HeR Labs 2026 · Sensup
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#64748B' }}>Rapport généré le</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>{dateStr}</div>
            </div>
          </div>

          <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { label: 'Entreprise', value: companyName },
              { label: 'Profil', value: profileName },
              { label: 'Scans analysés', value: filteredScans.length },
              { label: 'Score moyen', value: stats ? `${stats.globalAvg} / 9` : '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: '#F1F5F9', borderRadius: 6, padding: '5px 12px', display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', fontWeight: 700 }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>{value}</span>
              </div>
            ))}
            {stats && (
              <div style={{ padding: '5px 12px', display: 'flex', alignItems: 'flex-end' }}>
                <LevelBadge score={stats.globalAvg} />
              </div>
            )}
            {aiContent && (
              <div style={{
                marginLeft: 'auto', padding: '5px 12px', background: '#F5F3FF',
                border: '1px solid #DDD6FE', borderRadius: 6,
                fontSize: 9, fontWeight: 700, color: '#7C3AED', letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                ✦ Analyse IA incluse
              </div>
            )}
          </div>
        </div>

        {/* ── SECTION 1 : SCORES PAR DIMENSION ── */}
        {stats && (
          <section style={{ marginBottom: 28 }}>
            <SectionHeader title="Scores par dimension" gradient="linear-gradient(to bottom, #3B82F6, #14B8A6)" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {stats.dimAvgs.map((dim) => (
                <div key={dim.id} style={{
                  background: '#F8FAFC', border: '1px solid #E2E8F0',
                  borderRadius: 8, padding: '10px 14px', borderLeft: `3px solid ${dim.color}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', fontWeight: 700 }}>Dim. {dim.id} · {dim.lever}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }}>{dim.shortName}</div>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: dim.color, lineHeight: 1, fontFamily: "'Syne', sans-serif" }}>{dim.avg}</div>
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
            <SectionHeader title="Profil systémique" gradient="linear-gradient(to bottom, #14B8A6, #8B5CF6)" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
              {/* Radar */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', fontWeight: 700, marginBottom: 6 }}>Radar des dimensions</div>
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                      <PolarGrid stroke="#CBD5E1" gridType="polygon" />
                      <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 9, fill: '#64748B', fontFamily: 'Manrope, sans-serif' }} />
                      <PolarRadiusAxis angle={90} domain={[0, 9]} tickCount={4} tick={{ fontSize: 7, fill: '#94A3B8' }} axisLine={false} />
                      <Radar dataKey="score" stroke="#3B82F6" strokeWidth={2} fill="#3B82F6" fillOpacity={0.15} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bars + Profile */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', fontWeight: 700, marginBottom: 6 }}>Comparatif dimensions</div>
                  <div style={{ height: 110 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 4 }}>
                        <XAxis type="number" domain={[0, 9]} tick={{ fontSize: 8, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 8, fill: '#64748B', fontFamily: 'Manrope, sans-serif' }} axisLine={false} tickLine={false} width={55} />
                        <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={9}>
                          {barData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', fontWeight: 700, marginBottom: 8 }}>Répartition profils</div>
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

        {/* ── SECTION 3 : IA DEBRIEF (if generated) ── */}
        <AiDebriefSection ai={aiContent} />

        {/* ── SECTION 4 : TABLEAU DÉTAILLÉ ── */}
        <section style={{ pageBreakBefore: aiContent ? 'always' : 'auto', marginTop: aiContent ? 0 : 0 }}>
          <SectionHeader
            title="Réponses détaillées"
            gradient="linear-gradient(to bottom, #8B5CF6, #3B82F6)"
            sub={`${filteredScans.length} résultat${filteredScans.length !== 1 ? 's' : ''}`}
          />
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
            <thead>
              <tr style={{ background: '#F1F5F9' }}>
                {['Entreprise', 'Email', 'Profil', 'Score', 'Niveau', 'Date'].map(h => (
                  <th key={h} style={{ padding: '7px 10px', textAlign: 'left', fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', fontWeight: 700, borderBottom: '1px solid #CBD5E1' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredScans.map((sc, i) => {
                const gs = sc.global_score ?? 0
                const { color } = plasticityLevel(gs)
                return (
                  <tr key={sc.id ?? i} style={{ borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? '#fff' : '#FAFBFC' }}>
                    <td style={{ padding: '6px 10px', fontWeight: 600, color: '#1E293B' }}>{sc.company ?? '—'}</td>
                    <td style={{ padding: '6px 10px', color: '#64748B', fontSize: 9 }}>{sc.email ?? '—'}</td>
                    <td style={{ padding: '6px 10px' }}>
                      <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 12, background: (PROFILE_COLORS[sc.profile] ?? '#64748B') + '18', color: PROFILE_COLORS[sc.profile] ?? '#94A3B8' }}>
                        {PROFILE_LABELS[sc.profile] ?? sc.profile ?? '—'}
                      </span>
                    </td>
                    <td style={{ padding: '6px 10px', fontWeight: 800, color, fontFamily: "'Syne', sans-serif", fontSize: 13 }}>{gs.toFixed(1)}</td>
                    <td style={{ padding: '6px 10px' }}><LevelBadge score={gs} /></td>
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
        <div style={{ marginTop: 36, paddingTop: 14, borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 8, color: '#CBD5E1', letterSpacing: '0.06em' }}>
            PLASTICITY SCAN® — DIAGNOSTIC SYSTÉMIQUE · HER LABS 2026 · SENSUP
          </span>
          <span style={{ fontSize: 8, color: '#CBD5E1' }}>Document confidentiel · {dateStr}</span>
        </div>

      </div>
      {/* end A4 paper */}
    </div>,
    document.body
  )
}
