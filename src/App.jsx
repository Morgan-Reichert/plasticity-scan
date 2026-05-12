import { useState, useEffect } from 'react'
import LandingPage from './components/LandingPage'
import SurveyPage from './components/SurveyPage'
import ResultsPage from './components/ResultsPage'
import ConnectionPage from './components/ConnectionPage'
import DashboardPage from './components/DashboardPage'
import ComputingScreen from './components/ComputingScreen'
import DemoOverlay from './components/DemoOverlay'

/* ── Demo mode preset data ── */
const DEMO_USER = {
  company: 'Sensup',
  companyId: null,
  email: 'marie.dupont@sensup.com',
  profile: 'directeur',
}

// Responses that produce a compelling, varied score (~6.7/9 overall)
const DEMO_RESPONSES = {
  '1_0': 7, '1_1': 8,
  '2_0': 5, '2_1': 6,
  '3_0': 8, '3_1': 7,
  '4_0': 4, '4_1': 5,
  '5_0': 8, '5_1': 9,
  '6_0': 6, '6_1': 7,
  '7_0': 7, '7_1': 8,
}

export default function App() {
  const [screen, setScreen]   = useState('landing')
  const [userData, setUserData]   = useState(null)
  const [responses, setResponses] = useState({})
  const [authUser, setAuthUser]   = useState(null)
  const [isDemo, setIsDemo]       = useState(false)

  /* ── Demo mode: triggered by ?demo in URL ──
     Full video sequence showing ALL screens with DemoOverlay annotations:
       0s  → landing
       6s  → survey  (survey animations play automatically)
       12s → computing  (ComputingScreen.onComplete fires at ~14.8s → results)
       34s → dashboard  (mock data, intervenant role)
       44s → DemoOverlay takes over with outro full-screen slide
     ── */
  useEffect(() => {
    if (!window.location.search.includes('demo')) return
    setIsDemo(true)

    // Start at the very top of the page
    window.scrollTo(0, 0)

    // Pre-load all data immediately so every screen is ready
    setUserData(DEMO_USER)
    setResponses(DEMO_RESPONSES)

    // Hide cursor for the entire duration of the recording
    const styleEl = document.createElement('style')
    styleEl.id = 'demo-cursor-hide'
    styleEl.textContent = '*, *::before, *::after { cursor: none !important; }'
    document.head.appendChild(styleEl)

    const t1 = setTimeout(() => { window.scrollTo(0, 0); setScreen('survey') },    6000)
    const t2 = setTimeout(() => { window.scrollTo(0, 0); setScreen('computing') }, 12000)
    // computing → results is handled naturally by ComputingScreen.onComplete at ~t+2.8s
    // DemoOverlay auto-scrolls to center each anchored annotation, no manual scrolling needed.

    const t3 = setTimeout(() => {
      window.scrollTo(0, 0)
      setAuthUser({ role: 'intervenant', email: 'demo@sensup.com' })
      setScreen('dashboard')
    }, 34000)

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3)
      document.getElementById('demo-cursor-hide')?.remove()
    }
  }, [])

  /* ── Normal handlers ── */
  const handleStart = (data) => { setUserData(data); setScreen('survey') }

  const handleComplete = (surveyResponses) => {
    setResponses(surveyResponses)
    setScreen('computing')
  }

  const handleComputingDone = () => setScreen('results')

  const handleRestart = () => {
    setUserData(null); setResponses({}); setScreen('landing')
  }

  const handleIntervenantSuccess = () => {
    setAuthUser({ role: 'intervenant' }); setScreen('dashboard')
  }

  const handleDirigeantSuccess = (info) => {
    setAuthUser(info); setScreen('dashboard')
  }

  const handleSignOut = () => { setAuthUser(null); setScreen('landing') }

  return (
    <div className="min-h-screen bg-navy">

      {/* Demo badge */}
      {isDemo && (
        <div style={{
          position: 'fixed', bottom: 16, right: 16, zIndex: 9998,
          background: 'rgba(59,130,246,0.15)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(59,130,246,0.3)', borderRadius: 8,
          padding: '4px 12px', fontSize: 10, fontWeight: 700,
          color: '#60A5FA', letterSpacing: '0.1em', textTransform: 'uppercase',
          fontFamily: 'Manrope, sans-serif',
          pointerEvents: 'none',
        }}>
          ● Mode démo
        </div>
      )}

      {screen === 'landing' && (
        <LandingPage
          onStart={handleStart}
          onIntervenantAccess={() => setScreen('connection')}
          isDemo={isDemo}
        />
      )}
      {screen === 'survey' && (
        <SurveyPage userData={userData} onComplete={handleComplete} isDemo={isDemo} />
      )}
      {screen === 'computing' && (
        <ComputingScreen onComplete={handleComputingDone} />
      )}
      {screen === 'results' && (
        <ResultsPage
          userData={userData}
          responses={responses}
          onRestart={handleRestart}
          isDemo={isDemo}
        />
      )}
      {screen === 'connection' && (
        <ConnectionPage
          onIntervenantSuccess={handleIntervenantSuccess}
          onDirigeantSuccess={handleDirigeantSuccess}
          onBack={() => setScreen('landing')}
        />
      )}
      {screen === 'dashboard' && (
        <DashboardPage authUser={authUser} onBack={handleSignOut} isDemo={isDemo} />
      )}

      {/* Demo video overlay — renders as portal over all screens */}
      {isDemo && <DemoOverlay />}
    </div>
  )
}
