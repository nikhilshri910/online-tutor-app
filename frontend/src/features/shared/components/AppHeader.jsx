import { Link } from "react-router-dom";
import ThemeDock from "./ThemeDock";
import { APP_META } from "../../../config/appMeta";

export default function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link to="/dashboard" className="brand" aria-label={`${APP_META.title} home`}>
          <span className="brand-logo">{APP_META.logoText}</span>
          <span className="brand-title">{APP_META.title}</span>
        </Link>
        <ThemeDock />
      </div>
    </header>
  );
}


