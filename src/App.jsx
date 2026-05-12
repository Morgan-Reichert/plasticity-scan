import { useState } from 'react'
import LandingPage from './components/LandingPage'
import SurveyPage from './components/SurveyPage'
import ResultsPage from './components/ResultsPage'
import IntervenantLogin from './components/IntervenantLogin'
import DashboardPage from './components/DashboardPage'

export default function App() {
  const [screen, setScreen] = useState('landing')
  const [userData, setUserData] = useState(null)
  const [responses, setResponses] = useState({})

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

  return (
    <div className="min-h-screen bg-navy">
      {screen === 'landing' && (
        <LandingPage
          onStart={handleStart}
          onIntervenantAccess={() => setScreen('intervenant-login')}
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
      {screen === 'intervenant-login' && (
        <IntervenantLogin
          onSuccess={() => setScreen('dashboard')}
          onBack={() => setScreen('landing')}
        />
      )}
      {screen === 'dashboard' && (
        <DashboardPage onBack={() => setScreen('landing')} />
      )}
    </div>
  )
}
