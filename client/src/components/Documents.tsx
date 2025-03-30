import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../contexts/AuthContext";

interface Report {
  id: number;
  title: string;
  content: string;
  type: "soap" | "analysis";
  created_at: string;
}

export const Documents = () => {
  const [documents, setDocuments] = useState<Report[]>([]);
  const [selectedType, setSelectedType] = useState<"soap" | "analysis" | "all">(
    "all"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/reports", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      const data = await response.json();
      setDocuments(data.reports);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      setError("Failed to load documents. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDocuments =
    selectedType === "all"
      ? documents
      : documents.filter((doc) => doc.type === selectedType);

  const handlePrint = (content: string) => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Document</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1, h2 { color: #333; }
              hr { margin: 20px 0; }
            </style>
          </head>
          <body>
            ${content}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (isLoading) {
    return <div className="loading">Loading documents...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="documents-container">
      <div className="document-filters">
        <button
          className={`filter-btn ${selectedType === "all" ? "active" : ""}`}
          onClick={() => setSelectedType("all")}
        >
          All Documents
        </button>
        <button
          className={`filter-btn ${selectedType === "soap" ? "active" : ""}`}
          onClick={() => setSelectedType("soap")}
        >
          Medical Assessments
        </button>
        <button
          className={`filter-btn ${
            selectedType === "analysis" ? "active" : ""
          }`}
          onClick={() => setSelectedType("analysis")}
        >
          Document Analyses
        </button>
      </div>
      <div className="documents-list">
        {filteredDocuments.map((doc) => (
          <div key={doc.id} className="document-card">
            <div className="document-header">
              <h3>{doc.title}</h3>
              <span className="document-date">
                {new Date(doc.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="document-type">
              Type:{" "}
              {doc.type === "soap" ? "Medical Assessment" : "Document Analysis"}
            </div>
            <button
              className="print-btn"
              onClick={() => handlePrint(doc.content)}
            >
              Print
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
