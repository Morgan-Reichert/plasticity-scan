import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/* ══════════════════════════════════════════════════════════════
   EASING HELPERS
   ══════════════════════════════════════════════════════════════ */
const easeOutCubic  = t => 1 - Math.pow(1 - t, 3)
const easeOutBack   = t => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2) }
const easeInCubic   = t => t * t * t
const clamp         = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

/* getVis — returns { opacity, progress } for an item at given elapsed.
   progress 0→1 during fadeIn, stays 1, then 1→0 during fadeOut.
   Returns null when outside [start, end + fadeOut]. */
function getVis(elapsed, start, end, fadeIn = 0.4, fadeOut = 0.38) {
  const timeIn   = elapsed - start
  const timeLeft = end - elapsed
  if (timeIn < 0 || timeLeft < -fadeOut) return null

  let progress
  if      (timeIn   < fadeIn)  progress = clamp(timeIn  / fadeIn,  0, 1)
  else if (timeLeft < fadeOut) progress = clamp(timeLeft / fadeOut, 0, 1)
  else                         progress = 1

  return { opacity: progress, progress }
}

/* ══════════════════════════════════════════════════════════════
   TIMELINE — all times in seconds from demo start
   Screen transitions (App.jsx):
     0s   → landing
     6s   → survey
     12s  → computing
     ~14.8s → results   (ComputingScreen.onComplete at t+2.8s)
     34s  → dashboard
     44s  → outro (overlay only, screen stays dashboard)

   Rules:
     • Every annotation must END at least 0.3s BEFORE its screen's transition
     • Every annotation must START at least 0.4s AFTER its screen begins
     • Banners never overlap with post-its (banner ends before post-its start)
   ══════════════════════════════════════════════════════════════ */
const TIMELINE = [

  /* ── LANDING (0 – 6s) ──────────────────────────────────────
     Banner: 0.3 → 3.4s  (screen fully visible below banner)
     Post-its / callouts: 3.6s → 5.7s (no overlap with banner) */
  {
    id: 'l-banner', type: 'banner',
    start: 0.3, end: 3.4,
    title: 'Diagnostic de Plasticité Organisationnelle',
    subtitle: 'Mesurez et activez la capacité d\'adaptation de votre organisation',
    color: '#3B82F6',
  },
  {
    id: 'l-postit1', type: 'postit',
    start: 3.6, end: 5.7,
    text: '7 dimensions\nsystémiques\n14 questions',
    color: '#F59E0B',
    pos: { top: '22%', left: '3%' }, rotate: '-4deg',
  },
  {
    id: 'l-callout1', type: 'callout',
    start: 4.0, end: 5.7,
    text: '3 niveaux d\'analyse :\nIndividuel • Équipe\n& Organisation',
    color: '#14B8A6',
    pos: { top: '35%', right: '3%' }, from: 'right',
  },
  {
    id: 'l-postit2', type: 'postit',
    start: 4.6, end: 5.7,
    text: '5 min.\npar collaborateur',
    color: '#10B981',
    pos: { bottom: '24%', left: '4%' }, rotate: '3deg',
  },

  /* ── SURVEY (6 – 12s) ──────────────────────────────────────
     Banner: 6.4 → 9.0s
     Post-its / callouts: 9.2s → 11.7s */
  {
    id: 's-banner', type: 'banner',
    start: 6.4, end: 9.0,
    title: 'Évaluation par Dimensions',
    subtitle: 'Chaque dimension analysée à travers 3 niveaux organisationnels',
    color: '#14B8A6',
  },
  {
    id: 's-postit1', type: 'postit',
    start: 9.2, end: 11.7,
    text: 'Badge de niveau\norganisationnel',
    color: '#8B5CF6',
    pos: { top: '28%', right: '3%' }, rotate: '2.5deg',
  },
  {
    id: 's-callout1', type: 'callout',
    start: 9.5, end: 11.7,
    text: 'Curseur intuitif\n0 → 9 points\nRéponse en glissé',
    color: '#3B82F6',
    pos: { top: '64%', left: '3%' }, from: 'left',
  },
  {
    id: 's-postit2', type: 'postit',
    start: 10.4, end: 11.7,
    text: 'Lecture\nsystémique\npar dimension',
    color: '#EF4444',
    pos: { top: '42%', left: '3%' }, rotate: '-2deg',
  },

  /* ── COMPUTING (12 – ~14.8s) ───────────────────────────────
     Short screen: no banner, just two annotations */
  {
    id: 'c-postit1', type: 'postit',
    start: 12.5, end: 14.5,
    text: 'Algorithme\nsystémique\nen temps réel',
    color: '#3B82F6',
    pos: { top: '18%', right: '8%' }, rotate: '3deg',
  },
  {
    id: 'c-callout1', type: 'callout',
    start: 13.1, end: 14.5,
    text: '7 dimensions calculées\nLeviers prioritaires identifiés',
    color: '#14B8A6',
    pos: { bottom: '18%', left: '50%', transform: 'translateX(-50%)' }, from: 'bottom',
  },

  /* ── RESULTS (~14.8 – 34s) ─────────────────────────────────
     Banner: 15.1 → 18.2s
     Then staggered post-its + callouts, last ends at 33.7s */
  {
    id: 'r-banner', type: 'banner',
    start: 15.1, end: 18.2,
    title: 'Profil de Plasticité Révélé',
    subtitle: 'Score global · Radar systémique · Vision collective & individuelle',
    color: '#14B8A6',
  },
  {
    id: 'r-postit1', type: 'postit',
    start: 18.4, end: 24.0,
    text: 'Score global\npersonnalisé\nsur 9',
    color: '#F59E0B',
    pos: { top: '24%', left: '3%' }, rotate: '-4deg',
  },
  {
    id: 'r-callout-radar', type: 'callout',
    start: 19.5, end: 26.5,
    text: 'Radar systémique\n7 dimensions visualisées\nen un coup d\'œil',
    color: '#3B82F6',
    pos: { top: '28%', right: '3%' }, from: 'right',
  },
  {
    id: 'r-postit-col', type: 'postit',
    start: 24.0, end: 29.5,
    text: 'Vision\ncollective\nvs individuelle',
    color: '#14B8A6',
    pos: { top: '44%', left: '3%' }, rotate: '2deg',
  },
  {
    id: 'r-callout-levers', type: 'callout',
    start: 26.5, end: 33.0,
    text: 'Leviers d\'action\nprioritaires identifiés\nautomatiquement',
    color: '#8B5CF6',
    pos: { top: '56%', right: '3%' }, from: 'right',
  },
  {
    id: 'r-postit-pdf', type: 'postit',
    start: 29.5, end: 33.7,
    text: 'Rapport PDF\ngénéré par IA\n(Mistral)',
    color: '#EF4444',
    pos: { bottom: '24%', left: '4%' }, rotate: '-2deg',
  },
  {
    id: 'r-callout-ai', type: 'callout',
    start: 31.2, end: 33.7,
    text: 'Débrief IA Mistral\nPersonnalisé & actionnable',
    color: '#F59E0B',
    pos: { bottom: '24%', right: '3%' }, from: 'right',
  },

  /* ── DASHBOARD (34 – 44s) ──────────────────────────────────
     Banner: 34.3 → 37.5s
     Post-its + callouts: 37.7s → 43.7s */
  {
    id: 'd-banner', type: 'banner',
    start: 34.3, end: 37.5,
    title: 'Tableau de Bord Intervenants',
    subtitle: 'Vue agrégée multi-entreprises · Analyse IA · Export PDF intelligent',
    color: '#8B5CF6',
  },
  {
    id: 'd-postit1', type: 'postit',
    start: 37.7, end: 42.5,
    text: 'KPIs agrégés\npar entreprise',
    color: '#3B82F6',
    pos: { top: '30%', left: '3%' }, rotate: '3deg',
  },
  {
    id: 'd-callout-chart', type: 'callout',
    start: 38.5, end: 43.5,
    text: 'Radar collectif\nTendances organisationnelles\nidentifiées en temps réel',
    color: '#14B8A6',
    pos: { top: '44%', right: '3%' }, from: 'right',
  },
  {
    id: 'd-postit2', type: 'postit',
    start: 40.5, end: 43.5,
    text: 'Multi-entreprises\ngestion centralisée',
    color: '#F59E0B',
    pos: { bottom: '28%', left: '4%' }, rotate: '-3deg',
  },
  {
    id: 'd-callout-pdf', type: 'callout',
    start: 41.8, end: 43.7,
    text: 'Export PDF intelligent\nAnalyse IA Mistral incluse',
    color: '#EF4444',
    pos: { bottom: '18%', right: '3%' }, from: 'right',
  },

  /* ── OUTRO (44s+) ──────────────────────────────────────────
     Full-screen branding slide — runs until end of recording */
  { id: 'outro', type: 'outro', start: 44.0, end: 999 },
]

/* ══════════════════════════════════════════════════════════════
   ANNOTATION COMPONENTS
   All receive { vis } = { opacity, progress } from getVis()
   ══════════════════════════════════════════════════════════════ */

const PIN_BG = {
  '#F59E0B': '#B45309', '#10B981': '#047857',
  '#8B5CF6': '#6D28D9', '#3B82F6': '#1D4ED8',
  '#14B8A6': '#0F766E', '#EF4444': '#B91C1C',
}
const DARK_TEXT = new Set(['#F59E0B', '#10B981'])

function PostIt({ text, color, pos, rotate = '0deg', vis }) {
  const { opacity, progress } = vis
  // Entry: pop in with springy scale (easeOutBack on progress)
  // Exit: shrink + lift (easeInCubic on 1-progress)
  const exitAmount = clamp(1 - progress, 0, 1)
  const entryAmount = clamp(progress, 0, 1)
  const scale = opacity < 1 && progress < 1
    ? easeOutBack(entryAmount) * 0.92 + 0.08   // spring entry scale 0→1
    : 1 - easeInCubic(exitAmount) * 0.14        // subtle shrink on exit
  const lift  = opacity < 1 && progress < 1 ? 0 : exitAmount * -12

  return (
    <div style={{
      position: 'fixed',
      ...pos,
      background: color + 'F0',
      color: DARK_TEXT.has(color) ? '#0D1117' : '#FFFFFF',
      padding: '18px 18px 14px',
      borderRadius: 3,
      transform: `rotate(${rotate}) scale(${scale}) translateY(${lift}px)`,
      transformOrigin: 'top center',
      boxShadow: `0 6px 28px rgba(0,0,0,0.52), 0 2px 6px rgba(0,0,0,0.28)`,
      fontSize: 13, fontWeight: 700,
      fontFamily: 'Manrope, sans-serif',
      lineHeight: 1.6, maxWidth: 152,
      zIndex: 9995, whiteSpace: 'pre-line',
      pointerEvents: 'none', opacity,
    }}>
      {/* Pin */}
      <div style={{
        position: 'absolute', top: -10, left: '50%',
        transform: 'translateX(-50%)',
        width: 17, height: 17, borderRadius: '50%',
        background: `radial-gradient(circle at 36% 34%, ${PIN_BG[color] ?? '#B91C1C'}AA, ${PIN_BG[color] ?? '#B91C1C'})`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.55)',
      }} />
      {/* Bottom-right fold */}
      <div style={{
        position: 'absolute', bottom: 0, right: 0, width: 0, height: 0,
        borderStyle: 'solid', borderWidth: '0 0 13px 13px',
        borderColor: 'transparent transparent rgba(0,0,0,0.2) transparent',
      }} />
      {text}
    </div>
  )
}

function Callout({ text, color, pos, from = 'right', vis }) {
  const { opacity, progress } = vis
  // Slide direction based on 'from'
  const exitAmount = clamp(1 - progress, 0, 1)
  const tx = from === 'right'  ?  easeOutCubic(1 - exitAmount) * -1 + 1  // slide right on exit
           : from === 'left'   ? -1 + easeOutCubic(1 - exitAmount)
           : 0
  const translateX = from === 'right' || from === 'left'
    ? (1 - easeOutCubic(clamp(progress, 0, 1))) * (from === 'right' ? 38 : -38)
    : 0
  const translateY = from === 'bottom'
    ? (1 - easeOutCubic(clamp(progress, 0, 1))) * 28
    : exitAmount * 8

  return (
    <div style={{
      position: 'fixed',
      ...pos,
      background: 'rgba(6,10,22,0.96)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      border: `1px solid ${color}55`,
      borderRadius: 14,
      padding: '14px 18px',
      maxWidth: 230, zIndex: 9994,
      pointerEvents: 'none', opacity,
      transform: `translateX(${translateX}px) translateY(${translateY}px)`,
      boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 24px ${color}18`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: color, boxShadow: `0 0 7px ${color}`,
        }} />
        <span style={{
          fontSize: 9, fontWeight: 800, color,
          textTransform: 'uppercase', letterSpacing: '0.15em',
          fontFamily: 'Manrope, sans-serif',
        }}>Plasticity Scan®</span>
      </div>
      <p style={{
        color: '#F1F5F9', fontSize: 13, fontWeight: 600,
        lineHeight: 1.6, whiteSpace: 'pre-line', fontFamily: 'Manrope, sans-serif',
      }}>{text}</p>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 14,
        boxShadow: `inset 0 0 0 1px ${color}1A`, pointerEvents: 'none',
      }} />
    </div>
  )
}

function Banner({ title, subtitle, color, vis }) {
  const { opacity, progress } = vis
  const translateY = (1 - easeOutCubic(clamp(progress, 0, 1))) * -100
  // Exit: slide back up
  const exitAmount = clamp(1 - progress, 0, 1)
  const exitY = exitAmount > 0.01 ? easeInCubic(exitAmount) * -60 : 0
  const finalY = progress < 1 ? translateY : exitY

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 9992, pointerEvents: 'none',
      background: 'rgba(4,8,20,0.97)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: `1px solid ${color}45`,
      padding: '13px 48px 17px',
      boxShadow: `0 4px 40px rgba(0,0,0,0.6), 0 1px 0 ${color}22`,
      opacity,
      transform: `translateY(${finalY}px)`,
    }}>
      {/* Top accent stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(to right, ${color}, ${color}00)`,
      }} />
      <p style={{
        fontSize: 9, color, textTransform: 'uppercase', letterSpacing: '0.26em',
        fontWeight: 800, fontFamily: 'Manrope, sans-serif', marginBottom: 5,
      }}>
        ✦ Plasticity Scan® — by Sensup
      </p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, flexWrap: 'wrap' }}>
        <h2 style={{
          fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800,
          color: '#F8FAFC', lineHeight: 1.2, margin: 0,
        }}>{title}</h2>
        {subtitle && (
          <p style={{
            fontFamily: 'Manrope, sans-serif', fontSize: 12, color: '#64748B',
            lineHeight: 1.4, margin: 0,
          }}>{subtitle}</p>
        )}
      </div>
    </div>
  )
}

function Outro({ vis }) {
  const { opacity, progress } = vis
  const enterAmount = easeOutCubic(clamp(progress, 0, 1))
  const contentY = (1 - enterAmount) * 32

  const pills = [
    { label: '7 dimensions systémiques', color: '#3B82F6' },
    { label: '3 niveaux organisationnels', color: '#14B8A6' },
    { label: 'IA Mistral embarquée',       color: '#8B5CF6' },
    { label: 'Rapport PDF intelligent',    color: '#F59E0B' },
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: `rgba(4,8,18,${enterAmount * 0.98})`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 10000, pointerEvents: 'none',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.13) 0%, rgba(20,184,166,0.06) 35%, transparent 65%)',
        opacity: enterAmount, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.07) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        opacity: enterAmount, pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative', textAlign: 'center', padding: '0 48px',
        opacity: enterAmount, transform: `translateY(${contentY}px)`,
      }}>
        {/* Icon */}
        <div style={{
          width: 88, height: 88, borderRadius: 22, margin: '0 auto 36px',
          background: 'linear-gradient(135deg, #3B82F6, #14B8A6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 80px rgba(59,130,246,0.5), 0 0 40px rgba(20,184,166,0.3)',
          fontSize: 42, color: 'white', fontFamily: 'Syne, sans-serif', fontWeight: 800,
        }}>✦</div>

        {/* Brand */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{
            fontFamily: 'Syne, sans-serif', fontSize: 56, fontWeight: 800, lineHeight: 1,
            background: 'linear-gradient(90deg, #3B82F6 0%, #14B8A6 45%, #60A5FA 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', marginBottom: 12,
          }}>Plasticity Scan®</h1>
          <p style={{
            fontFamily: 'Manrope, sans-serif', fontSize: 13, color: '#475569',
            textTransform: 'uppercase', letterSpacing: '0.35em', fontWeight: 700,
          }}>by Sensup</p>
        </div>

        {/* Tagline */}
        <p style={{
          fontFamily: 'Manrope, sans-serif', fontSize: 20, color: '#94A3B8',
          lineHeight: 1.6, maxWidth: 500, margin: '0 auto 44px', fontWeight: 500,
        }}>
          Révélez et activez la plasticité organisationnelle de vos clients.
        </p>

        {/* Pills */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 52 }}>
          {pills.map(({ label, color }) => (
            <div key={label} style={{
              padding: '9px 22px', borderRadius: 100,
              background: color + '18', border: `1px solid ${color}40`,
              color, fontSize: 12, fontWeight: 700,
              fontFamily: 'Manrope, sans-serif', letterSpacing: '0.04em',
            }}>{label}</div>
          ))}
        </div>

        {/* Divider */}
        <div style={{
          width: 140, height: 1,
          background: 'linear-gradient(to right, transparent, rgba(59,130,246,0.45), transparent)',
          margin: '0 auto 32px',
        }} />

        <p style={{
          fontFamily: 'Manrope, sans-serif', fontSize: 12, color: '#334155',
          textTransform: 'uppercase', letterSpacing: '0.22em', fontWeight: 600,
        }}>Sensup · Diagnostic Systémique · 2026</p>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN OVERLAY — RAF-driven 60fps timer
   ══════════════════════════════════════════════════════════════ */
export default function DemoOverlay() {
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(null)

  useEffect(() => {
    startRef.current = performance.now()
    let rafId
    const tick = () => {
      setElapsed((performance.now() - startRef.current) / 1000)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  // Keep items in DOM for fadeOut duration after their end time (0.38s)
  const FADE_OUT = 0.38
  const activeItems = TIMELINE.filter(
    item => elapsed >= item.start && elapsed < item.end + FADE_OUT
  )

  const renderItem = (item) => {
    const vis = getVis(elapsed, item.start, item.end)
    if (!vis) return null

    switch (item.type) {
      case 'banner':  return <Banner  key={item.id} {...item} vis={vis} />
      case 'postit':  return <PostIt  key={item.id} {...item} vis={vis} />
      case 'callout': return <Callout key={item.id} {...item} vis={vis} />
      case 'outro':   return <Outro   key={item.id} vis={vis} />
      default:        return null
    }
  }

  return createPortal(
    <>{activeItems.map(renderItem)}</>,
    document.body
  )
}
