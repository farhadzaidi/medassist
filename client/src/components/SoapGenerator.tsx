import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

type QuestionAnswer = [string, string];
interface InterviewState {
  currentQuestion: string;
  currentAnswer: string;
  interviewHistory: QuestionAnswer[];
  isComplete: boolean;
}

const TOTAL_QUESTIONS = 1;

const MedicalInterview: React.FC = () => {
  const [initialDescription, setInitialDescription] = useState("");
  const [interviewState, setInterviewState] = useState<InterviewState | null>(
    null
  );
  const [soapNotes, setSoapNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);

  const startInterview = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:5001/api/soap/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: initialDescription }),
      });

      if (!response.ok) {
        throw new Error("Failed to start interview");
      }

      const data = await response.json();
      setSessionId(data.session_id);
      setInterviewState({
        currentQuestion: data.question,
        currentAnswer: "",
        interviewHistory: [],
        isComplete: false,
      });
    } catch (err) {
      setError("Error starting interview. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!interviewState || !sessionId) return;

    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:5001/api/soap/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answer: interviewState.currentAnswer,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit answer");
      }

      const data = await response.json();

      // Update interview history
      const newHistory: QuestionAnswer[] = [
        ...interviewState.interviewHistory,
        [interviewState.currentQuestion, interviewState.currentAnswer],
      ];

      // Check if we should continue or generate SOAP notes
      if (newHistory.length >= TOTAL_QUESTIONS) {
        await generateSoapNotes(newHistory);
        setInterviewState({
          ...interviewState,
          interviewHistory: newHistory,
          isComplete: true,
        });
      } else {
        setInterviewState({
          currentQuestion: data.question,
          currentAnswer: "",
          interviewHistory: newHistory,
          isComplete: false,
        });
      }
    } catch (err) {
      setError("Error submitting answer. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSoapNotes = async (history: QuestionAnswer[]) => {
    try {
      const response = await fetch("http://localhost:5001/api/soap/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ interview_history: history }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate SOAP notes");
      }

      const data = await response.json();
      setSoapNotes(data.soap_notes);
    } catch (err) {
      setError("Error generating SOAP notes. Please try again.");
      console.error(err);
    }
  };

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Convert markdown to HTML
    const htmlContent = soapNotes
      .replace(/#{1,6}\s+(.+)/g, "<h1>$1</h1>") // Headers
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") // Bold
      .replace(/\n- /g, "<br>- ") // List items
      .replace(/\n/g, "<br>"); // Line breaks

    // Add the content to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Medical Assessment</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px;
            }
            h1 {
              color: #1a1a1a;
              font-size: 24px;
              margin-top: 1.5em;
              margin-bottom: 0.5em;
              font-weight: 600;
            }
            h2 {
              color: #1a1a1a;
              font-size: 20px;
              margin-top: 1.5em;
              margin-bottom: 0.5em;
              font-weight: 600;
            }
            p {
              margin: 0.5em 0;
            }
            ul {
              margin: 0.5em 0;
              padding-left: 1.5em;
            }
            li {
              margin: 0.25em 0;
            }
            strong {
              color: #1a1a1a;
              font-weight: 600;
            }
            br {
              content: "";
              display: block;
              margin: 0.5em 0;
            }
            @media print {
              body { 
                padding: 20px;
                font-size: 12pt;
              }
              @page { 
                margin: 1cm;
              }
              h1 { font-size: 18pt; }
              h2 { font-size: 14pt; }
              br {
                content: "";
                display: block;
                margin: 0.25em 0;
              }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `);

    // Wait for content to load then print
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const handleReset = () => {
    setInitialDescription("");
    setInterviewState(null);
    setSoapNotes("");
    setError("");
    setSessionId(null);
  };

  return (
    <div className="medical-interview">
      <div className="component-description print-hide">
        <h2>Medical Assessment Assistant</h2>
        <p>
          Get a comprehensive medical assessment through an interactive
          interview. Our AI-powered assistant will guide you through a series of
          questions to gather important information about your health concerns.
        </p>
      </div>

      {!interviewState ? (
        <div className="interview-input-container print-hide">
          <textarea
            value={initialDescription}
            onChange={(e) => setInitialDescription(e.target.value)}
            placeholder="Please describe your main health concerns or symptoms to begin the assessment."
            rows={4}
            className="interview-textarea"
          />
          <div className="button-container">
            <button
              onClick={startInterview}
              disabled={!initialDescription || isLoading}
              className="start-button"
            >
              {isLoading ? "Starting..." : "Begin Assessment"}
            </button>
          </div>
        </div>
      ) : !interviewState.isComplete ? (
        <div className="interview-container print-hide">
          <div className="question-box">
            <div className="question-header">
              <h3>
                Question {interviewState.interviewHistory.length + 1} of{" "}
                {TOTAL_QUESTIONS}
              </h3>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${
                      ((interviewState.interviewHistory.length + 1) /
                        TOTAL_QUESTIONS) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
            <p>{interviewState.currentQuestion}</p>
          </div>
          <div className="answer-box">
            <textarea
              value={interviewState.currentAnswer}
              onChange={(e) =>
                setInterviewState({
                  ...interviewState,
                  currentAnswer: e.target.value,
                })
              }
              placeholder="Please provide your answer..."
              rows={4}
              className="interview-textarea"
            />
            <div className="button-container">
              <button
                onClick={submitAnswer}
                disabled={!interviewState.currentAnswer || isLoading}
                className="submit-button"
              >
                {isLoading ? "Submitting..." : "Submit Answer"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="assessment-output">
          <div className="interview-history print-hide">
            <h3>Assessment Summary</h3>
            {interviewState.interviewHistory.map(
              ([question, answer], index) => (
                <div key={index} className="qa-pair">
                  <p>
                    <strong>Q: </strong>
                    {question}
                  </p>
                  <p>
                    <strong>A: </strong>
                    {answer}
                  </p>
                </div>
              )
            )}
          </div>
          <div className="assessment-content">
            <ReactMarkdown>{soapNotes}</ReactMarkdown>
          </div>
          <div className="button-container print-hide">
            <button onClick={handlePrint} className="print-button">
              Print Assessment
            </button>
            <button onClick={handleReset} className="reset-button">
              Take Another Assessment
            </button>
          </div>
        </div>
      )}

      {error && <div className="error-message print-hide">{error}</div>}
    </div>
  );
};

export default MedicalInterview;
