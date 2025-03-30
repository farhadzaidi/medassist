import { useState, useRef } from "react";
import "../styles.css";
import { api } from "../services/api";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../contexts/AuthContext";

interface Document {
  file: File;
  name: string;
  analysis?: string;
  error?: string;
}

export function DocumentAnalyzer() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const { user } = useAuth();

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },
    { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newDocuments: Document[] = Array.from(files).map((file) => ({
      file,
      name: file.name,
    }));

    setDocuments((prev) => [...prev, ...newDocuments]);
    setError(null);
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
    // Reset the file input value to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleProcessDocuments = async () => {
    if (documents.length === 0) {
      setError("Please upload at least one document");
      return;
    }

    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    documents.forEach((doc) => {
      formData.append("files", doc.file);
    });
    formData.append("language", selectedLanguage);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/documents/process`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to process documents");
      }

      const data = await response.json();

      setDocuments((prev) =>
        prev.map((doc) => ({
          ...doc,
          analysis: data.analyses[doc.name] || "Analysis failed",
          error: data.errors[doc.name],
        }))
      );
    } catch (err) {
      setError("Failed to process documents. Please try again.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = (documentName: string) => {
    const doc = documents.find((d) => d.name === documentName);
    if (doc?.analysis) {
      // Create a new window for printing
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      // Convert markdown to HTML
      const htmlContent = doc.analysis
        .replace(/#{1,6}\s+(.+)/g, "<h1>$1</h1>") // Headers
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") // Bold
        .replace(/\n- /g, "<br>- ") // List items
        .replace(/\n/g, "<br>"); // Line breaks

      // Add the content to the new window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${doc.name}</title>
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
            <h1>${doc.name}</h1>
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
    }
  };

  const handleSave = async (name: string, analysis: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/reports/save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            type: "analysis",
            title: name,
            content: analysis,
          }),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to save analysis");
      }

      // Show success message
      alert("Analysis saved successfully!");
    } catch (error) {
      console.error("Error saving analysis:", error);
      alert("Failed to save analysis. Please try again.");
    }
  };

  return (
    <div className="document-analyzer">
      <div className="component-description">
        <h2>Medical Document Analyzer</h2>
        <p>
          Upload your medical documents (PDF, PNG, JPG) for analysis. Our AI
          will extract key information and provide suggested actions.
        </p>
      </div>

      <div className="upload-section">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".pdf,.png,.jpg,.jpeg"
          multiple
          className="file-input"
          disabled={isProcessing}
        />
        <div className="button-container">
          <button
            className="upload-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            Upload Documents
          </button>
          <button
            className="process-button"
            onClick={handleProcessDocuments}
            disabled={isProcessing || documents.length === 0}
          >
            {isProcessing ? "Processing..." : "Process Documents"}
          </button>
        </div>
        <div className="language-selector">
          <label htmlFor="language-select">Output Language:</label>
          <select
            id="language-select"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="language-select"
            disabled={isProcessing}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {documents.length > 0 && (
        <div className="documents-list">
          <h3>Uploaded Documents</h3>
          {documents.map((doc, index) => (
            <div key={index} className="document-item">
              <span className="document-name">{doc.name}</span>
              <button
                className="remove-button"
                onClick={() => handleRemoveDocument(index)}
                disabled={isProcessing}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {documents.some((doc) => doc.analysis) && (
        <div className="analysis-results">
          {documents.map(
            (doc, index) =>
              doc.analysis && (
                <div key={index} className="analysis-card">
                  <h3>{doc.name}</h3>
                  <div className="analysis-content">
                    <ReactMarkdown>{doc.analysis}</ReactMarkdown>
                  </div>
                  <div className="analysis-actions">
                    <button
                      onClick={() => handlePrint(doc.name)}
                      className="action-button"
                    >
                      Print Analysis
                    </button>
                    {user && (
                      <button
                        onClick={() =>
                          doc.analysis && handleSave(doc.name, doc.analysis)
                        }
                        className="action-button"
                      >
                        Save Analysis
                      </button>
                    )}
                  </div>
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
}
