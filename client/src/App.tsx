import { useState, useEffect } from 'react'
import { Symptom } from './data/mockData'
import { SearchBar } from './components/SearchBar'
import { Results } from './components/Results'
import { MedicationChecker } from './components/MedicationChecker'
import { api } from './services/api'
import './styles.css'

function App() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'symptoms' | 'medications'>('symptoms')

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

  return (
    <div className="app">
      <div className="container">
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
        ) : (
          <MedicationChecker isActive={activeTab === 'medications'} />
        )}
      </div>
    </div>
  )
}

export default App
