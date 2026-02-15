import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ThemeDock from "./ThemeDock";
import { APP_META } from "../../../config/appMeta";
import companyLogo from "../../../../assets/company-logo-square.jpg";
import { useAuth } from "../../../context/AuthContext";
import { fetchHomeContent } from "../../site-content/contentService";

export default function AppHeader() {
  const { isAuthenticated, loading, user } = useAuth();
  const [brand, setBrand] = useState({
    title: APP_META.title,
    logoUrl: ""
  });

  useEffect(() => {
    let isMounted = true;

    async function loadBranding() {
      try {
        const content = await fetchHomeContent();
        if (!isMounted || !content?.appMeta) {
          return;
        }

        const nextTitle = content.appMeta.title || APP_META.title;
        const nextLogoUrl = content.appMeta.logoUrl || "";
        setBrand({ title: nextTitle, logoUrl: nextLogoUrl });
        document.title = nextTitle;
      } catch (_err) {
        // Keep fallback metadata when content API is unavailable.
      }
    }

    loadBranding();
    return () => {
      isMounted = false;
    };
  }, []);

  const authTarget = !isAuthenticated
    ? "/login"
    : user?.role === "super_admin"
      ? "/content-admin"
      : user?.role === "admin"
        ? "/admin"
        : "/dashboard";

  const authLabel = !isAuthenticated
    ? "Login"
    : user?.role === "super_admin"
      ? "Content Console"
      : user?.role === "admin"
        ? "Admin Console"
        : "Dashboard";

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link to="/" className="brand" aria-label={`${brand.title} home`}>
          <span className="brand-logo" aria-hidden="true">
            <img className="brand-logo-image" src={brand.logoUrl || companyLogo} alt="" />
          </span>
          <span className="brand-title">{brand.title}</span>
        </Link>
        <div className="app-header-actions">
          {isAuthenticated && user?.name ? (
            <span className="app-header-greeting">Welcome, {user.name}</span>
          ) : null}
          <ThemeDock />
          {!loading ? (
            <Link className="btn btn-primary app-header-auth-link" to={authTarget}>
              {authLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}


