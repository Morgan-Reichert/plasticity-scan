import { useState, useEffect } from 'react'
import LandingPage from './components/LandingPage'
import SurveyPage from './components/SurveyPage'
import ResultsPage from './components/ResultsPage'
import ConnectionPage from './components/ConnectionPage'
import DashboardPage from './components/DashboardPage'
import ComputingScreen from './components/ComputingScreen'

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
     Sequence: landing (5s) → computing (3s) → results (auto-scroll)
     No survey in demo — keeps it bulletproof for pitch recording ── */
  useEffect(() => {
    if (!window.location.search.includes('demo')) return
    setIsDemo(true)

    // Pre-load data immediately so ResultsPage is ready
    setUserData(DEMO_USER)
    setResponses(DEMO_RESPONSES)

    // t=5s: go to computing screen
    const t1 = setTimeout(() => setScreen('computing'), 5000)

    // ComputingScreen's own onComplete (~2.8s later) will call
    // handleComputingDone → setScreen('results') automatically

    return () => clearTimeout(t1)
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
        <DashboardPage authUser={authUser} onBack={handleSignOut} />
      )}
    </div>
  )
}
