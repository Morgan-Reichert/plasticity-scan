import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/* ════════════════════════════════════════════════════════════
   TIMELINE  — all times in seconds from demo start
   Screens: landing 0-6s · survey 6-12s · computing 12-~15s
            results ~15-34s · dashboard 34-44s · outro 44s+
   ════════════════════════════════════════════════════════════ */
const TIMELINE = [

  /* ─── LANDING (0–6s) ─────────────────────────────────── */
  {
    id: 'l-title', type: 'bigtitle',
    start: 0.3, end: 4.8,
    title: 'Diagnostic de Plasticité Organisationnelle',
    subtitle: 'Mesurez et activez la capacité d\'adaptation de votre organisation',
    color: '#3B82F6',
  },
  {
    id: 'l-postit1', type: 'postit',
    start: 1.8, end: 5.7,
    text: '7 dimensions\nsystémiques\n14 questions',
    color: '#F59E0B',
    pos: { top: '18%', left: '3%' },
    rotate: '-4deg',
  },
  {
    id: 'l-callout1', type: 'callout',
    start: 3.2, end: 5.7,
    text: '3 niveaux d\'analyse :\nIndividuel • Équipe\n& Organisation',
    color: '#14B8A6',
    pos: { top: '32%', right: '3%' },
    from: 'right',
  },
  {
    id: 'l-postit2', type: 'postit',
    start: 4.5, end: 5.7,
    text: '5 min.\npar collaborateur',
    color: '#10B981',
    pos: { bottom: '22%', left: '4%' },
    rotate: '3deg',
  },

  /* ─── SURVEY (6–12s) ─────────────────────────────────── */
  {
    id: 's-title', type: 'bigtitle',
    start: 6.2, end: 9.5,
    title: 'Évaluation par Dimensions',
    subtitle: 'Chaque dimension analysée à travers 3 niveaux organisationnels',
    color: '#14B8A6',
  },
  {
    id: 's-postit1', type: 'postit',
    start: 7.8, end: 11.8,
    text: 'Badge de niveau\norganisationnel',
    color: '#8B5CF6',
    pos: { top: '24%', right: '3%' },
    rotate: '2.5deg',
  },
  {
    id: 's-callout1', type: 'callout',
    start: 9.2, end: 11.8,
    text: 'Curseur intuitif\n0 → 9 points\nRéponse en glissé',
    color: '#3B82F6',
    pos: { top: '62%', left: '3%' },
    from: 'left',
  },
  {
    id: 's-postit2', type: 'postit',
    start: 10.5, end: 11.8,
    text: 'Lecture\nsystémique\npar dimension',
    color: '#EF4444',
    pos: { top: '38%', left: '3%' },
    rotate: '-2deg',
  },

  /* ─── COMPUTING (12–15s) ─────────────────────────────── */
  {
    id: 'c-postit1', type: 'postit',
    start: 12.5, end: 14.8,
    text: 'Algorithme\nsystémique\nen temps réel',
    color: '#3B82F6',
    pos: { top: '14%', right: '8%' },
    rotate: '3deg',
  },
  {
    id: 'c-callout1', type: 'callout',
    start: 13.2, end: 14.8,
    text: '7 dimensions calculées\nLeviers prioritaires identifiés',
    color: '#14B8A6',
    pos: { bottom: '16%', left: '50%', transform: 'translateX(-50%)' },
    from: 'bottom',
  },

  /* ─── RESULTS (15–34s) ───────────────────────────────── */
  {
    id: 'r-title', type: 'bigtitle',
    start: 15.5, end: 20.0,
    title: 'Profil de Plasticité Révélé',
    subtitle: 'Score global · Radar systémique · Vision collective & individuelle',
    color: '#14B8A6',
  },
  {
    id: 'r-postit1', type: 'postit',
    start: 17.5, end: 23.5,
    text: 'Score global\npersonnalisé\nsur 9',
    color: '#F59E0B',
    pos: { top: '20%', left: '3%' },
    rotate: '-4deg',
  },
  {
    id: 'r-callout-radar', type: 'callout',
    start: 20.5, end: 26.5,
    text: 'Radar systémique\n7 dimensions visualisées\nen un coup d\'œil',
    color: '#3B82F6',
    pos: { top: '26%', right: '3%' },
    from: 'right',
  },
  {
    id: 'r-postit-col', type: 'postit',
    start: 23.5, end: 29.5,
    text: 'Vision\ncollective\nvs individuelle',
    color: '#14B8A6',
    pos: { top: '42%', left: '3%' },
    rotate: '2deg',
  },
  {
    id: 'r-callout-levers', type: 'callout',
    start: 26.5, end: 33.0,
    text: 'Leviers d\'action\nprioritaires identifiés\nautomatiquement',
    color: '#8B5CF6',
    pos: { top: '56%', right: '3%' },
    from: 'right',
  },
  {
    id: 'r-postit-pdf', type: 'postit',
    start: 29.5, end: 33.8,
    text: 'Rapport PDF\ngénéré par IA\n(Mistral)',
    color: '#EF4444',
    pos: { bottom: '22%', left: '4%' },
    rotate: '-2deg',
  },
  {
    id: 'r-callout-ai', type: 'callout',
    start: 31.5, end: 33.8,
    text: 'Débrief IA Mistral\nPersonnalisé & actionnable',
    color: '#F59E0B',
    pos: { bottom: '22%', right: '3%' },
    from: 'right',
  },

  /* ─── DASHBOARD (34–44s) ─────────────────────────────── */
  {
    id: 'd-title', type: 'bigtitle',
    start: 34.2, end: 38.8,
    title: 'Tableau de Bord Intervenants',
    subtitle: 'Vue agrégée multi-entreprises · Analyse IA · Export PDF intelligent',
    color: '#8B5CF6',
  },
  {
    id: 'd-postit1', type: 'postit',
    start: 36.5, end: 42.0,
    text: 'KPIs agrégés\npar entreprise',
    color: '#3B82F6',
    pos: { top: '30%', left: '3%' },
    rotate: '3deg',
  },
  {
    id: 'd-callout-chart', type: 'callout',
    start: 38.8, end: 43.5,
    text: 'Radar collectif\nTendances organisationnelles\nidentifiées en temps réel',
    color: '#14B8A6',
    pos: { top: '42%', right: '3%' },
    from: 'right',
  },
  {
    id: 'd-postit2', type: 'postit',
    start: 40.5, end: 43.5,
    text: 'Multi-entreprises\ngestion centralisée',
    color: '#F59E0B',
    pos: { bottom: '28%', left: '4%' },
    rotate: '-3deg',
  },
  {
    id: 'd-callout-pdf', type: 'callout',
    start: 41.8, end: 43.5,
    text: 'Export PDF intelligent\nAnalyse IA Mistral incluse',
    color: '#EF4444',
    pos: { bottom: '18%', right: '3%' },
    from: 'right',
  },

  /* ─── OUTRO (44s+) ───────────────────────────────────── */
  { id: 'outro', type: 'outro', start: 44.0, end: 999 },
]

/* ════════════════════════════════════════════════════════════
   ANNOTATION COMPONENTS
   ════════════════════════════════════════════════════════════ */

const PIN_COLORS = {
  '#F59E0B': '#DC2626',
  '#10B981': '#047857',
  '#8B5CF6': '#6D28D9',
  '#3B82F6': '#1D4ED8',
  '#14B8A6': '#0F766E',
  '#EF4444': '#B91C1C',
}
const TEXT_DARK = new Set(['#F59E0B', '#10B981'])

function PostIt({ text, color, pos, rotate = '0deg' }) {
  const bg = color + 'F2'
  const textColor = TEXT_DARK.has(color) ? '#0D1117' : '#FFFFFF'
  const pinColor = PIN_COLORS[color] ?? '#DC2626'

  return (
    <div style={{
      position: 'fixed',
      ...pos,
      background: bg,
      color: textColor,
      padding: '18px 18px 14px',
      borderRadius: 3,
      transform: `rotate(${rotate})`,
      boxShadow: '0 6px 24px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3)',
      fontSize: 13,
      fontWeight: 700,
      fontFamily: 'Manrope, sans-serif',
      lineHeight: 1.6,
      maxWidth: 152,
      zIndex: 9995,
      whiteSpace: 'pre-line',
      pointerEvents: 'none',
      animation: 'popIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both',
    }}>
      {/* Pin */}
      <div style={{
        position: 'absolute', top: -9, left: '50%',
        transform: 'translateX(-50%)',
        width: 16, height: 16, borderRadius: '50%',
        background: `radial-gradient(circle at 38% 35%, ${pinColor}CC, ${pinColor})`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.2)',
      }} />
      {/* Bottom fold */}
      <div style={{
        position: 'absolute', bottom: 0, right: 0,
        width: 0, height: 0,
        borderStyle: 'solid',
        borderWidth: '0 0 14px 14px',
        borderColor: `transparent transparent rgba(0,0,0,0.18) transparent`,
      }} />
      {text}
    </div>
  )
}

function Callout({ text, color, pos, from = 'right' }) {
  const animMap = {
    right:  'slideFromRight 0.4s ease both',
    left:   'slideFromLeft  0.4s ease both',
    bottom: 'slideFromBottom 0.4s ease both',
  }

  return (
    <div style={{
      position: 'fixed',
      ...pos,
      background: 'rgba(7,11,24,0.96)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      border: `1px solid ${color}55`,
      borderRadius: 14,
      padding: '14px 18px',
      maxWidth: 230,
      zIndex: 9994,
      pointerEvents: 'none',
      animation: animMap[from] ?? animMap.right,
      boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${color}18`,
    }}>
      {/* Accent dot row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
        <span style={{
          fontSize: 9, fontWeight: 800, color,
          textTransform: 'uppercase', letterSpacing: '0.14em',
          fontFamily: 'Manrope, sans-serif',
        }}>
          Plasticity Scan®
        </span>
      </div>
      {/* Text */}
      <p style={{
        color: '#F1F5F9', fontSize: 13, fontWeight: 600,
        lineHeight: 1.6, whiteSpace: 'pre-line',
        fontFamily: 'Manrope, sans-serif',
      }}>
        {text}
      </p>
      {/* Inner glow rim */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 14,
        boxShadow: `inset 0 0 0 1px ${color}18`,
        pointerEvents: 'none',
      }} />
    </div>
  )
}

function BigTitle({ title, subtitle, color }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(7,11,24,0.90)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 9990,
      pointerEvents: 'none',
      animation: 'fadeScaleIn 0.55s ease both',
    }}>
      {/* Radial glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 50%, ${color}14 0%, transparent 65%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', textAlign: 'center', padding: '0 48px', maxWidth: 680 }}>
        {/* Top accent bar */}
        <div style={{
          width: 72, height: 3, borderRadius: 2,
          background: `linear-gradient(to right, ${color}, transparent)`,
          margin: '0 auto 28px',
        }} />

        {/* Brand label */}
        <p style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: 10, color, textTransform: 'uppercase',
          letterSpacing: '0.28em', fontWeight: 800,
          marginBottom: 22,
        }}>
          Plasticity Scan® — by Sensup
        </p>

        {/* Main title */}
        <h2 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: 40, fontWeight: 800,
          color: '#F8FAFC', lineHeight: 1.15,
          marginBottom: 20,
        }}>
          {title}
        </h2>

        {/* Subtitle */}
        {subtitle && (
          <p style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 16, color: '#94A3B8',
            lineHeight: 1.65, fontWeight: 500,
          }}>
            {subtitle}
          </p>
        )}

        {/* Bottom accent bar */}
        <div style={{
          width: 72, height: 3, borderRadius: 2,
          background: `linear-gradient(to left, ${color}, transparent)`,
          margin: '28px auto 0',
        }} />
      </div>
    </div>
  )
}

function Outro() {
  const pills = [
    { label: '7 dimensions systémiques', color: '#3B82F6' },
    { label: '3 niveaux organisationnels', color: '#14B8A6' },
    { label: 'IA Mistral embarquée', color: '#8B5CF6' },
    { label: 'Rapport PDF intelligent', color: '#F59E0B' },
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#050910',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 10000,
      pointerEvents: 'none',
      animation: 'fadeScaleIn 0.8s ease both',
    }}>
      {/* Background radial glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.13) 0%, rgba(20,184,166,0.06) 35%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      {/* Dot grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.07) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative', textAlign: 'center',
        padding: '0 48px',
        animation: 'outroReveal 1s ease 0.4s both',
      }}>

        {/* Icon */}
        <div style={{
          width: 88, height: 88, borderRadius: 22,
          background: 'linear-gradient(135deg, #3B82F6, #14B8A6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 36px',
          boxShadow: '0 0 80px rgba(59,130,246,0.5), 0 0 40px rgba(20,184,166,0.3)',
          fontSize: 42, color: 'white',
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
        }}>
          ✦
        </div>

        {/* Main brand */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: 56, fontWeight: 800,
            lineHeight: 1,
            background: 'linear-gradient(90deg, #3B82F6 0%, #14B8A6 45%, #60A5FA 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 12,
          }}>
            Plasticity Scan®
          </h1>
          <p style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 13, color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.35em', fontWeight: 700,
          }}>
            by Sensup
          </p>
        </div>

        {/* Tagline */}
        <p style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: 20, color: '#94A3B8',
          lineHeight: 1.6, maxWidth: 500,
          margin: '0 auto 44px', fontWeight: 500,
        }}>
          Révélez et activez la plasticité organisationnelle de vos clients.
        </p>

        {/* Feature pills */}
        <div style={{
          display: 'flex', gap: 14, justifyContent: 'center',
          flexWrap: 'wrap', marginBottom: 52,
        }}>
          {pills.map(({ label, color }) => (
            <div key={label} style={{
              padding: '9px 22px', borderRadius: 100,
              background: color + '16',
              border: `1px solid ${color}40`,
              color, fontSize: 12, fontWeight: 700,
              fontFamily: 'Manrope, sans-serif',
              letterSpacing: '0.04em',
            }}>
              {label}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{
          width: 140, height: 1,
          background: 'linear-gradient(to right, transparent, rgba(59,130,246,0.45), transparent)',
          margin: '0 auto 32px',
        }} />

        {/* Footer */}
        <p style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: 12, color: '#334155',
          textTransform: 'uppercase',
          letterSpacing: '0.22em', fontWeight: 600,
        }}>
          Sensup · Diagnostic Systémique · 2026
        </p>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   MAIN OVERLAY COMPONENT
   ════════════════════════════════════════════════════════════ */
export default function DemoOverlay() {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    let t = 0
    const interval = setInterval(() => {
      t = parseFloat((t + 0.05).toFixed(2))
      setElapsed(t)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const visibleItems = TIMELINE.filter(
    item => elapsed >= item.start && elapsed < item.end
  )

  const renderItem = (item) => {
    switch (item.type) {
      case 'bigtitle':
        return <BigTitle key={item.id} {...item} />
      case 'postit':
        return <PostIt key={item.id} {...item} />
      case 'callout':
        return <Callout key={item.id} {...item} />
      case 'outro':
        return <Outro key={item.id} />
      default:
        return null
    }
  }

  return createPortal(
    <>{visibleItems.map(renderItem)}</>,
    document.body
  )
}
