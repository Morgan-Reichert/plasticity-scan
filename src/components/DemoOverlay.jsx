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
   SCREEN TRANSITIONS — crossfade lumineux entre écrans
   À chaque transition d'écran (App.jsx), on flash un voile blanc
   doux pour masquer le hard-cut et donner un feel cinéma.
   ══════════════════════════════════════════════════════════════ */
const SCREEN_TRANSITIONS = [
  { at: 6.0,  duration: 0.9 },   // landing → survey
  { at: 12.0, duration: 0.9 },   // survey → computing
  { at: 14.8, duration: 0.7 },   // computing → results (lighter)
  { at: 34.0, duration: 0.9 },   // results → dashboard
  { at: 44.0, duration: 1.4 },   // dashboard → outro (longer, more dramatic)
]

function ScreenFlash({ elapsed }) {
  const active = SCREEN_TRANSITIONS.find(tr =>
    elapsed >= tr.at - 0.25 && elapsed < tr.at + tr.duration
  )
  if (!active) return null
  // 3-stage envelope: build-up → peak white → fade
  const local = (elapsed - (active.at - 0.25)) / (active.duration + 0.25)
  const c = clamp(local, 0, 1)
  // Bell curve: smooth in, hold briefly, smooth out
  const env = c < 0.35
    ? easeOutCubic(c / 0.35)
    : c < 0.55
      ? 1
      : 1 - easeInCubic((c - 0.55) / 0.45)
  const opacity = env * 0.85
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9996, pointerEvents:'none',
      background:`radial-gradient(ellipse at center, rgba(255,255,255,${opacity}) 0%, rgba(240,244,255,${opacity * 0.75}) 60%, rgba(232,238,255,${opacity * 0.5}) 100%)`,
      mixBlendMode:'screen',
    }} />
  )
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

  // Callout dans la marge gauche, explique le curseur
  { id:'s-callout', type:'callout', start:9.6, end:11.6,
    text:'Curseur intuitif\n0 → 9 points\nLecture systémique',
    color:'#3B82F6', pos:{ top:'62%', left:'3%' }, from:'left' },

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

/* ── Banner — bandeau supérieur glassmorphic clair ─────────── */
function Banner({ title, subtitle, color, vis }) {
  const { opacity, progress } = vis
  const ty = progress < 1
    ? (1 - easeOutCubic(clamp(progress, 0, 1))) * -100
    : easeInCubic(clamp(1 - progress, 0, 1)) * -55
  return (
    <div style={{
      position:'fixed', top:0, left:0, right:0,
      zIndex:9992, pointerEvents:'none',
      background:'rgba(255,255,255,0.92)',
      backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
      borderBottom:`1px solid ${color}38`,
      padding:'14px 48px 18px',
      boxShadow:`0 6px 32px rgba(15,23,42,0.10), 0 0 1px ${color}30`,
      opacity, transform:`translateY(${ty}px)`,
    }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3,
        background:`linear-gradient(to right,${color},${color}00)` }} />
      <p style={{ fontSize:9, color, textTransform:'uppercase', letterSpacing:'0.26em',
        fontWeight:800, fontFamily:'Manrope,sans-serif', marginBottom:6 }}>
        ✦ Plasticity Scan® — by Sensup
      </p>
      <div style={{ display:'flex', alignItems:'baseline', gap:18, flexWrap:'wrap' }}>
        <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800,
          color:'#0F172A', lineHeight:1.2, margin:0 }}>{title}</h2>
        {subtitle && <p style={{ fontFamily:'Manrope,sans-serif', fontSize:12,
          color:'#64748B', lineHeight:1.4, margin:0 }}>{subtitle}</p>}
      </div>
    </div>
  )
}

/* ── BoxRing — anneau qui suit un élément DOM ───────────────── */
function BoxRing({ rect, color, vis, elapsed, circle, ...rest }) {
  if (!rect) return null
  const { opacity, progress } = vis
  const pulse = 1 + Math.sin(elapsed * 3.2) * 0.022
  const entryT = clamp(progress, 0, 1)
  const exitT  = clamp(1 - progress, 0, 1)
  // Soyeux scale: enters with slight bounce, exits gently
  const entryS = 0.85 + easeOutCubic(entryT) * 0.15
  const exitS  = 1 - easeInCubic(exitT) * 0.04
  const finalS = progress < 1 ? entryS : exitS
  // Blur fade
  const blurAmt = progress < 1 ? (1 - entryT) * 6 : easeInCubic(exitT) * 4

  const radius = circle
    ? '50%'
    : `${Math.min(rect.width, rect.height) * 0.18}px`

  return (
    <div data-overlay-id={rest['data-overlay-id']} style={{
      position:'fixed',
      left: rect.left, top: rect.top,
      width: rect.width, height: rect.height,
      borderRadius: radius,
      border:`2.5px solid ${color}`,
      boxShadow:`0 0 32px ${color}80, 0 0 80px ${color}30, inset 0 0 28px ${color}10`,
      transform:`scale(${finalS * pulse})`,
      transformOrigin:'center',
      opacity: opacity * 0.95,
      filter:`blur(${blurAmt}px)`,
      zIndex:9991, pointerEvents:'none',
      transition:'border-color 0.4s ease',
    }}>
      {/* outer echo */}
      <div style={{
        position:'absolute',
        inset:`${-(6 + Math.sin(elapsed * 2.1) * 3)}px`,
        borderRadius: radius,
        border:`1px solid ${color}38`,
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
  const { transform: posTransform = '', ...posRest } = pos || {}
  return (
    <div style={{
      position:'fixed', ...posRest,
      background:color+'F0', color:DARK_TEXT.has(color)?'#0D1117':'#FFFFFF',
      padding:'18px 18px 14px', borderRadius:3,
      transform:`${posTransform} rotate(${rotate}) scale(${scale}) translateY(${lift}px)`,
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
function Callout({ text, color, pos, from = 'right', vis, ...rest }) {
  const { opacity, progress } = vis
  const entryT  = clamp(progress, 0, 1)
  const exitAmt = clamp(1 - progress, 0, 1)
  // Smoother slide-in distance + blur for a silky entry
  const slideDist = 50
  const dxE = from==='right'?(1-easeOutCubic(entryT))*slideDist:from==='left'?(1-easeOutCubic(entryT))*-slideDist:0
  const dyE = from==='bottom'?(1-easeOutCubic(entryT))*36:0
  const dxX = from==='right'?easeInCubic(exitAmt)*24:from==='left'?easeInCubic(exitAmt)*-24:0
  const dyX = easeInCubic(exitAmt)*10
  const tx = progress<1?dxE:dxX
  const ty = progress<1?dyE:dyX
  const scale = progress<1 ? 0.92 + easeOutCubic(entryT) * 0.08 : 1 - easeInCubic(exitAmt) * 0.06
  const blur  = progress<1 ? (1 - entryT) * 6 : easeInCubic(exitAmt) * 3
  const { transform: posTransform = '', ...posRest } = pos || {}
  return (
    <div data-overlay-id={rest['data-overlay-id']} style={{
      position:'fixed', ...posRest,
      background:'rgba(255,255,255,0.96)', backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)',
      border:`1.5px solid ${color}55`, borderRadius:14,
      padding:'14px 18px', maxWidth:230, zIndex:9994,
      pointerEvents:'none', opacity,
      transform:`${posTransform} translateX(${tx}px) translateY(${ty}px) scale(${scale})`,
      filter:`blur(${blur}px)`,
      boxShadow:`0 8px 28px rgba(15,23,42,0.12), 0 0 24px ${color}22`,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
        <div style={{ width:6, height:6, borderRadius:'50%', background:color, boxShadow:`0 0 7px ${color}` }} />
        <span style={{ fontSize:9, fontWeight:800, color, textTransform:'uppercase',
          letterSpacing:'0.15em', fontFamily:'Manrope,sans-serif' }}>Plasticity Scan®</span>
      </div>
      <p style={{ color:'#0F172A', fontSize:13, fontWeight:600, lineHeight:1.6,
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
  const { transform: posTransform = '', ...posRest } = pos || {}
  return (
    <div style={{
      position:'fixed', ...posRest,
      background:'rgba(255,255,255,0.92)',
      backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
      border:`1.5px solid ${color}66`, borderRadius:100,
      padding:'9px 20px', color, fontSize:12, fontWeight:700,
      fontFamily:'Manrope,sans-serif', letterSpacing:'0.04em',
      zIndex:9993, pointerEvents:'none', opacity,
      transform:`${posTransform} translateY(${ty}px) scale(${scale})`,
      boxShadow:`0 4px 18px rgba(15,23,42,0.10), 0 0 14px ${color}22`,
      whiteSpace:'nowrap',
    }}>{text}</div>
  )
}

/* ══════════════════════════════════════════════════════════════
   OUTRO — Thème CLAIR, montage pro avec séquence chorégraphiée
   Chaque élément a son propre timing relatif au début de l'outro.
   ══════════════════════════════════════════════════════════════ */
function Outro({ vis, elapsed }) {
  const { progress } = vis
  const eMaster = easeOutCubic(clamp(progress, 0, 1))
  const t = Math.max(0, elapsed - 44.0)

  // Helper to fade-in individual elements with delay + duration
  const reveal = (delay, dur = 0.9) => {
    const local = clamp((t - delay) / dur, 0, 1)
    return { e: easeOutCubic(local), back: easeOutBack(local) }
  }

  const r1 = reveal(0.0, 1.1)   // halo
  const r2 = reveal(0.15, 1.0)  // logo
  const r3 = reveal(0.8, 0.7)   // divider 1 + by sensup
  const r4 = reveal(1.3, 0.7)   // tagline
  const r5 = reveal(1.7, 0.7)   // subtitle
  const r6 = reveal(2.0, 0.7)   // pills container
  const r7 = reveal(2.8, 0.6)   // divider 2 + footer

  const breathe = 1 + Math.sin(t * 0.6) * 0.014
  const glowPulse = 0.75 + Math.sin(t * 0.85) * 0.25

  const pills = [
    { label:'plasticité',   color:'#3B82F6' },
    { label:'systémique',   color:'#14B8A6' },
    { label:'organisation', color:'#8B5CF6' },
    { label:'diversité',    color:'#F59E0B' },
  ]

  return (
    <div style={{
      position:'fixed', inset:0,
      background:`
        radial-gradient(ellipse at 50% 38%, rgba(59,130,246,0.12) 0%, transparent 55%),
        radial-gradient(ellipse at 15% 85%, rgba(139,92,246,0.07) 0%, transparent 50%),
        radial-gradient(ellipse at 85% 18%, rgba(20,184,166,0.08) 0%, transparent 50%),
        linear-gradient(180deg, #F0F4FF 0%, #E8EEFF 50%, #F0F4FF 100%)
      `,
      opacity: eMaster,
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      zIndex:10000, pointerEvents:'none', overflow:'hidden',
    }}>

      {/* Aurora conique tournante */}
      <div style={{ position:'absolute', inset:0, opacity: eMaster * glowPulse * 0.6, pointerEvents:'none',
        background:`
          conic-gradient(from ${t * 6}deg at 50% 50%,
            rgba(59,130,246,0.08) 0deg,
            rgba(20,184,166,0.12) 90deg,
            rgba(139,92,246,0.07) 180deg,
            rgba(245,158,11,0.06) 270deg,
            rgba(59,130,246,0.08) 360deg)`,
        filter:'blur(100px)',
      }} />

      {/* Dot grid overlay */}
      <div style={{ position:'absolute', inset:0, opacity: eMaster * 0.55, pointerEvents:'none',
        backgroundImage:'radial-gradient(circle,rgba(59,130,246,0.10) 1px,transparent 1px)',
        backgroundSize:'28px 28px',
        transform:`translateY(${Math.sin(t * 0.3) * 6}px)`,
      }} />

      {/* Mots géants drifting */}
      {[
        { text:'plasticité',   color:'#3B82F6', x:'2%',  y:'12%', size:74, op:0.06, drift: t * 0.3 },
        { text:'systémique',   color:'#8B5CF6', x:'1%',  y:'72%', size:66, op:0.055, drift: t * -0.4 },
        { text:'organisation', color:'#14B8A6', x:'50%', y:'8%',  size:58, op:0.05, drift: t * 0.5 },
        { text:'diversité',    color:'#F59E0B', x:'56%', y:'78%', size:62, op:0.055, drift: t * -0.35 },
      ].map((w, i) => {
        const wReveal = reveal(0.2 + i * 0.1, 1.5).e
        return (
          <div key={w.text} style={{
            position:'absolute', left:w.x, top:w.y,
            fontFamily:'Syne,sans-serif', fontSize:w.size, fontWeight:900,
            color:w.color, opacity: wReveal * w.op, userSelect:'none', pointerEvents:'none',
            letterSpacing:'-0.02em',
            transform:`translateY(${(1-wReveal)*20 + Math.sin(t * 0.3 + i) * 5}px) translateX(${w.drift}px)`,
          }}>{w.text}</div>
        )
      })}

      {/* Particules — apparition staggered */}
      {Array.from({ length: 24 }).map((_, i) => {
        const seed = i * 47.3
        const px = (seed * 13.7) % 100
        const py = (seed * 7.3) % 100
        const drift = Math.sin(t * 0.4 + i) * 30
        const driftY = Math.cos(t * 0.5 + i * 1.3) * 22
        const size = 2 + (i % 4)
        const col = ['#3B82F6','#14B8A6','#8B5CF6','#F59E0B'][i % 4]
        const partReveal = reveal(0.4 + (i % 6) * 0.08, 1.2).e
        return (
          <div key={i} style={{
            position:'absolute',
            left:`${px}%`, top:`${py}%`,
            width:size, height:size, borderRadius:'50%',
            background:col, opacity: partReveal * 0.55,
            boxShadow:`0 0 ${size*5}px ${col}`,
            transform:`translate(${drift}px, ${driftY}px)`,
            pointerEvents:'none',
          }} />
        )
      })}

      {/* Contenu principal — flex strict pour centrage parfait */}
      <div style={{
        position:'relative',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        padding:'0 48px', maxWidth:920, width:'100%',
        transform:`scale(${breathe})`,
      }}>

        {/* Halo radial derrière le logo */}
        <div style={{
          position:'absolute', left:'50%', top:130,
          transform:'translate(-50%, -50%)',
          width:620, height:620, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(59,130,246,0.20) 0%, rgba(20,184,166,0.10) 35%, transparent 70%)',
          filter:'blur(50px)',
          opacity: r1.e * glowPulse,
          pointerEvents:'none',
        }} />

        {/* Logo Plasticity Scan — centré strict */}
        <div style={{
          display:'flex', justifyContent:'center', alignItems:'center',
          width:'100%', marginBottom:24,
          opacity: r2.e,
          transform:`translateY(${(1 - r2.back) * 30}px) scale(${0.85 + r2.back * 0.15})`,
          filter:`blur(${(1 - r2.e) * 8}px)`,
        }}>
          <img src="/plasticity-scan-logo.png" alt="Plasticity Scan"
            style={{
              height:170, width:'auto', objectFit:'contain', display:'block',
              filter:`drop-shadow(0 14px 40px rgba(59,130,246,${0.28 * glowPulse}))`,
            }} />
        </div>

        {/* Trait séparateur */}
        <div style={{
          width:140, height:1, marginBottom:24,
          background:`linear-gradient(to right, transparent, rgba(59,130,246,0.55), transparent)`,
          opacity: r3.e,
          transform:`scaleX(${r3.e})`,
        }} />

        {/* By Sensup */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'center', gap:18, marginBottom:44,
          opacity: r3.e,
          transform:`translateY(${(1 - r3.e) * 12}px)`,
        }}>
          <span style={{ fontFamily:'Manrope,sans-serif', fontSize:12, color:'#64748B',
            textTransform:'uppercase', letterSpacing:'0.4em', fontWeight:700 }}>by</span>
          <img src="/sens-up-logo.png" alt="Sensup"
            style={{ height:58, width:'auto', objectFit:'contain', display:'block' }} />
        </div>

        {/* Tagline */}
        <p style={{
          fontFamily:'Syne,sans-serif', fontSize:28, color:'#0F172A',
          lineHeight:1.35, maxWidth:620, margin:'0 auto 16px', fontWeight:700,
          letterSpacing:'-0.01em', textAlign:'center',
          opacity: r4.e,
          transform:`translateY(${(1 - r4.e) * 16}px)`,
          filter:`blur(${(1 - r4.e) * 6}px)`,
        }}>
          Révélez la{' '}
          <span style={{
            background:'linear-gradient(90deg,#3B82F6,#14B8A6)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            backgroundClip:'text', fontWeight:800,
          }}>plasticité</span>{' '}
          de vos organisations.
        </p>
        <p style={{
          fontFamily:'Manrope,sans-serif', fontSize:15, color:'#64748B',
          lineHeight:1.65, maxWidth:500, margin:'0 auto 48px', fontWeight:500,
          textAlign:'center',
          opacity: r5.e,
          transform:`translateY(${(1 - r5.e) * 12}px)`,
        }}>
          Un diagnostic systémique pour les intervenants en transformation organisationnelle.
        </p>

        {/* Pills concepts — apparition cascade */}
        <div style={{
          display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', marginBottom:52,
          opacity: r6.e,
        }}>
          {pills.map(({ label, color }, i) => {
            const pillLocal = clamp((t - 2.0 - i * 0.12) / 0.6, 0, 1)
            const pillScale = easeOutBack(pillLocal)
            return (
              <div key={label} style={{
                padding:'11px 26px', borderRadius:100,
                background:'rgba(255,255,255,0.88)',
                border:`1.5px solid ${color}55`,
                color, fontSize:13, fontWeight:700,
                fontFamily:'Manrope,sans-serif', letterSpacing:'0.06em',
                boxShadow:`0 4px 24px rgba(15,23,42,0.06), 0 0 16px ${color}1A, inset 0 1px 0 ${color}20`,
                opacity: pillLocal,
                transform:`scale(${0.6 + pillScale * 0.4}) translateY(${(1-pillLocal)*14}px)`,
                backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
              }}>{label}</div>
            )
          })}
        </div>

        {/* Divider final */}
        <div style={{
          width:180, height:1, marginBottom:22,
          background:`linear-gradient(to right, transparent, rgba(20,184,166,0.5), transparent)`,
          opacity: r7.e,
          transform:`scaleX(${r7.e})`,
        }} />

        {/* Footer */}
        <div style={{
          opacity: r7.e,
          transform:`translateY(${(1 - r7.e) * 10}px)`,
          textAlign:'center',
        }}>
          <p style={{
            fontFamily:'Manrope,sans-serif', fontSize:11, color:'#64748B',
            textTransform:'uppercase', letterSpacing:'0.3em', fontWeight:700, marginBottom:10,
          }}>
            Diagnostic Systémique · 2026
          </p>
          <p style={{
            fontFamily:'Manrope,sans-serif', fontSize:11, color:'#3B82F6',
            letterSpacing:'0.25em', fontWeight:700, opacity:0.85,
          }}>
            ◆ HeR Labs 2026
          </p>
        </div>
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
    // Debug: if window.__DEMO_SEEK__ is set, freeze at that time
    if (typeof window.__DEMO_SEEK__ === 'number') {
      setElapsed(window.__DEMO_SEEK__)
      // Still tick at 1fps for continuous animations (breathe, particles)
      const id = setInterval(() => {
        setElapsed(window.__DEMO_SEEK__ + Math.random() * 0.001)  // micro-jitter to refresh
      }, 100)
      return () => clearInterval(id)
    }
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
      // Compute target scrollY so the element is centered vertically in the viewport
      const r = el.getBoundingClientRect()
      const absoluteCenterY = window.scrollY + r.top + r.height / 2
      const targetY = Math.max(0, absoluteCenterY - window.innerHeight / 2)
      window.scrollTo({ top: targetY, behavior: 'smooth' })

      // Trigger a brief zoom-pulse focus on this element (after scroll settles)
      setTimeout(() => {
        const r2 = el.getBoundingClientRect()
        setZoomTarget({ cx: r2.left + r2.width / 2, cy: r2.top + r2.height / 2, ts: performance.now() })
      }, 350)
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
    const debugProps = { 'data-overlay-id': item.id }

    switch (item.type) {
      case 'banner':
        return <Banner key={item.id} {...item} {...base} {...debugProps} />
      case 'box': {
        const rect = getAnchorRect(item.anchor, item.pad ?? 12)
        return <BoxRing key={item.id} rect={rect} color={item.color} circle={item.circle} {...base} {...debugProps} />
      }
      case 'arrow-to': {
        const rect = getAnchorRect(item.anchor, 0)
        return <ArrowTo key={item.id} rect={rect} from={item.from} color={item.color} offset={item.offset} {...base} {...debugProps} />
      }
      case 'postit':
        return <PostIt key={item.id} {...item} {...base} {...debugProps} />
      case 'callout':
        return <Callout key={item.id} {...item} {...base} {...debugProps} />
      case 'tag':
        return <FloatingTag key={item.id} {...item} {...base} {...debugProps} />
      case 'outro':
        return <Outro key={item.id} vis={vis} elapsed={elapsed} {...debugProps} />
      default:
        return null
    }
  }

  /* Zoom-pulse overlay: soft light glow on focused element, light vignette around */
  const zoomPulse = zoomOpacity > 0.01 && zoomTarget ? (
    <div key="zoom-pulse" style={{
      position:'fixed', inset:0, zIndex:9990, pointerEvents:'none',
      opacity: zoomOpacity,
      background:`radial-gradient(circle at ${zoomTarget.cx}px ${zoomTarget.cy}px,
        rgba(59,130,246,0.16) 0px,
        rgba(59,130,246,0.05) 220px,
        rgba(15,23,42,0.10) 700px,
        rgba(15,23,42,0.18) 1400px)`,
      transition:'opacity 0.4s ease',
    }} />
  ) : null

  return createPortal(
    <>
      <ScreenFlash elapsed={elapsed} />
      {zoomPulse}
      {activeItems.map(renderItem)}
    </>,
    document.body
  )
}
