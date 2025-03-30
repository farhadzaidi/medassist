import { useAuth } from "../contexts/AuthContext";

interface NavbarProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export const Navbar = ({ onLoginClick, onRegisterClick }: NavbarProps) => {
  const { user, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return <div className="navbar">Loading...</div>;
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">MedAssist</div>
      <div className="navbar-auth">
        {user ? (
          <div className="navbar-user">
            <span className="user-name">Hi, {user.name}!</span>
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
