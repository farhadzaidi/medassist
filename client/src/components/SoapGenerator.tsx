import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

const SoapGenerator: React.FC = () => {
  const [description, setDescription] = useState('');
  const [soapNotes, setSoapNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const soapContentRef = useRef<HTMLDivElement>(null);

  const generateSoapNotes = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5001/api/soap/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate SOAP notes');
      }

      const data = await response.json();
      setSoapNotes(data.soap_notes);
    } catch (err) {
      setError('Error generating SOAP notes. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="soap-generator">
      <div className="component-description print-hide">
        <h2>SOAP Notes Generator</h2>
        <p>
          Generate professional SOAP (Subjective, Objective, Assessment, Plan) notes based on your symptoms
          and health concerns. SOAP notes are a standardized format used by healthcare providers to document
          patient encounters.
        </p>
      </div>

      <div className="soap-input-container print-hide">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Please describe your symptoms and health concerns in detail. Include information such as:
• When did the symptoms start?
• How severe are they?
• What makes them better or worse?
• Any relevant medical history?
• Any medications you're currently taking?"
          rows={8}
          className="soap-textarea"
        />
        <div className="button-container">
          <button
            onClick={generateSoapNotes}
            disabled={!description || isLoading}
            className="generate-button"
          >
            {isLoading ? 'Generating...' : 'Generate SOAP Notes'}
          </button>
        </div>
      </div>

      {error && <div className="error-message print-hide">{error}</div>}

      {soapNotes && (
        <div className="soap-output">
          <div className="soap-content" ref={soapContentRef}>
            <ReactMarkdown>{soapNotes}</ReactMarkdown>
          </div>
          <div className="button-container print-hide">
            <button
              onClick={handlePrint}
              className="action-button"
            >
              Print
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoapGenerator; 