import { useState } from "react";
import { MedicationChecker } from "./components/MedicationChecker";
import { Navbar } from "./components/Navbar";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { AuthProvider } from "./contexts/AuthContext";
import { DocumentAnalyzer } from "./components/DocumentAnalyzer";
import { Documents } from "./components/Documents";
import "./styles.css";
import MedicalInterview from "./components/SoapGenerator";

type AuthView = "login" | "register" | null;
type MainView = "soap" | "documents" | "medications" | "saved-documents" | null;

function AppContent() {
  const [activeTab, setActiveTab] = useState<MainView>(null);
  const [authView, setAuthView] = useState<AuthView>(null);
  const [showDescription, setShowDescription] = useState(true);

  const handleAuthSuccess = () => {
    setAuthView(null);
  };

  const handleTabSelect = (
    tab: "soap" | "documents" | "medications" | "saved-documents"
  ) => {
    setActiveTab(tab);
    setShowDescription(false);
  };

  const handleTitleClick = () => {
    setActiveTab(null);
    setShowDescription(true);
  };

  const handleLogoClick = () => {
    setActiveTab(null);
    setShowDescription(true);
    setAuthView(null);
  };

  return (
    <div className="app">
      <Navbar
        onLoginClick={() => setAuthView("login")}
        onRegisterClick={() => setAuthView("register")}
        onLogoClick={handleLogoClick}
        onDocumentsClick={() => handleTabSelect("saved-documents")}
      />
      <div className="container">
        {authView === "login" ? (
          <Login
            onSuccess={handleAuthSuccess}
            onRegisterClick={() => setAuthView("register")}
          />
        ) : authView === "register" ? (
          <Register
            onSuccess={handleAuthSuccess}
            onLoginClick={() => setAuthView("login")}
          />
        ) : (
          <>
            {activeTab !== "saved-documents" && (
              <>
                <h1
                  className="title"
                  onClick={handleTitleClick}
                  style={{ cursor: "pointer" }}
                >
                  MedAssist
                </h1>
                {showDescription && (
                  <div className="app-description">
                    <p>
                      Welcome to MedAssist! This application provides three
                      powerful tools to assist with medical documentation and
                      analysis:
                    </p>
                    <ul>
                      <li>
                        <strong>Medical Assessment:</strong> Generate
                        comprehensive SOAP notes from patient interviews
                      </li>
                      <li>
                        <strong>Document Analyzer:</strong> Upload and analyze
                        medical documents with multilingual support
                      </li>
                      <li>
                        <strong>Medication Checker:</strong> Check medication
                        interactions and get detailed information about drugs
                      </li>
                    </ul>
                    <p>Select a tool from the tabs below to get started.</p>
                  </div>
                )}
                <div className="nav-tabs">
                  <button
                    className={`nav-tab ${
                      activeTab === "soap" ? "active" : ""
                    }`}
                    onClick={() => handleTabSelect("soap")}
                  >
                    Medical Assessment
                  </button>
                  <button
                    className={`nav-tab ${
                      activeTab === "documents" ? "active" : ""
                    }`}
                    onClick={() => handleTabSelect("documents")}
                  >
                    Document Analyzer
                  </button>
                  <button
                    className={`nav-tab ${
                      activeTab === "medications" ? "active" : ""
                    }`}
                    onClick={() => handleTabSelect("medications")}
                  >
                    Medication Checker
                  </button>
                </div>
              </>
            )}
            {activeTab === "soap" ? (
              <MedicalInterview />
            ) : activeTab === "documents" ? (
              <DocumentAnalyzer />
            ) : activeTab === "medications" ? (
              <MedicationChecker isActive={true} />
            ) : activeTab === "saved-documents" ? (
              <Documents />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
