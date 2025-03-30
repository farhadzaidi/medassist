import { useAuth } from "../contexts/AuthContext";

interface NavbarProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onLogoClick: () => void;
  onDocumentsClick: () => void;
}

export const Navbar = ({
  onLoginClick,
  onRegisterClick,
  onLogoClick,
  onDocumentsClick,
}: NavbarProps) => {
  const { user, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return <div className="navbar">Loading...</div>;
  }

  return (
    <nav className="navbar">
      <div
        className="navbar-brand"
        onClick={onLogoClick}
        style={{ cursor: "pointer" }}
      >
        MedAssist
      </div>
      <div className="navbar-auth">
        {user ? (
          <div className="navbar-user">
            <button onClick={onDocumentsClick} className="auth-button">
              Documents
            </button>
            <button onClick={handleLogout} className="auth-button">
              Logout
            </button>
          </div>
        ) : (
          <div className="navbar-buttons">
            <button onClick={onLoginClick} className="auth-button">
              Login
            </button>
            <button onClick={onRegisterClick} className="auth-button">
              Register
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
