import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/* ══════════════════════════════════════════════════════════════
   EASING HELPERS
   ══════════════════════════════════════════════════════════════ */
const easeOutCubic = t => 1 - Math.pow(1 - t, 3)
const easeOutBack  = t => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2) }
const easeInCubic  = t => t * t * t
const clamp        = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

/* getVis — progress 0→1 (enter), stays 1, then 1→0 (exit).
   Returns null when fully outside visible range. */
function getVis(elapsed, start, end, fadeIn = 0.38, fadeOut = 0.36) {
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
     0s      → landing
     6s      → survey
     12s     → computing
     ~14.8s  → results  (ComputingScreen.onComplete after 2.8s)
     34s     → dashboard
     44s     → outro (overlay only)

   Hard rules:
     • Banner appears first on each screen, ends before other elements start
     • No element starts within 0.4s of a screen transition
     • No element ends within 0.3s AFTER its screen's transition
       (i.e., must end 0.3s before the NEXT transition)
   ══════════════════════════════════════════════════════════════ */
const TIMELINE = [

  /* ─── LANDING (0–6s) ─────────────────────────────────────── */
  /* Banner 0.3→3.3 | other elements 3.5→5.7 */
  {
    id: 'l-banner', type: 'banner',
    start: 0.3, end: 3.3,
    title: 'Diagnostic de Plasticité Organisationnelle',
    subtitle: 'Mesurez et activez la capacité d\'adaptation de votre organisation',
    color: '#3B82F6',
  },
  {
    id: 'l-minicard', type: 'minicard',
    start: 3.5, end: 5.7,
    icon: '⬡', value: '7', label: 'dimensions systémiques',
    color: '#3B82F6',
    pos: { top: '22%', left: '3%' }, from: 'left',
  },
  {
    id: 'l-callout', type: 'callout',
    start: 3.9, end: 5.7,
    text: '3 niveaux d\'analyse :\nIndividuel • Équipe\n& Organisation',
    color: '#14B8A6',
    pos: { top: '36%', right: '3%' }, from: 'right',
  },
  {
    id: 'l-tag', type: 'tag',
    start: 4.7, end: 5.7,
    text: '⚡ 5 min · résultat immédiat',
    color: '#F59E0B',
    pos: { bottom: '22%', left: '50%', transform: 'translateX(-50%)' },
  },

  /* ─── SURVEY (6–12s) ──────────────────────────────────────── */
  /* Banner 6.4→9.0 | other elements 9.2→11.7 */
  {
    id: 's-banner', type: 'banner',
    start: 6.4, end: 9.0,
    title: 'Évaluation par Dimensions',
    subtitle: 'Chaque dimension analysée à travers 3 niveaux organisationnels',
    color: '#14B8A6',
  },
  {
    id: 's-postit', type: 'postit',
    start: 9.2, end: 11.7,
    text: 'Badge de niveau\norganisationnel',
    color: '#8B5CF6',
    pos: { top: '28%', right: '3%' }, rotate: '2.5deg',
  },
  {
    id: 's-callout', type: 'callout',
    start: 9.5, end: 11.7,
    text: 'Curseur intuitif\n0 → 9 points\nRéponse en glissé',
    color: '#3B82F6',
    pos: { top: '64%', left: '3%' }, from: 'left',
  },
  {
    id: 's-tag', type: 'tag',
    start: 10.4, end: 11.7,
    text: '🔬 Lecture systémique par dimension',
    color: '#14B8A6',
    pos: { top: '44%', left: '3%' },
  },

  /* ─── COMPUTING (12–~14.8s) ───────────────────────────────── */
  /* Short screen, no banner — just 2 elements */
  {
    id: 'c-minicard', type: 'minicard',
    start: 12.5, end: 14.5,
    icon: '⚙', value: '5', label: 'étapes d\'analyse',
    color: '#14B8A6',
    pos: { top: '18%', right: '8%' }, from: 'right',
  },
  {
    id: 'c-callout', type: 'callout',
    start: 13.1, end: 14.5,
    text: '7 dimensions calculées\nLeviers prioritaires identifiés',
    color: '#3B82F6',
    pos: { bottom: '18%', left: '50%', transform: 'translateX(-50%)' }, from: 'bottom',
  },

  /* ─── RESULTS (~14.8–34s) ─────────────────────────────────── */
  /* Banner 15.1→18.1 | staggered elements 18.3→33.7 */
  {
    id: 'r-banner', type: 'banner',
    start: 15.1, end: 18.1,
    title: 'Profil de Plasticité Révélé',
    subtitle: 'Score global · Radar systémique · Vision collective & individuelle',
    color: '#14B8A6',
  },
  {
    id: 'r-postit', type: 'postit',
    start: 18.3, end: 24.0,
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
    id: 'r-minicard-col', type: 'minicard',
    start: 24.0, end: 29.5,
    icon: '◉', value: '∑', label: 'vision collective',
    color: '#14B8A6',
    pos: { top: '44%', left: '3%' }, from: 'left',
  },
  {
    id: 'r-callout-levers', type: 'callout',
    start: 26.5, end: 33.0,
    text: 'Leviers d\'action\nprioritaires identifiés\nautomatiquement',
    color: '#8B5CF6',
    pos: { top: '54%', right: '3%' }, from: 'right',
  },
  {
    id: 'r-tag-pdf', type: 'tag',
    start: 29.5, end: 33.7,
    text: '📄 Rapport PDF · Analyse IA Mistral',
    color: '#EF4444',
    pos: { bottom: '24%', left: '4%' },
  },
  {
    id: 'r-callout-ai', type: 'callout',
    start: 31.2, end: 33.7,
    text: 'Débrief IA Mistral\nPersonnalisé & actionnable',
    color: '#F59E0B',
    pos: { bottom: '24%', right: '3%' }, from: 'right',
  },

  /* ─── DASHBOARD (34–44s) ──────────────────────────────────── */
  /* Banner 34.3→37.4 | elements 37.6→43.7 */
  {
    id: 'd-banner', type: 'banner',
    start: 34.3, end: 37.4,
    title: 'Tableau de Bord Intervenants',
    subtitle: 'Vue agrégée multi-entreprises · Analyse IA · Export PDF intelligent',
    color: '#8B5CF6',
  },
  {
    id: 'd-minicard', type: 'minicard',
    start: 37.6, end: 43.0,
    icon: '▦', value: '8', label: 'scans analysés',
    color: '#3B82F6',
    pos: { top: '30%', left: '3%' }, from: 'left',
  },
  {
    id: 'd-callout-chart', type: 'callout',
    start: 38.6, end: 43.5,
    text: 'Radar collectif\nTendances organisationnelles\nidentifiées en temps réel',
    color: '#14B8A6',
    pos: { top: '42%', right: '3%' }, from: 'right',
  },
  {
    id: 'd-tag', type: 'tag',
    start: 40.5, end: 43.5,
    text: '🏢 Gestion multi-entreprises',
    color: '#F59E0B',
    pos: { bottom: '28%', left: '4%' },
  },
  {
    id: 'd-callout-pdf', type: 'callout',
    start: 41.8, end: 43.7,
    text: 'Export PDF intelligent\nAnalyse IA Mistral incluse',
    color: '#EF4444',
    pos: { bottom: '18%', right: '3%' }, from: 'right',
  },

  /* ─── OUTRO (44s+) ────────────────────────────────────────── */
  { id: 'outro', type: 'outro', start: 44.0, end: 999 },
]

/* ══════════════════════════════════════════════════════════════
   COMPONENTS
   ══════════════════════════════════════════════════════════════ */

/* ── Banner (top bar, slides from top) ─────────────────────── */
function Banner({ title, subtitle, color, vis }) {
  const { opacity, progress } = vis
  const slideIn  = (1 - easeOutCubic(clamp(progress, 0, 1))) * -100
  const slideOut = easeInCubic(clamp(1 - progress, 0, 1)) * -55
  const ty = progress < 1 ? slideIn : slideOut
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      zIndex: 9992, pointerEvents: 'none',
      background: 'rgba(4,8,20,0.97)',
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      borderBottom: `1px solid ${color}45`,
      padding: '13px 48px 17px',
      boxShadow: `0 4px 40px rgba(0,0,0,0.6), 0 1px 0 ${color}22`,
      opacity, transform: `translateY(${ty}px)`,
    }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3,
        background:`linear-gradient(to right,${color},${color}00)` }} />
      <p style={{ fontSize:9, color, textTransform:'uppercase', letterSpacing:'0.26em',
        fontWeight:800, fontFamily:'Manrope,sans-serif', marginBottom:5 }}>
        ✦ Plasticity Scan® — by Sensup
      </p>
      <div style={{ display:'flex', alignItems:'baseline', gap:18, flexWrap:'wrap' }}>
        <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800,
          color:'#F8FAFC', lineHeight:1.2, margin:0 }}>{title}</h2>
        {subtitle && <p style={{ fontFamily:'Manrope,sans-serif', fontSize:12,
          color:'#64748B', lineHeight:1.4, margin:0 }}>{subtitle}</p>}
      </div>
    </div>
  )
}

/* ── PostIt (sticky note with pin) ─────────────────────────── */
const PIN_BG = {
  '#F59E0B':'#B45309','#10B981':'#047857','#8B5CF6':'#6D28D9',
  '#3B82F6':'#1D4ED8','#14B8A6':'#0F766E','#EF4444':'#B91C1C',
}
const DARK_TEXT = new Set(['#F59E0B','#10B981'])
function PostIt({ text, color, pos, rotate = '0deg', vis }) {
  const { opacity, progress } = vis
  const entryT = clamp(progress, 0, 1)
  const exitAmt = clamp(1 - progress, 0, 1)
  const scale = progress < 1
    ? Math.max(0.01, easeOutBack(entryT)) * 0.92 + 0.08
    : 1 - easeInCubic(exitAmt) * 0.14
  const lift = exitAmt > 0.01 ? exitAmt * -14 : 0
  return (
    <div style={{
      position:'fixed', ...pos,
      background: color + 'F0',
      color: DARK_TEXT.has(color) ? '#0D1117' : '#FFFFFF',
      padding:'18px 18px 14px', borderRadius:3,
      transform:`rotate(${rotate}) scale(${scale}) translateY(${lift}px)`,
      transformOrigin:'top center',
      boxShadow:'0 6px 28px rgba(0,0,0,0.52),0 2px 6px rgba(0,0,0,0.28)',
      fontSize:13, fontWeight:700, fontFamily:'Manrope,sans-serif',
      lineHeight:1.6, maxWidth:152, zIndex:9995,
      whiteSpace:'pre-line', pointerEvents:'none', opacity,
    }}>
      <div style={{ position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)',
        width:17, height:17, borderRadius:'50%',
        background:`radial-gradient(circle at 36% 34%,${PIN_BG[color]??'#B91C1C'}AA,${PIN_BG[color]??'#B91C1C'})`,
        boxShadow:'0 2px 8px rgba(0,0,0,0.55)' }} />
      <div style={{ position:'absolute', bottom:0, right:0, width:0, height:0,
        borderStyle:'solid', borderWidth:'0 0 13px 13px',
        borderColor:'transparent transparent rgba(0,0,0,0.2) transparent' }} />
      {text}
    </div>
  )
}

/* ── Callout (speech bubble) ────────────────────────────────── */
function Callout({ text, color, pos, from = 'right', vis }) {
  const { opacity, progress } = vis
  const entryT  = clamp(progress, 0, 1)
  const exitAmt = clamp(1 - progress, 0, 1)
  const dxEntry = from === 'right' ? (1 - easeOutCubic(entryT)) * 40
                : from === 'left'  ? (1 - easeOutCubic(entryT)) * -40 : 0
  const dyEntry = from === 'bottom' ? (1 - easeOutCubic(entryT)) * 30 : 0
  const dxExit  = from === 'right' ? easeInCubic(exitAmt) * 20
                : from === 'left'  ? easeInCubic(exitAmt) * -20 : 0
  const dyExit  = easeInCubic(exitAmt) * 8
  const tx = progress < 1 ? dxEntry : dxExit
  const ty = progress < 1 ? dyEntry : dyExit
  return (
    <div style={{
      position:'fixed', ...pos,
      background:'rgba(6,10,22,0.96)',
      backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)',
      border:`1px solid ${color}55`, borderRadius:14,
      padding:'14px 18px', maxWidth:230, zIndex:9994,
      pointerEvents:'none', opacity,
      transform:`translateX(${tx}px) translateY(${ty}px)`,
      boxShadow:`0 8px 32px rgba(0,0,0,0.5),0 0 24px ${color}18`,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
        <div style={{ width:6, height:6, borderRadius:'50%',
          background:color, boxShadow:`0 0 7px ${color}` }} />
        <span style={{ fontSize:9, fontWeight:800, color, textTransform:'uppercase',
          letterSpacing:'0.15em', fontFamily:'Manrope,sans-serif' }}>Plasticity Scan®</span>
      </div>
      <p style={{ color:'#F1F5F9', fontSize:13, fontWeight:600, lineHeight:1.6,
        whiteSpace:'pre-line', fontFamily:'Manrope,sans-serif' }}>{text}</p>
      <div style={{ position:'absolute', inset:0, borderRadius:14,
        boxShadow:`inset 0 0 0 1px ${color}1A`, pointerEvents:'none' }} />
    </div>
  )
}

/* ── MiniCard (affiche animée style stat-card) ───────────────
   A small billboard with a colored header, big value, and label.
   Slides in from specified side, scales slightly on entry.        */
function MiniCard({ icon, value, label, color, pos, from = 'left', vis }) {
  const { opacity, progress } = vis
  const entryT  = clamp(progress, 0, 1)
  const exitAmt = clamp(1 - progress, 0, 1)
  const scale   = 0.88 + easeOutCubic(entryT) * 0.12
  const exitScale = 1 - easeInCubic(exitAmt) * 0.1
  const finalScale = progress < 1 ? scale : exitScale
  const dxEntry = from === 'left'  ? (1 - easeOutCubic(entryT)) * -50
                : from === 'right' ? (1 - easeOutCubic(entryT)) * 50 : 0
  const dxExit  = from === 'left'  ? easeInCubic(exitAmt) * -22
                : from === 'right' ? easeInCubic(exitAmt) * 22 : 0
  const tx = progress < 1 ? dxEntry : dxExit
  return (
    <div style={{
      position:'fixed', ...pos,
      width:136, borderRadius:14, overflow:'hidden',
      zIndex:9993, pointerEvents:'none', opacity,
      transform:`translateX(${tx}px) scale(${finalScale})`,
      transformOrigin: from === 'left' ? 'left center' : 'right center',
      boxShadow:`0 8px 32px rgba(0,0,0,0.55),0 0 20px ${color}22`,
    }}>
      {/* Colored header */}
      <div style={{
        background:`linear-gradient(135deg,${color},${color}BB)`,
        padding:'8px 14px',
        display:'flex', alignItems:'center', gap:8,
      }}>
        <span style={{ fontSize:15, lineHeight:1 }}>{icon}</span>
        <span style={{ color:'rgba(255,255,255,0.92)', fontSize:9, fontWeight:800,
          textTransform:'uppercase', letterSpacing:'0.12em',
          fontFamily:'Manrope,sans-serif', lineHeight:1.3 }}>{label}</span>
      </div>
      {/* Value */}
      <div style={{
        background:'rgba(6,10,22,0.97)',
        borderLeft:`2px solid ${color}60`,
        borderRight:`1px solid rgba(255,255,255,0.04)`,
        borderBottom:`1px solid rgba(255,255,255,0.04)`,
        padding:'12px 14px',
      }}>
        <p style={{ fontFamily:'Syne,sans-serif', fontSize:34, fontWeight:800,
          color:'#F8FAFC', lineHeight:1, margin:0,
          textShadow:`0 0 20px ${color}80` }}>{value}</p>
      </div>
    </div>
  )
}

/* ── FloatingTag (pill notification, bounces up from position) ─ */
function FloatingTag({ text, color, pos, vis }) {
  const { opacity, progress } = vis
  const entryT  = clamp(progress, 0, 1)
  const exitAmt = clamp(1 - progress, 0, 1)
  const dyEntry = (1 - easeOutBack(entryT)) * 18
  const dyExit  = easeInCubic(exitAmt) * 10
  const ty = progress < 1 ? dyEntry : dyExit
  const scale = progress < 1
    ? 0.7 + easeOutBack(entryT) * 0.3
    : 1 - easeInCubic(exitAmt) * 0.08
  return (
    <div style={{
      position:'fixed', ...pos,
      background:`linear-gradient(135deg,${color}22,${color}0E)`,
      border:`1px solid ${color}55`,
      borderRadius:100, padding:'9px 20px',
      color, fontSize:12, fontWeight:700,
      fontFamily:'Manrope,sans-serif', letterSpacing:'0.04em',
      zIndex:9993, pointerEvents:'none', opacity,
      transform:`translateY(${ty}px) scale(${scale})`,
      boxShadow:`0 4px 20px rgba(0,0,0,0.35),0 0 14px ${color}1A`,
      whiteSpace:'nowrap',
    }}>{text}</div>
  )
}

/* ── Outro (full-screen branding slide) ─────────────────────── */
const WORDS = [
  { text:'plasticité',   color:'#3B82F6', x:'8%',  y:'18%', size:52, opacity:0.055 },
  { text:'organisation', color:'#14B8A6', x:'52%', y:'12%', size:40, opacity:0.045 },
  { text:'systémique',   color:'#8B5CF6', x:'6%',  y:'78%', size:44, opacity:0.05  },
  { text:'diversité',    color:'#F59E0B', x:'56%', y:'82%', size:38, opacity:0.05  },
]
function Outro({ vis }) {
  const { opacity, progress } = vis
  const enterEase = easeOutCubic(clamp(progress, 0, 1))
  const contentY  = (1 - enterEase) * 30
  const pills = [
    { label:'plasticité',    color:'#3B82F6' },
    { label:'systémique',    color:'#14B8A6' },
    { label:'organisation',  color:'#8B5CF6' },
    { label:'diversité',     color:'#F59E0B' },
  ]
  return (
    <div style={{
      position:'fixed', inset:0,
      background:`rgba(4,8,18,${enterEase * 0.98})`,
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      zIndex:10000, pointerEvents:'none',
    }}>
      {/* Radial glow */}
      <div style={{ position:'absolute', inset:0, opacity:enterEase, pointerEvents:'none',
        background:'radial-gradient(ellipse at 50% 50%,rgba(59,130,246,0.14) 0%,rgba(20,184,166,0.07) 35%,transparent 65%)' }} />
      {/* Dot grid */}
      <div style={{ position:'absolute', inset:0, opacity:enterEase * 0.6, pointerEvents:'none',
        backgroundImage:'radial-gradient(circle,rgba(148,163,184,0.08) 1px,transparent 1px)',
        backgroundSize:'28px 28px' }} />

      {/* Background typographic words */}
      {WORDS.map((w, i) => (
        <div key={w.text} style={{
          position:'absolute', left:w.x, top:w.y,
          fontFamily:'Syne,sans-serif', fontSize:w.size, fontWeight:800,
          color:w.color, opacity: enterEase * w.opacity,
          letterSpacing:'-0.02em', userSelect:'none', pointerEvents:'none',
          transform:`translateY(${(1 - enterEase) * (20 + i * 5)}px)`,
          transition:'none',
        }}>{w.text}</div>
      ))}

      {/* Main content */}
      <div style={{
        position:'relative', textAlign:'center', padding:'0 48px',
        opacity: enterEase, transform:`translateY(${contentY}px)`,
      }}>
        {/* Icon */}
        <div style={{
          width:88, height:88, borderRadius:22, margin:'0 auto 36px',
          background:'linear-gradient(135deg,#3B82F6,#14B8A6)',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 0 80px rgba(59,130,246,0.5),0 0 40px rgba(20,184,166,0.3)',
          fontSize:40, color:'white', fontFamily:'Syne,sans-serif', fontWeight:800,
        }}>✦</div>

        {/* Brand name */}
        <div style={{ marginBottom:28 }}>
          <h1 style={{
            fontFamily:'Syne,sans-serif', fontSize:52, fontWeight:800, lineHeight:1,
            background:'linear-gradient(90deg,#3B82F6 0%,#14B8A6 45%,#60A5FA 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            backgroundClip:'text', marginBottom:10,
          }}>Plasticity Scan®</h1>
          {/* Sensup logo */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
            <span style={{ fontFamily:'Manrope,sans-serif', fontSize:12, color:'#475569',
              textTransform:'uppercase', letterSpacing:'0.3em', fontWeight:700 }}>by</span>
            <img src="/sensup-logo.png" alt="Sensup"
              style={{ height:38, width:'auto', objectFit:'contain', opacity:0.82 }} />
          </div>
        </div>

        {/* Tagline */}
        <p style={{ fontFamily:'Manrope,sans-serif', fontSize:18, color:'#94A3B8',
          lineHeight:1.65, maxWidth:480, margin:'0 auto 36px', fontWeight:500 }}>
          Révélez et activez la plasticité organisationnelle de vos clients.
        </p>

        {/* Key concept pills (the 4 words) */}
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:40 }}>
          {pills.map(({ label, color }) => (
            <div key={label} style={{
              padding:'8px 20px', borderRadius:100,
              background: color + '18', border:`1px solid ${color}40`,
              color, fontSize:12, fontWeight:700,
              fontFamily:'Manrope,sans-serif', letterSpacing:'0.05em',
            }}>{label}</div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width:130, height:1, margin:'0 auto 28px',
          background:'linear-gradient(to right,transparent,rgba(59,130,246,0.4),transparent)' }} />

        {/* Footer — subtle hackathon mention */}
        <p style={{ fontFamily:'Manrope,sans-serif', fontSize:11, color:'#334155',
          textTransform:'uppercase', letterSpacing:'0.2em', fontWeight:600,
          marginBottom:10 }}>
          Sensup · Diagnostic Systémique · 2026
        </p>
        <p style={{ fontFamily:'Manrope,sans-serif', fontSize:10, color:'#1E293B',
          letterSpacing:'0.15em', fontWeight:600 }}>
          ◆ Hackathon Femmes dans la Tech
        </p>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN OVERLAY — 60fps RAF timer
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

  const FADE_OUT = 0.36
  const activeItems = TIMELINE.filter(
    item => elapsed >= item.start && elapsed < item.end + FADE_OUT
  )

  const renderItem = (item) => {
    const vis = getVis(elapsed, item.start, item.end)
    if (!vis) return null
    switch (item.type) {
      case 'banner':   return <Banner      key={item.id} {...item} vis={vis} />
      case 'postit':   return <PostIt      key={item.id} {...item} vis={vis} />
      case 'callout':  return <Callout     key={item.id} {...item} vis={vis} />
      case 'minicard': return <MiniCard    key={item.id} {...item} vis={vis} />
      case 'tag':      return <FloatingTag key={item.id} {...item} vis={vis} />
      case 'outro':    return <Outro       key={item.id} vis={vis} />
      default:         return null
    }
  }

  return createPortal(
    <>{activeItems.map(renderItem)}</>,
    document.body
  )
}
