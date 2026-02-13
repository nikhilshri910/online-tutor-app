import { Link } from "react-router-dom";
import ThemeDock from "./ThemeDock";
import { APP_META } from "../../../config/appMeta";
import companyLogo from "../../../../assets/company-logo-square.jpg";
import { useAuth } from "../../../context/AuthContext";

export default function AppHeader() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link to="/" className="brand" aria-label={`${APP_META.title} home`}>
          <span className="brand-logo" aria-hidden="true">
            <img className="brand-logo-image" src={companyLogo} alt="" />
          </span>
          <span className="brand-title">{APP_META.title}</span>
        </Link>
        <div className="app-header-actions">
          <ThemeDock />
          {!loading ? (
            <Link className="btn btn-primary app-header-auth-link" to={isAuthenticated ? "/dashboard" : "/login"}>
              {isAuthenticated ? "Dashboard" : "Login"}
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}


