import { Link } from "react-router-dom";
import Button, { buttonClassName } from "../../shared/ui/Button";

export default function DashboardHeader({ user, onLogout }) {
  return (
    <header className="header">
      <div>
        <h1>Dashboard</h1>
        <p>
          Welcome, {user?.name} ({user?.role})
        </p>
      </div>
      <div className="header-actions">
        {user?.role === "admin" ? (
          <Link to="/admin" className={buttonClassName({ variant: "secondary" })}>
            Admin Console
          </Link>
        ) : null}
        <Button onClick={onLogout}>Logout</Button>
      </div>
    </header>
  );
}
