import { useState, useEffect } from 'react';
import { Symptom, Condition } from '../data/mockData';
import { api } from '../services/api';

interface ResultsProps {
  selectedSymptoms: Symptom[];
  onRemoveSymptom: (symptomId: string) => void;
  isSubmitted: boolean;
  isLoading: boolean;
}

export const Results = ({ selectedSymptoms, onRemoveSymptom, isSubmitted, isLoading }: ResultsProps) => {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [expandedCondition, setExpandedCondition] = useState<string | null>(null);

  useEffect(() => {
    const fetchConditions = async () => {
      if (!isSubmitted || selectedSymptoms.length === 0) {
        setConditions([]);
        return;
      }

      try {
        const results = await api.checkConditions(selectedSymptoms.map(s => s.id));
        setConditions(results);
      } catch (error) {
        console.error('Error fetching conditions:', error);
      }
    };

    fetchConditions();
  }, [selectedSymptoms, isSubmitted]);

  const toggleCondition = (conditionId: string) => {
    setExpandedCondition(expandedCondition === conditionId ? null : conditionId);
  };

  if (!isSubmitted) {
    return null;
  }

  return (
    <div>
      <h2 className="results-title">Possible Conditions</h2>
      {isLoading ? (
        <div className="condition-card">Loading conditions...</div>
      ) : conditions.length > 0 ? (
        <div>
          {conditions.map((condition) => (
            <div
              key={condition.id}
              className={`condition-card ${expandedCondition === condition.id ? 'expanded' : ''}`}
              onClick={() => toggleCondition(condition.id)}
            >
              <div className="condition-header">
                <div className="condition-name">{condition.name}</div>
                <div className="expand-icon">{expandedCondition === condition.id ? '▼' : '▶'}</div>
              </div>
              <div className="condition-description">{condition.description}</div>
              {expandedCondition === condition.id && (
                <div className="condition-treatments">
                  <h3>Recommended Treatments:</h3>
                  <ul>
                    {condition.treatments.map((treatment, index) => (
                      <li key={index}>{treatment}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : selectedSymptoms.length > 0 ? (
        <div className="condition-card">No conditions found for the selected symptoms.</div>
      ) : (
        <div className="condition-card">Select symptoms to see possible conditions.</div>
      )}
    </div>
  );
}; 