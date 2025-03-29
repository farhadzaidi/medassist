import { useState, useEffect, useRef } from 'react';
import { Symptom } from '../data/mockData';
import { api } from '../services/api';

interface SearchBarProps {
  onSelectSymptom: (symptom: Symptom) => void;
  selectedSymptoms: Symptom[];
  onSubmit: () => void;
  onRemoveSymptom: (symptomId: string) => void;
  isLoading: boolean;
}

export const SearchBar = ({ onSelectSymptom, selectedSymptoms, onSubmit, onRemoveSymptom, isLoading }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Symptom[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const allSymptoms = await api.getSymptoms();
        const filteredSymptoms = allSymptoms.filter(symptom =>
          symptom.name.toLowerCase().includes(query.toLowerCase()) &&
          !selectedSymptoms.some(selected => selected.id === symptom.id)
        );
        setSuggestions(filteredSymptoms);
        setIsOpen(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, selectedSymptoms]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && query === '' && selectedSymptoms.length > 0) {
      onRemoveSymptom(selectedSymptoms[selectedSymptoms.length - 1].id);
    }
  };

  return (
    <div ref={searchRef}>
      <div className="search-wrapper">
        <div
          className="search-input-container"
          onClick={() => inputRef.current?.focus()}
        >
          <div className="selected-symptoms">
            {selectedSymptoms.map((symptom) => (
              <span
                key={symptom.id}
                className="symptom-tag"
              >
                {symptom.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSymptom(symptom.id);
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
            onKeyDown={handleKeyDown}
            placeholder={selectedSymptoms.length === 0 ? "Search for symptoms..." : ""}
            className="search-input"
            disabled={isLoading}
          />
        </div>
        {isOpen && (isLoadingSuggestions ? (
          <div className="suggestions-dropdown">
            <div className="suggestion-item loading">Loading suggestions...</div>
          </div>
        ) : suggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {suggestions.map((symptom) => (
              <div
                key={symptom.id}
                className="suggestion-item"
                onClick={() => {
                  onSelectSymptom(symptom);
                  setQuery('');
                  setSuggestions([]);
                  setIsOpen(false);
                }}
              >
                <div className="suggestion-name">{symptom.name}</div>
                <div className="suggestion-description">{symptom.description}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <button
        onClick={onSubmit}
        disabled={selectedSymptoms.length === 0 || isLoading}
        className="submit-button"
      >
        {isLoading ? 'Checking...' : 'Check Symptoms'}
      </button>
    </div>
  );
}; 