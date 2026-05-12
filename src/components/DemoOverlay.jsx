import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/* ══════════════════════════════════════════════════════════════
   EASING / VISIBILITY HELPERS
   ══════════════════════════════════════════════════════════════ */
const easeOutCubic = t => 1 - Math.pow(1 - t, 3)
const easeOutBack  = t => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2) }
const easeInCubic  = t => t * t * t
const clamp        = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

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
   DOM ANCHOR HELPER
   anchorRect('name') → { left, top, width, height } in viewport coords
   Falls back to null if element not mounted yet.
   ══════════════════════════════════════════════════════════════ */
function getAnchorRect(name, pad = 16) {
  const el = document.querySelector(`[data-demo="${name}"]`)
  if (!el) return null
  const r = el.getBoundingClientRect()
  return {
    left:   r.left   - pad,
    top:    r.top    - pad,
    width:  r.width  + pad * 2,
    height: r.height + pad * 2,
    cx:     r.left + r.width  / 2,
    cy:     r.top  + r.height / 2,
    right:  r.right,
    bottom: r.bottom,
  }
}

/* ══════════════════════════════════════════════════════════════
   TIMELINE — DOM-anchored highlights + margin callouts
   Transitions: 0s landing · 6s survey · 12s computing
                ~14.8s results · 34s dashboard · 44s outro
   ══════════════════════════════════════════════════════════════ */
const TIMELINE = [

  /* ─── LANDING (0–6s) ─────────────────────────────────────── */
  { id:'l-banner', type:'banner', start:0.3, end:3.4,
    title:'Diagnostic de Plasticité Organisationnelle',
    subtitle:'Mesurez la capacité d\'adaptation de votre organisation',
    color:'#3B82F6' },

  // Anneau autour de la carte formulaire (suit le vrai DOM)
  { id:'l-ring-form', type:'box', start:3.7, end:5.7,
    anchor:'landing-form', color:'#3B82F6', pad:18 },

  // Flèche pointant DEPUIS le hero VERS le formulaire
  { id:'l-arrow', type:'arrow-to', start:4.0, end:5.7,
    anchor:'landing-form', from:'left', color:'#14B8A6', offset:80 },

  // Postit dans la marge gauche
  { id:'l-postit', type:'postit', start:4.0, end:5.7,
    text:'Diagnostic\nsystémique\nen 5 minutes',
    color:'#F59E0B', pos:{ top:'22%', left:'2%' }, rotate:'-3deg' },

  /* ─── SURVEY (6–12s) ─────────────────────────────────────── */
  { id:'s-banner', type:'banner', start:6.4, end:9.0,
    title:'Évaluation Multi-Niveaux',
    subtitle:'7 dimensions · 14 questions · 3 niveaux organisationnels',
    color:'#14B8A6' },

  // Anneau autour des deux cartes question
  { id:'s-ring-q', type:'box', start:9.3, end:11.6,
    anchor:'survey-questions', color:'#3B82F6', pad:12 },

  // Flèche depuis la gauche vers les questions
  { id:'s-arrow', type:'arrow-to', start:9.5, end:11.6,
    anchor:'survey-questions', from:'left', color:'#3B82F6', offset:60 },

  // Tag dans la marge haut-droite
  { id:'s-tag', type:'tag', start:10.0, end:11.7,
    text:'🔬 Lecture systémique',
    color:'#14B8A6', pos:{ top:'13%', right:'4%' } },

  /* ─── COMPUTING (12–~14.8s) ──────────────────────────────── */
  // Pas d'anneau ici — le visuel de scan est déjà central et envoutant.
  { id:'c-callout', type:'callout', start:12.5, end:14.5,
    text:'Algorithme systémique\n7 dimensions calculées\nLeviers identifiés',
    color:'#14B8A6', pos:{ bottom:'18%', left:'50%', transform:'translateX(-50%)' }, from:'bottom' },

  { id:'c-postit', type:'postit', start:12.9, end:14.5,
    text:'Analyse\ntemps\nréel',
    color:'#3B82F6', pos:{ top:'14%', right:'5%' }, rotate:'4deg' },

  /* ─── RESULTS (~14.8–34s) ─────────────────────────────────
     App.jsx scrolle automatiquement à 26s puis 30s.            */
  { id:'r-banner', type:'banner', start:15.1, end:18.0,
    title:'Profil de Plasticité Révélé',
    subtitle:'Score global · Radar systémique · 7 dimensions',
    color:'#3B82F6' },

  // PHASE 1 (18–22s) — Score à gauche
  { id:'r-ring-score', type:'box', start:18.3, end:22.0,
    anchor:'results-score', color:'#F59E0B', pad:10 },

  { id:'r-arrow-score', type:'arrow-to', start:18.6, end:21.8,
    anchor:'results-score', from:'left', color:'#F59E0B', offset:50 },

  { id:'r-callout-score', type:'callout', start:19.0, end:22.0,
    text:'Score global\npersonnalisé\nsur 9 points',
    color:'#F59E0B', pos:{ top:'30%', left:'2%' }, from:'left' },

  // PHASE 2 (22–26s) — Radar à droite
  { id:'r-ring-radar', type:'box', start:22.2, end:25.8,
    anchor:'results-radar', color:'#3B82F6', pad:8 },

  { id:'r-callout-radar', type:'callout', start:22.6, end:25.8,
    text:'Radar systémique\n7 dimensions\nen un coup d\'œil',
    color:'#3B82F6', pos:{ top:'30%', right:'2%' }, from:'right' },

  // PHASE 3 (26–30s) — après scroll → dimensions
  { id:'r-ring-dim', type:'box', start:26.8, end:29.8,
    anchor:'results-dimensions', color:'#8B5CF6', pad:10 },

  { id:'r-callout-dim', type:'callout', start:27.2, end:29.8,
    text:'Profil par dimension\navec niveau de plasticité',
    color:'#8B5CF6', pos:{ top:'18%', right:'2%' }, from:'right' },

  // PHASE 4 (30–34s) — après second scroll → leviers/tensions
  { id:'r-ring-tension', type:'box', start:30.2, end:33.5,
    anchor:'results-tension', color:'#EF4444', pad:8 },

  { id:'r-callout-levers', type:'callout', start:30.6, end:33.5,
    text:'Leviers d\'action\nprioritaires\nidentifiés par l\'IA',
    color:'#14B8A6', pos:{ top:'18%', left:'2%' }, from:'left' },

  { id:'r-tag-pdf', type:'tag', start:31.5, end:33.7,
    text:'📄 Rapport PDF · Débrief IA Mistral',
    color:'#F59E0B', pos:{ bottom:'8%', left:'50%', transform:'translateX(-50%)' } },

  /* ─── DASHBOARD (34–44s) ─────────────────────────────────── */
  { id:'d-banner', type:'banner', start:34.3, end:37.2,
    title:'Tableau de Bord Intervenants',
    subtitle:'Vue agrégée multi-entreprises · Export PDF · Analyse IA',
    color:'#8B5CF6' },

  // Anneau autour de la rangée KPI
  { id:'d-ring-kpi', type:'box', start:37.5, end:40.5,
    anchor:'dashboard-kpis', color:'#3B82F6', pad:10 },

  { id:'d-callout-kpi', type:'callout', start:37.9, end:40.5,
    text:'KPIs agrégés\nen temps réel\nmulti-clients',
    color:'#3B82F6', pos:{ top:'42%', left:'2%' }, from:'left' },

  // PHASE 2 (40.5–44s) — après scroll → radar
  { id:'d-ring-radar', type:'box', start:40.8, end:43.5,
    anchor:'dashboard-radar', color:'#14B8A6', pad:10 },

  { id:'d-callout-radar', type:'callout', start:41.2, end:43.5,
    text:'Profil moyen\nvisualisé\npar entreprise',
    color:'#14B8A6', pos:{ top:'25%', right:'2%' }, from:'right' },

  { id:'d-tag', type:'tag', start:41.8, end:43.7,
    text:'🏢 Multi-entreprises · Export PDF',
    color:'#F59E0B', pos:{ bottom:'8%', left:'50%', transform:'translateX(-50%)' } },

  /* ─── OUTRO (44s+) ───────────────────────────────────────── */
  { id:'outro', type:'outro', start:44.0, end:999 },
]

/* ══════════════════════════════════════════════════════════════
   COMPONENTS
   ══════════════════════════════════════════════════════════════ */

/* ── Banner — bandeau supérieur cinématique ────────────────── */
function Banner({ title, subtitle, color, vis }) {
  const { opacity, progress } = vis
  const ty = progress < 1
    ? (1 - easeOutCubic(clamp(progress, 0, 1))) * -100
    : easeInCubic(clamp(1 - progress, 0, 1)) * -55
  return (
    <div style={{
      position:'fixed', top:0, left:0, right:0,
      zIndex:9992, pointerEvents:'none',
      background:'rgba(4,8,20,0.97)',
      backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)',
      borderBottom:`1px solid ${color}45`,
      padding:'13px 48px 17px',
      boxShadow:`0 4px 40px rgba(0,0,0,0.6)`,
      opacity, transform:`translateY(${ty}px)`,
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

/* ── BoxRing — anneau qui suit un élément DOM ───────────────── */
function BoxRing({ rect, color, vis, elapsed, circle }) {
  if (!rect) return null
  const { opacity, progress } = vis
  const pulse = 1 + Math.sin(elapsed * 3.2) * 0.025
  const entryS = easeOutCubic(clamp(progress, 0, 1))
  const exitS  = 1 - easeInCubic(clamp(1 - progress, 0, 1)) * 0.06
  const finalS = progress < 1 ? entryS : exitS

  // Border radius : circle if explicit, else proportional rounded rect
  const radius = circle
    ? '50%'
    : `${Math.min(rect.width, rect.height) * 0.18}px`

  return (
    <div style={{
      position:'fixed',
      left: rect.left, top: rect.top,
      width: rect.width, height: rect.height,
      borderRadius: radius,
      border:`2.5px solid ${color}`,
      boxShadow:`0 0 28px ${color}80, 0 0 70px ${color}30, inset 0 0 24px ${color}10`,
      transform:`scale(${finalS * pulse})`,
      transformOrigin:'center',
      opacity: opacity * 0.95,
      zIndex:9991, pointerEvents:'none',
    }}>
      {/* outer echo */}
      <div style={{
        position:'absolute',
        inset:`${-(6 + Math.sin(elapsed * 2.1) * 3)}px`,
        borderRadius: radius,
        border:`1px solid ${color}35`,
        pointerEvents:'none',
      }} />
    </div>
  )
}

/* ── ArrowTo — flèche qui pointe vers l'ancre DOM ───────────── */
function ArrowTo({ rect, from = 'left', color, offset = 60, vis, elapsed }) {
  if (!rect) return null
  const { opacity, progress } = vis
  const bounce = Math.sin(elapsed * 4.8) * 8
  const entryT  = clamp(progress, 0, 1)
  const exitAmt = clamp(1 - progress, 0, 1)
  const shaftLen = 70 * easeOutCubic(entryT)

  // Compute arrow tip target (pointed at the anchor edge)
  let tipX, tipY, rotDeg, dx, dy
  if (from === 'left')  { tipX = rect.left - 8;          tipY = rect.cy; rotDeg = 0;   dx = bounce;  dy = 0; }
  else if (from === 'right') { tipX = rect.right + 8;    tipY = rect.cy; rotDeg = 180; dx = -bounce; dy = 0; }
  else if (from === 'top') { tipX = rect.cx;             tipY = rect.top - 8;         rotDeg = 90;  dx = 0; dy = bounce; }
  else                  { tipX = rect.cx;                tipY = rect.bottom + 8;      rotDeg = -90; dx = 0; dy = -bounce; }

  return (
    <div style={{
      position:'fixed',
      left: tipX, top: tipY,
      opacity: opacity * (1 - easeInCubic(exitAmt) * 0.15),
      zIndex:9993, pointerEvents:'none',
      transform:`translateX(${dx}px) translateY(${dy}px)`,
    }}>
      <div style={{
        display:'flex', alignItems:'center',
        transform:`rotate(${rotDeg + 180}deg) translateX(-${offset}px)`,
        transformOrigin:'right center',
        filter:`drop-shadow(0 0 12px ${color}A0)`,
      }}>
        {/* Shaft */}
        <div style={{
          width:shaftLen, height:5, borderRadius:3,
          background:`linear-gradient(to right,${color}20,${color})`,
        }} />
        {/* Head */}
        <div style={{
          width:0, height:0,
          borderTop:'13px solid transparent',
          borderBottom:'13px solid transparent',
          borderLeft:`20px solid ${color}`,
          flexShrink:0,
        }} />
      </div>
    </div>
  )
}

/* ── PostIt ──────────────────────────────────────────────────── */
const PIN_BG = { '#F59E0B':'#B45309','#10B981':'#047857','#8B5CF6':'#6D28D9',
  '#3B82F6':'#1D4ED8','#14B8A6':'#0F766E','#EF4444':'#B91C1C' }
const DARK_TEXT = new Set(['#F59E0B','#10B981'])
function PostIt({ text, color, pos, rotate = '0deg', vis }) {
  const { opacity, progress } = vis
  const entryT  = clamp(progress, 0, 1)
  const exitAmt = clamp(1 - progress, 0, 1)
  const scale = progress < 1
    ? Math.max(0.01, easeOutBack(entryT)) * 0.9 + 0.1
    : 1 - easeInCubic(exitAmt) * 0.14
  const lift = exitAmt > 0.01 ? exitAmt * -16 : 0
  return (
    <div style={{
      position:'fixed', ...pos,
      background:color+'F0', color:DARK_TEXT.has(color)?'#0D1117':'#FFFFFF',
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

/* ── Callout ─────────────────────────────────────────────────── */
function Callout({ text, color, pos, from = 'right', vis }) {
  const { opacity, progress } = vis
  const entryT  = clamp(progress, 0, 1)
  const exitAmt = clamp(1 - progress, 0, 1)
  const dxE = from==='right'?(1-easeOutCubic(entryT))*40:from==='left'?(1-easeOutCubic(entryT))*-40:0
  const dyE = from==='bottom'?(1-easeOutCubic(entryT))*30:0
  const dxX = from==='right'?easeInCubic(exitAmt)*20:from==='left'?easeInCubic(exitAmt)*-20:0
  const dyX = easeInCubic(exitAmt)*8
  const tx = progress<1?dxE:dxX
  const ty = progress<1?dyE:dyX
  return (
    <div style={{
      position:'fixed', ...pos,
      background:'rgba(6,10,22,0.96)', backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)',
      border:`1px solid ${color}55`, borderRadius:14,
      padding:'14px 18px', maxWidth:230, zIndex:9994,
      pointerEvents:'none', opacity, transform:`translateX(${tx}px) translateY(${ty}px)`,
      boxShadow:`0 8px 32px rgba(0,0,0,0.5),0 0 24px ${color}18`,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
        <div style={{ width:6, height:6, borderRadius:'50%', background:color, boxShadow:`0 0 7px ${color}` }} />
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

/* ── FloatingTag ─────────────────────────────────────────────── */
function FloatingTag({ text, color, pos, vis }) {
  const { opacity, progress } = vis
  const entryT  = clamp(progress, 0, 1)
  const exitAmt = clamp(1 - progress, 0, 1)
  const ty = progress<1?(1-easeOutBack(entryT))*18:easeInCubic(exitAmt)*10
  const scale = progress<1?0.7+easeOutBack(entryT)*0.3:1-easeInCubic(exitAmt)*0.08
  return (
    <div style={{
      position:'fixed', ...pos,
      background:`linear-gradient(135deg,${color}22,${color}0E)`,
      border:`1px solid ${color}55`, borderRadius:100,
      padding:'9px 20px', color, fontSize:12, fontWeight:700,
      fontFamily:'Manrope,sans-serif', letterSpacing:'0.04em',
      zIndex:9993, pointerEvents:'none', opacity,
      transform:`translateY(${ty}px) scale(${scale})`,
      boxShadow:`0 4px 20px rgba(0,0,0,0.35),0 0 14px ${color}1A`,
      whiteSpace:'nowrap',
    }}>{text}</div>
  )
}

/* ══════════════════════════════════════════════════════════════
   OUTRO — Cinematic envoûtant
   ══════════════════════════════════════════════════════════════ */
function Outro({ vis, elapsed }) {
  const { opacity, progress } = vis
  const e = easeOutCubic(clamp(progress, 0, 1))
  const t = elapsed - 44.0  // seconds since outro started

  // Slow continuous animations
  const breathe = 1 + Math.sin(t * 0.6) * 0.025
  const glowPulse = 0.7 + Math.sin(t * 0.9) * 0.3

  const pills = [
    { label:'plasticité',   color:'#3B82F6' },
    { label:'systémique',   color:'#14B8A6' },
    { label:'organisation', color:'#8B5CF6' },
    { label:'diversité',    color:'#F59E0B' },
  ]

  // Background floating words — drift slowly
  const bgWords = [
    { text:'plasticité',   color:'#3B82F6', x:'4%',  y:'12%', size:72, op:0.04, drift: t * 0.4 },
    { text:'systémique',   color:'#8B5CF6', x:'3%',  y:'74%', size:64, op:0.04, drift: t * -0.5 },
    { text:'organisation', color:'#14B8A6', x:'52%', y:'9%',  size:58, op:0.035, drift: t * 0.6 },
    { text:'diversité',    color:'#F59E0B', x:'58%', y:'78%', size:60, op:0.04, drift: t * -0.4 },
  ]

  return (
    <div style={{
      position:'fixed', inset:0,
      background:`
        radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.18) 0%, transparent 55%),
        radial-gradient(ellipse at 15% 85%, rgba(139,92,246,0.12) 0%, transparent 50%),
        radial-gradient(ellipse at 85% 15%, rgba(20,184,166,0.10) 0%, transparent 50%),
        linear-gradient(180deg, #02050E 0%, #050B1C 50%, #02050E 100%)
      `,
      opacity: e,
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      zIndex:10000, pointerEvents:'none', overflow:'hidden',
    }}>

      {/* Aurora light beams */}
      <div style={{ position:'absolute', inset:0, opacity: e * glowPulse, pointerEvents:'none',
        background:`
          conic-gradient(from ${t * 8}deg at 50% 50%,
            rgba(59,130,246,0.05) 0deg,
            rgba(20,184,166,0.08) 90deg,
            rgba(139,92,246,0.05) 180deg,
            rgba(245,158,11,0.04) 270deg,
            rgba(59,130,246,0.05) 360deg)`,
        filter:'blur(80px)',
      }} />

      {/* Dot grid overlay */}
      <div style={{ position:'absolute', inset:0, opacity: e * 0.4, pointerEvents:'none',
        backgroundImage:'radial-gradient(circle,rgba(148,163,184,0.07) 1px,transparent 1px)',
        backgroundSize:'32px 32px',
        transform:`translateY(${Math.sin(t * 0.3) * 8}px)`,
      }} />

      {/* Background floating words */}
      {bgWords.map((w, i) => (
        <div key={w.text} style={{
          position:'absolute', left:w.x, top:w.y,
          fontFamily:'Syne,sans-serif', fontSize:w.size, fontWeight:900,
          color:w.color, opacity: e * w.op, userSelect:'none', pointerEvents:'none',
          letterSpacing:'-0.02em',
          transform:`translateY(${(1-e)*(20+i*5) + Math.sin(t * 0.3 + i) * 6}px) translateX(${w.drift}px)`,
        }}>{w.text}</div>
      ))}

      {/* Particles (subtle floating dots) */}
      {Array.from({ length: 18 }).map((_, i) => {
        const seed = i * 47.3
        const px = (seed * 13.7) % 100
        const py = (seed * 7.3) % 100
        const drift = Math.sin(t * 0.4 + i) * 30
        const driftY = Math.cos(t * 0.5 + i * 1.3) * 20
        const size = 2 + (i % 4)
        const colorIdx = i % 4
        const col = ['#3B82F6','#14B8A6','#8B5CF6','#F59E0B'][colorIdx]
        return (
          <div key={i} style={{
            position:'absolute',
            left:`${px}%`, top:`${py}%`,
            width:size, height:size, borderRadius:'50%',
            background:col, opacity: e * 0.6,
            boxShadow:`0 0 ${size*4}px ${col}`,
            transform:`translate(${drift}px, ${driftY}px)`,
            pointerEvents:'none',
          }} />
        )
      })}

      {/* Main content */}
      <div style={{ position:'relative', textAlign:'center', padding:'0 48px', maxWidth:880,
        opacity: e, transform:`translateY(${(1-e)*32}px) scale(${breathe})` }}>

        {/* Big halo behind logo */}
        <div style={{
          position:'absolute', left:'50%', top:80,
          transform:'translate(-50%, -50%)',
          width:520, height:520, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(59,130,246,0.22) 0%, rgba(20,184,166,0.10) 35%, transparent 70%)',
          filter:'blur(20px)',
          opacity: e * glowPulse,
          pointerEvents:'none',
        }} />

        {/* Logo Plasticity Scan — image */}
        <div style={{ position:'relative', marginBottom:36 }}>
          <img src="/plasticity-scan-logo.png" alt="Plasticity Scan"
            style={{
              height:120, width:'auto', objectFit:'contain',
              filter:`drop-shadow(0 0 40px rgba(59,130,246,${0.4 * glowPulse})) drop-shadow(0 0 80px rgba(20,184,166,${0.25 * glowPulse}))`,
              transform:`scale(${0.92 + Math.sin(t * 0.5) * 0.015})`,
            }} />
        </div>

        {/* Divider line */}
        <div style={{
          width:120, height:1, margin:'0 auto 24px',
          background:`linear-gradient(to right, transparent, rgba(59,130,246,${0.6 * e}), transparent)`,
        }} />

        {/* By Sensup */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:18, marginBottom:36 }}>
          <span style={{ fontFamily:'Manrope,sans-serif', fontSize:13, color:'#64748B',
            textTransform:'uppercase', letterSpacing:'0.4em', fontWeight:700 }}>by</span>
          <img src="/sens-up-logo.png" alt="Sensup"
            style={{ height:64, width:'auto', objectFit:'contain', opacity:0.95,
              filter:'drop-shadow(0 0 16px rgba(59,130,246,0.25))' }} />
        </div>

        {/* Tagline */}
        <p style={{
          fontFamily:'Syne,sans-serif', fontSize:24, color:'#E2E8F0',
          lineHeight:1.4, maxWidth:560, margin:'0 auto 18px', fontWeight:600,
          letterSpacing:'-0.01em',
        }}>
          Révélez la <span style={{
            background:'linear-gradient(90deg,#3B82F6,#14B8A6)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            backgroundClip:'text', fontWeight:800,
          }}>plasticité</span> de vos organisations.
        </p>
        <p style={{
          fontFamily:'Manrope,sans-serif', fontSize:15, color:'#94A3B8',
          lineHeight:1.6, maxWidth:480, margin:'0 auto 40px', fontWeight:400,
        }}>
          Un diagnostic systémique pour les intervenants en transformation organisationnelle.
        </p>

        {/* Concept pills with stagger */}
        <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', marginBottom:48 }}>
          {pills.map(({ label, color }, i) => {
            const pillDelay = clamp(t - 0.4 - i * 0.15, 0, 1)
            const pillScale = easeOutBack(pillDelay)
            return (
              <div key={label} style={{
                padding:'10px 24px', borderRadius:100,
                background:`linear-gradient(135deg, ${color}22, ${color}0A)`,
                border:`1px solid ${color}60`,
                color, fontSize:13, fontWeight:700,
                fontFamily:'Manrope,sans-serif', letterSpacing:'0.06em',
                boxShadow:`0 4px 20px ${color}15, inset 0 1px 0 ${color}30`,
                opacity: e * pillDelay,
                transform:`scale(${pillScale}) translateY(${(1-pillDelay)*10}px)`,
              }}>{label}</div>
            )
          })}
        </div>

        {/* Final divider */}
        <div style={{
          width:160, height:1, margin:'0 auto 22px',
          background:`linear-gradient(to right, transparent, rgba(20,184,166,${0.5 * e}), transparent)`,
        }} />

        {/* Footer */}
        <p style={{
          fontFamily:'Manrope,sans-serif', fontSize:11, color:'#475569',
          textTransform:'uppercase', letterSpacing:'0.3em', fontWeight:700, marginBottom:10,
        }}>
          Diagnostic Systémique · 2026
        </p>
        <p style={{
          fontFamily:'Manrope,sans-serif', fontSize:11, color:'#3B82F6',
          letterSpacing:'0.25em', fontWeight:700, opacity:0.8,
        }}>
          ◆ HeR Labs 2026
        </p>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN OVERLAY
   ══════════════════════════════════════════════════════════════ */
export default function DemoOverlay() {
  const [elapsed, setElapsed] = useState(0)
  const [zoomTarget, setZoomTarget] = useState(null)  // { cx, cy } for zoom focus
  const startRef = useRef(null)
  const lastAnchorRef = useRef(null)

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

  /* ── Auto-scroll to center the dominant anchored element ──
     Whenever the earliest active anchored item changes, smoothly
     scroll the page so that element is centered. Also triggers a
     subtle zoom-pulse effect on the body for cinematic emphasis. */
  const dominantAnchorItem = activeItems
    .filter(i => (i.type === 'box' || i.type === 'arrow-to') && i.anchor)
    .sort((a, b) => a.start - b.start)[0]
  const dominantAnchor = dominantAnchorItem?.anchor ?? null

  useEffect(() => {
    if (!dominantAnchor) {
      lastAnchorRef.current = null
      return
    }
    if (dominantAnchor === lastAnchorRef.current) return
    lastAnchorRef.current = dominantAnchor

    // Defer briefly so the new content has rendered
    const id = setTimeout(() => {
      const el = document.querySelector(`[data-demo="${dominantAnchor}"]`)
      if (!el) return
      el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' })

      // Trigger a brief zoom-pulse focus on this element
      const r = el.getBoundingClientRect()
      setZoomTarget({ cx: r.left + r.width / 2, cy: r.top + r.height / 2, ts: performance.now() })
    }, 120)
    return () => clearTimeout(id)
  }, [dominantAnchor])

  /* Compute zoom-pulse opacity that fades over ~1.2s after each anchor change */
  const zoomAge = zoomTarget ? (performance.now() - zoomTarget.ts) / 1000 : 999
  const zoomOpacity = zoomAge < 1.2 ? (1 - zoomAge / 1.2) * 0.35 : 0

  const renderItem = (item) => {
    const vis = getVis(elapsed, item.start, item.end)
    if (!vis) return null
    const base = { vis, elapsed }

    switch (item.type) {
      case 'banner':
        return <Banner key={item.id} {...item} {...base} />
      case 'box': {
        const rect = getAnchorRect(item.anchor, item.pad ?? 12)
        return <BoxRing key={item.id} rect={rect} color={item.color} circle={item.circle} {...base} />
      }
      case 'arrow-to': {
        const rect = getAnchorRect(item.anchor, 0)
        return <ArrowTo key={item.id} rect={rect} from={item.from} color={item.color} offset={item.offset} {...base} />
      }
      case 'postit':
        return <PostIt key={item.id} {...item} {...base} />
      case 'callout':
        return <Callout key={item.id} {...item} {...base} />
      case 'tag':
        return <FloatingTag key={item.id} {...item} {...base} />
      case 'outro':
        return <Outro key={item.id} vis={vis} elapsed={elapsed} />
      default:
        return null
    }
  }

  /* Zoom-pulse overlay: subtle vignette + expanding glow on focused element */
  const zoomPulse = zoomOpacity > 0.01 && zoomTarget ? (
    <div key="zoom-pulse" style={{
      position:'fixed', inset:0, zIndex:9990, pointerEvents:'none',
      opacity: zoomOpacity,
      background:`radial-gradient(circle at ${zoomTarget.cx}px ${zoomTarget.cy}px,
        rgba(59,130,246,0.18) 0px,
        rgba(59,130,246,0.06) 220px,
        rgba(2,4,12,0.35) 700px,
        rgba(2,4,12,0.55) 1400px)`,
      transition:'opacity 0.4s ease',
    }} />
  ) : null

  return createPortal(
    <>{zoomPulse}{activeItems.map(renderItem)}</>,
    document.body
  )
}
