import { useState, useEffect } from 'react'
import { Symptom } from './data/mockData'
import { SearchBar } from './components/SearchBar'
import { Results } from './components/Results'
import { MedicationChecker } from './components/MedicationChecker'
import { ChatBot } from './components/ChatBot'
import { Navbar } from './components/Navbar'
import { Login } from './components/Login'
import { Register } from './components/Register'
import { AuthProvider } from './contexts/AuthContext'
import { api } from './services/api'
import './styles.css'
import MedicalInterview from './components/SoapGenerator'

function AppContent() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'symptoms' | 'medications' | 'chat' | 'soap'>('symptoms')
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  const handleSelectSymptom = (symptom: Symptom) => {
    setSelectedSymptoms(prev => [...prev, symptom])
    setIsSubmitted(false)
    setError(null)
  }

  const handleRemoveSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev => prev.filter(s => s.id !== symptomId))
    setIsSubmitted(false)
    setError(null)
  }

  const handleSubmit = async () => {
    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const symptomIds = selectedSymptoms.map(s => s.id)
      const conditions = await api.checkConditions(symptomIds)
      setIsSubmitted(true)
    } catch (err) {
      setError('Failed to check conditions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthSuccess = () => {
    setShowLogin(false)
    setShowRegister(false)
  }

  return (
    <div className="app">
      <Navbar
        onLoginClick={() => setShowLogin(true)}
        onRegisterClick={() => setShowRegister(true)}
      />
      <div className="container">
        {showLogin ? (
          <Login
            onSuccess={handleAuthSuccess}
            onRegisterClick={() => {
              setShowLogin(false)
              setShowRegister(true)
            }}
          />
        ) : showRegister ? (
          <Register
            onSuccess={handleAuthSuccess}
            onLoginClick={() => {
              setShowRegister(false)
              setShowLogin(true)
            }}
          />
        ) : (
          <>
            <h1 className="title">Health Portal</h1>
            <div className="nav-tabs">
              <button
                className={`nav-tab ${activeTab === 'symptoms' ? 'active' : ''}`}
                onClick={() => setActiveTab('symptoms')}
              >
                Symptom Checker
              </button>
              <button
                className={`nav-tab ${activeTab === 'medications' ? 'active' : ''}`}
                onClick={() => setActiveTab('medications')}
              >
                Medication Checker
              </button>
              <button
                className={`nav-tab ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                Mental Health Chat
              </button>
              <button
                className={`nav-tab ${activeTab === 'soap' ? 'active' : ''}`}
                onClick={() => setActiveTab('soap')}
              >
                Medical Assessment
              </button>
            </div>
            {activeTab === 'symptoms' ? (
              <>
                <div className="search-container">
                  <div className="search-description">
                    Enter your symptoms to get a list of possible conditions. Select multiple symptoms to get more accurate results.
                  </div>
                  <SearchBar
                    onSelectSymptom={handleSelectSymptom}
                    selectedSymptoms={selectedSymptoms}
                    onSubmit={handleSubmit}
                    onRemoveSymptom={handleRemoveSymptom}
                    isLoading={isLoading}
                  />
                </div>
                {error && <div className="error-message">{error}</div>}
                <div className="results-container">
                  <Results
                    selectedSymptoms={selectedSymptoms}
                    onRemoveSymptom={handleRemoveSymptom}
                    isSubmitted={isSubmitted}
                    isLoading={isLoading}
                  />
                </div>
              </>
            ) : activeTab === 'medications' ? (
              <MedicationChecker isActive={activeTab === 'medications'} />
            ) : activeTab === 'chat' ? (
              <ChatBot />
            ) : (
              <MedicalInterview />
            )}
          </>
        )}
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
