import { useState, useEffect, useRef } from 'react';
import { Medication, Interaction } from '../data/mockData';
import { api } from '../services/api';

interface MedicationCheckerProps {
  isActive: boolean;
}

export const MedicationChecker = ({ isActive }: MedicationCheckerProps) => {
  const [selectedMedications, setSelectedMedications] = useState<Medication[]>([]);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Medication[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [allMedications, setAllMedications] = useState<Medication[]>([]);
  const [isLoadingMedications, setIsLoadingMedications] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all medications once when component becomes active
  useEffect(() => {
    const fetchMedications = async () => {
      if (!isActive || allMedications.length > 0) return;

      setIsLoadingMedications(true);
      try {
        const data = await api.getMedications();
        setAllMedications(data);
      } catch (err) {
        console.error('Error fetching medications:', err);
        setError('Failed to fetch medications. Please try again.');
      } finally {
        setIsLoadingMedications(false);
      }
    };

    fetchMedications();
  }, [isActive, allMedications.length]);

  // Filter medications based on search query
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const filteredMedications = allMedications.filter(medication =>
      medication.name.toLowerCase().includes(query.toLowerCase()) &&
      !selectedMedications.some(selected => selected.id === medication.id)
    );
    setSuggestions(filteredMedications);
    setIsOpen(true);
  }, [query, selectedMedications, allMedications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectMedication = (medication: Medication) => {
    setSelectedMedications(prev => [...prev, medication]);
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setIsSubmitted(false);
    setError(null);
  };

  const handleRemoveMedication = (medicationId: string) => {
    setSelectedMedications(prev => prev.filter(m => m.id !== medicationId));
    setIsSubmitted(false);
    setError(null);
  };

  const handleSubmit = async () => {
    if (selectedMedications.length === 0) {
      setError('Please select at least one medication');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const results = await api.checkInteractions(selectedMedications.map(m => m.id));
      setInteractions(results);
      setIsSubmitted(true);
    } catch (err) {
      setError('Failed to check interactions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isActive) {
    return null;
  }

  return (
    <div>
      <div className="search-container">
        <div className="search-description">
          Enter your medications to check for potential interactions and side effects. Select multiple medications to see how they might interact with each other.
        </div>
        <div className="search-wrapper" ref={searchRef}>
          <div
            className="search-input-container"
            onClick={() => inputRef.current?.focus()}
          >
            <div className="selected-symptoms">
              {selectedMedications.map((medication) => (
                <span
                  key={medication.id}
                  className="symptom-tag"
                >
                  {medication.name}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveMedication(medication.id);
                    }}
                    className="remove-symptom"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsOpen(true)}
              placeholder={selectedMedications.length === 0 ? "Search for medications..." : ""}
              className="search-input"
              disabled={isLoading || isLoadingMedications}
            />
          </div>
          {isOpen && (isLoadingMedications ? (
            <div className="suggestions-dropdown">
              <div className="suggestion-item loading">Loading medications...</div>
            </div>
          ) : suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((medication) => (
                <div
                  key={medication.id}
                  className="suggestion-item"
                  onClick={() => handleSelectMedication(medication)}
                >
                  <div className="suggestion-name">{medication.name}</div>
                  <div className="suggestion-description">{medication.description}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <button
          onClick={handleSubmit}
          disabled={selectedMedications.length === 0 || isLoading}
          className="submit-button"
        >
          {isLoading ? 'Checking...' : 'Check Interactions'}
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
      {isSubmitted && (
        <div className="results-container">
          <h2 className="results-title">Interaction Results</h2>
          {interactions.length > 0 ? (
            <div>
              {interactions.map((interaction, index) => (
                <div
                  key={index}
                  className={`condition-card ${interaction.severity}`}
                >
                  <div className="interaction-severity">
                    Severity: {interaction.severity.charAt(0).toUpperCase() + interaction.severity.slice(1)}
                  </div>
                  <div className="interaction-medications">
                    <strong>Medications:</strong> {
                      allMedications.find(m => m.id === interaction.medication1)?.name
                    } + {
                      allMedications.find(m => m.id === interaction.medication2)?.name
                    }
                  </div>
                  <div className="interaction-description">{interaction.description}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="condition-card">No interactions found between the selected medications.</div>
          )}
        </div>
      )}
    </div>
  );
}; 