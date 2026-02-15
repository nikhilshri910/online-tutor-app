import { Link } from "react-router-dom";
import { buttonClassName } from "../../shared/ui/Button";

export default function DashboardHeader({ user, onLogout }) {
  return (
    <header className="header">
      <div>
        <h1>Dashboard</h1>
      </div>
      <div className="header-actions">
        {user?.role === "admin" ? (
          <Link to="/admin" className={buttonClassName({ variant: "secondary" })}>
            Admin Console
          </Link>
        ) : null}
        {/* Logout available under settings menu */} 
      </div>
    </header>
  );
}
