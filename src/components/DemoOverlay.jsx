import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/* ══════════════════════════════════════════════════════════════
   EASING HELPERS
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
   TIMELINE
   Screen transitions: 0s landing · 6s survey · 12s computing
                       ~14.8s results · 34s dashboard · 44s outro
   Max 3 elements simultaneously. No element crosses a transition.
   Banner always ends before other elements start on same screen.
   ══════════════════════════════════════════════════════════════ */
const TIMELINE = [

  /* ── LANDING (0–6s) ─────────────────────────────────────── */
  { id:'l-banner', type:'banner', start:0.3, end:3.3,
    title:'Diagnostic de Plasticité Organisationnelle',
    subtitle:'Mesurez et activez la capacité d\'adaptation de votre organisation',
    color:'#3B82F6' },

  { id:'l-ring', type:'ring', start:3.5, end:5.6,
    pos:{ left:'50%', top:'30%' }, w:160, h:160, color:'#3B82F6' },

  { id:'l-postit', type:'postit', start:3.7, end:5.7,
    text:'7 dimensions\nsystémiques\n14 questions',
    color:'#F59E0B', pos:{ top:'20%', left:'3%' }, rotate:'-4deg' },

  { id:'l-arrow', type:'arrow', start:4.1, end:5.4,
    direction:'right', color:'#14B8A6',
    pos:{ top:'48%', left:'28%' } },         // → CTA button

  { id:'l-tag', type:'tag', start:4.8, end:5.7,
    text:'⚡ 5 min · résultat immédiat',
    color:'#F59E0B', pos:{ bottom:'20%', left:'50%', transform:'translateX(-50%)' } },

  /* ── SURVEY (6–12s) ─────────────────────────────────────── */
  { id:'s-banner', type:'banner', start:6.4, end:9.0,
    title:'Évaluation par Dimensions',
    subtitle:'Chaque dimension analysée à travers 3 niveaux organisationnels',
    color:'#14B8A6' },

  { id:'s-ring', type:'ring', start:9.2, end:11.0,
    pos:{ left:'72%', top:'25%' }, w:105, h:38, color:'#8B5CF6' }, // around level badge

  { id:'s-arrow', type:'arrow', start:9.4, end:10.6,
    direction:'down', color:'#3B82F6',
    pos:{ top:'56%', left:'50%' } },          // ↓ toward slider

  { id:'s-callout', type:'callout', start:9.8, end:11.7,
    text:'Curseur intuitif\n0 → 9 points\nRéponse en glissé',
    color:'#3B82F6', pos:{ top:'64%', left:'3%' }, from:'left' },

  { id:'s-tag', type:'tag', start:10.7, end:11.7,
    text:'🔬 Lecture systémique par dimension',
    color:'#14B8A6', pos:{ top:'42%', left:'3%' } },

  /* ── COMPUTING (12–~14.8s) ──────────────────────────────── */
  { id:'c-postit', type:'postit', start:12.5, end:14.5,
    text:'Algorithme\nsystémique\nen temps réel',
    color:'#3B82F6', pos:{ top:'16%', right:'8%' }, rotate:'3deg' },

  { id:'c-ring', type:'ring', start:12.6, end:14.5,
    pos:{ left:'50%', top:'43%' }, w:118, h:118, color:'#14B8A6' }, // around center icon

  { id:'c-callout', type:'callout', start:13.2, end:14.5,
    text:'7 dimensions calculées\nLeviers prioritaires identifiés',
    color:'#14B8A6', pos:{ bottom:'18%', left:'50%', transform:'translateX(-50%)' }, from:'bottom' },

  /* ── RESULTS (~14.8–34s) ────────────────────────────────── */
  { id:'r-banner', type:'banner', start:15.1, end:18.1,
    title:'Profil de Plasticité Révélé',
    subtitle:'Score global · Radar systémique · Vision collective & individuelle',
    color:'#14B8A6' },

  { id:'r-ring-score', type:'ring', start:18.3, end:22.0,
    pos:{ left:'11%', top:'37%' }, w:138, h:138, color:'#F59E0B' }, // around score card

  { id:'r-arrow-radar', type:'arrow', start:18.5, end:20.5,
    direction:'right', color:'#3B82F6',
    pos:{ top:'40%', left:'22%' } },          // → toward radar

  { id:'r-callout-radar', type:'callout', start:19.5, end:26.5,
    text:'Radar systémique\n7 dimensions visualisées\nen un coup d\'œil',
    color:'#3B82F6', pos:{ top:'28%', right:'3%' }, from:'right' },

  { id:'r-postit-score', type:'postit', start:20.5, end:25.0,
    text:'Score global\npersonnalisé\nsur 9',
    color:'#F59E0B', pos:{ top:'24%', left:'3%' }, rotate:'-4deg' },

  { id:'r-ring-col', type:'ring', start:24.5, end:28.5,
    pos:{ left:'50%', top:'20%' }, w:240, h:46, color:'#14B8A6' }, // around section title

  { id:'r-callout-col', type:'callout', start:25.5, end:29.5,
    text:'Vision collective\ncomparée à votre profil\nindividuel',
    color:'#14B8A6', pos:{ top:'44%', left:'3%' }, from:'left' },

  { id:'r-arrow-levers', type:'arrow', start:27.5, end:30.0,
    direction:'down', color:'#8B5CF6',
    pos:{ top:'48%', left:'50%' } },          // ↓ toward levers section

  { id:'r-callout-levers', type:'callout', start:28.5, end:33.0,
    text:'Leviers d\'action\nprioritaires identifiés\nautomatiquement',
    color:'#8B5CF6', pos:{ top:'54%', right:'3%' }, from:'right' },

  { id:'r-tag-pdf', type:'tag', start:30.5, end:33.7,
    text:'📄 Rapport PDF · Analyse IA Mistral',
    color:'#EF4444', pos:{ bottom:'24%', left:'4%' } },

  { id:'r-callout-ai', type:'callout', start:31.8, end:33.7,
    text:'Débrief IA Mistral\nPersonnalisé & actionnable',
    color:'#F59E0B', pos:{ bottom:'24%', right:'3%' }, from:'right' },

  /* ── DASHBOARD (34–44s) ──────────────────────────────────── */
  { id:'d-banner', type:'banner', start:34.3, end:37.4,
    title:'Tableau de Bord Intervenants',
    subtitle:'Vue agrégée multi-entreprises · Analyse IA · Export PDF intelligent',
    color:'#8B5CF6' },

  { id:'d-ring-kpi', type:'ring', start:37.6, end:40.5,
    pos:{ left:'38%', top:'22%' }, w:185, h:78, color:'#3B82F6' }, // around KPI cards

  { id:'d-arrow-chart', type:'arrow', start:38.0, end:40.0,
    direction:'right', color:'#14B8A6',
    pos:{ top:'38%', left:'20%' } },          // → toward radar chart

  { id:'d-callout-kpi', type:'callout', start:38.5, end:43.0,
    text:'Scores agrégés\npar entreprise en temps réel',
    color:'#3B82F6', pos:{ top:'30%', left:'3%' }, from:'left' },

  { id:'d-ring-chart', type:'ring', start:40.0, end:43.0,
    pos:{ left:'30%', top:'50%' }, w:200, h:160, color:'#14B8A6' }, // around radar

  { id:'d-postit', type:'postit', start:40.5, end:43.5,
    text:'Données\nen temps\nréel',
    color:'#14B8A6', pos:{ top:'44%', right:'3%' }, rotate:'2deg' },

  { id:'d-tag', type:'tag', start:41.5, end:43.5,
    text:'🏢 Gestion multi-entreprises',
    color:'#F59E0B', pos:{ bottom:'26%', left:'4%' } },

  { id:'d-callout-pdf', type:'callout', start:42.0, end:43.7,
    text:'Export PDF intelligent\nAnalyse IA Mistral incluse',
    color:'#EF4444', pos:{ bottom:'18%', right:'3%' }, from:'right' },

  /* ── OUTRO (44s+) ─────────────────────────────────────────── */
  { id:'outro', type:'outro', start:44.0, end:999 },
]

/* ══════════════════════════════════════════════════════════════
   COMPONENTS  (all receive vis + elapsed)
   ══════════════════════════════════════════════════════════════ */

/* ── Banner ─────────────────────────────────────────────────── */
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

/* ── Ring — pulsing highlight oval ──────────────────────────── */
function Ring({ color, pos, w = 100, h = 100, vis, elapsed }) {
  const { opacity, progress } = vis
  const pulse = 1 + Math.sin(elapsed * 3.2) * 0.05
  const entryS = easeOutCubic(clamp(progress, 0, 1))
  const exitS  = 1 - easeInCubic(clamp(1 - progress, 0, 1)) * 0.15
  const finalS = progress < 1 ? entryS : exitS

  return (
    <div style={{
      position:'fixed', ...pos,
      width:w, height:h, borderRadius:'50%',
      border:`2px solid ${color}`,
      boxShadow:`0 0 20px ${color}70, 0 0 50px ${color}25, inset 0 0 18px ${color}12`,
      transform:`translate(-50%,-50%) scale(${finalS * pulse})`,
      opacity: opacity * 0.9, zIndex:9991, pointerEvents:'none',
    }}>
      {/* Outer echo ring */}
      <div style={{
        position:'absolute',
        top: `${-(8 + Math.sin(elapsed * 2.1) * 4)}px`,
        left: `${-(8 + Math.sin(elapsed * 2.1) * 4)}px`,
        right: `${-(8 + Math.sin(elapsed * 2.1) * 4)}px`,
        bottom: `${-(8 + Math.sin(elapsed * 2.1) * 4)}px`,
        borderRadius:'50%',
        border:`1px solid ${color}28`,
        pointerEvents:'none',
      }} />
    </div>
  )
}

/* ── Arrow — bouncing directional arrow ─────────────────────── */
function Arrow({ direction = 'right', color, pos, vis, elapsed }) {
  const { opacity, progress } = vis
  const bounce = Math.sin(elapsed * 4.8) * 9
  const entryT  = clamp(progress, 0, 1)
  const exitAmt = clamp(1 - progress, 0, 1)
  const shaftLen = 70 * easeOutCubic(entryT)

  const [dx, dy] = ({
    right: [bounce, 0], left: [-bounce, 0],
    down:  [0, bounce], up: [0, -bounce],
  })[direction] ?? [bounce, 0]

  const rotDeg = ({ right:0, down:90, left:180, up:-90 })[direction] ?? 0

  return (
    <div style={{
      position:'fixed', ...pos,
      opacity: opacity * (1 - easeInCubic(exitAmt) * 0.15),
      zIndex:9993, pointerEvents:'none',
      transform:`translateX(${dx}px) translateY(${dy}px)`,
      display:'flex', alignItems:'center',
    }}>
      <div style={{
        display:'flex', alignItems:'center',
        transform:`rotate(${rotDeg}deg)`,
        transformOrigin:'left center',
        filter:`drop-shadow(0 0 10px ${color}90)`,
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

/* ── Outro ───────────────────────────────────────────────────── */
const BG_WORDS = [
  { text:'plasticité',   color:'#3B82F6', x:'6%',  y:'16%', size:56, op:0.06 },
  { text:'organisation', color:'#14B8A6', x:'54%', y:'11%', size:42, op:0.05 },
  { text:'systémique',   color:'#8B5CF6', x:'5%',  y:'76%', size:48, op:0.055 },
  { text:'diversité',    color:'#F59E0B', x:'55%', y:'80%', size:40, op:0.05 },
]
function Outro({ vis }) {
  const { opacity, progress } = vis
  const e = easeOutCubic(clamp(progress, 0, 1))
  const pills = [
    { label:'plasticité',   color:'#3B82F6' },
    { label:'systémique',   color:'#14B8A6' },
    { label:'organisation', color:'#8B5CF6' },
    { label:'diversité',    color:'#F59E0B' },
  ]
  return (
    <div style={{ position:'fixed', inset:0,
      background:`rgba(4,8,18,${e*0.98})`,
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      zIndex:10000, pointerEvents:'none' }}>
      {/* Glow */}
      <div style={{ position:'absolute', inset:0, opacity:e, pointerEvents:'none',
        background:'radial-gradient(ellipse at 50% 50%,rgba(59,130,246,0.14) 0%,rgba(20,184,166,0.07) 35%,transparent 65%)' }} />
      {/* Dot grid */}
      <div style={{ position:'absolute', inset:0, opacity:e*0.6, pointerEvents:'none',
        backgroundImage:'radial-gradient(circle,rgba(148,163,184,0.08) 1px,transparent 1px)',
        backgroundSize:'28px 28px' }} />

      {/* Background words */}
      {BG_WORDS.map((w, i) => (
        <div key={w.text} style={{
          position:'absolute', left:w.x, top:w.y,
          fontFamily:'Syne,sans-serif', fontSize:w.size, fontWeight:800,
          color:w.color, opacity:e*w.op, userSelect:'none', pointerEvents:'none',
          transform:`translateY(${(1-e)*(20+i*5)}px)`,
        }}>{w.text}</div>
      ))}

      {/* Main content */}
      <div style={{ position:'relative', textAlign:'center', padding:'0 48px',
        opacity:e, transform:`translateY(${(1-e)*28}px)` }}>

        {/* Icon */}
        <div style={{
          width:88, height:88, borderRadius:22, margin:'0 auto 32px',
          background:'linear-gradient(135deg,#3B82F6,#14B8A6)',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 0 80px rgba(59,130,246,0.5),0 0 40px rgba(20,184,166,0.3)',
          fontSize:40, color:'white', fontFamily:'Syne,sans-serif', fontWeight:800,
        }}>✦</div>

        {/* Brand */}
        <h1 style={{
          fontFamily:'Syne,sans-serif', fontSize:52, fontWeight:800, lineHeight:1,
          background:'linear-gradient(90deg,#3B82F6 0%,#14B8A6 45%,#60A5FA 100%)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          backgroundClip:'text', marginBottom:16,
        }}>Plasticity Scan®</h1>

        {/* Sensup logo — bigger */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:14, marginBottom:28 }}>
          <span style={{ fontFamily:'Manrope,sans-serif', fontSize:13, color:'#475569',
            textTransform:'uppercase', letterSpacing:'0.3em', fontWeight:700 }}>by</span>
          <img src="/sensup-logo.png" alt="Sensup"
            style={{ height:76, width:'auto', objectFit:'contain', opacity:0.9 }} />
        </div>

        {/* Tagline */}
        <p style={{ fontFamily:'Manrope,sans-serif', fontSize:18, color:'#94A3B8',
          lineHeight:1.65, maxWidth:480, margin:'0 auto 36px', fontWeight:500 }}>
          Révélez et activez la plasticité organisationnelle de vos clients.
        </p>

        {/* Concept pills */}
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:40 }}>
          {pills.map(({ label, color }) => (
            <div key={label} style={{
              padding:'8px 20px', borderRadius:100,
              background:color+'18', border:`1px solid ${color}40`,
              color, fontSize:12, fontWeight:700,
              fontFamily:'Manrope,sans-serif', letterSpacing:'0.05em',
            }}>{label}</div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width:130, height:1, margin:'0 auto 26px',
          background:'linear-gradient(to right,transparent,rgba(59,130,246,0.4),transparent)' }} />

        {/* Footer */}
        <p style={{ fontFamily:'Manrope,sans-serif', fontSize:11, color:'#4B5563',
          textTransform:'uppercase', letterSpacing:'0.2em', fontWeight:600, marginBottom:8 }}>
          Sensup · Diagnostic Systémique · 2026
        </p>
        <p style={{ fontFamily:'Manrope,sans-serif', fontSize:11, color:'#3B82F6',
          letterSpacing:'0.18em', fontWeight:700, opacity:0.7 }}>
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
    const p = { ...item, vis, elapsed }
    switch (item.type) {
      case 'banner':  return <Banner      key={item.id} {...p} />
      case 'ring':    return <Ring        key={item.id} {...p} />
      case 'arrow':   return <Arrow       key={item.id} {...p} />
      case 'postit':  return <PostIt      key={item.id} {...p} />
      case 'callout': return <Callout     key={item.id} {...p} />
      case 'tag':     return <FloatingTag key={item.id} {...p} />
      case 'outro':   return <Outro       key={item.id} vis={vis} />
      default:        return null
    }
  }

  return createPortal(
    <>{activeItems.map(renderItem)}</>,
    document.body
  )
}
