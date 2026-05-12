import { useState } from 'react'
import LandingPage from './components/LandingPage'
import SurveyPage from './components/SurveyPage'
import ResultsPage from './components/ResultsPage'
import ConnectionPage from './components/ConnectionPage'
import DashboardPage from './components/DashboardPage'

export default function App() {
  const [screen, setScreen] = useState('landing')
  const [userData, setUserData] = useState(null)
  const [responses, setResponses] = useState({})
  const [authUser, setAuthUser] = useState(null) // { role, email, companyId, companyName, emailDomain }

  const handleStart = (data) => {
    setUserData(data)
    setScreen('survey')
  }

  const handleComplete = (surveyResponses) => {
    setResponses(surveyResponses)
    setScreen('results')
  }

  const handleRestart = () => {
    setUserData(null)
    setResponses({})
    setScreen('landing')
  }

  const handleIntervenantSuccess = () => {
    setAuthUser({ role: 'intervenant' })
    setScreen('dashboard')
  }

  const handleDirigeantSuccess = (info) => {
    setAuthUser(info)
    setScreen('dashboard')
  }

  const handleSignOut = () => {
    setAuthUser(null)
    setScreen('landing')
  }

  return (
    <div className="min-h-screen bg-navy">
      {screen === 'landing' && (
        <LandingPage
          onStart={handleStart}
          onIntervenantAccess={() => setScreen('connection')}
        />
      )}
      {screen === 'survey' && (
        <SurveyPage userData={userData} onComplete={handleComplete} />
      )}
      {screen === 'results' && (
        <ResultsPage
          userData={userData}
          responses={responses}
          onRestart={handleRestart}
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
        <DashboardPage
          authUser={authUser}
          onBack={handleSignOut}
        />
      )}
    </div>
  )
}
