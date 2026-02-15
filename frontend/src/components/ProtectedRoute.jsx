import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles, allowPasswordChangeRequired = false }) {
  const { loading, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p style={{ padding: "1rem" }}>Loading...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowPasswordChangeRequired && user?.mustChangePassword) {
    return <Navigate to="/change-password" replace state={{ from: location }} />;
  }

  if (roles && roles.length && !roles.includes(user.role)) {
    const fallbackPath =
      user?.role === "super_admin"
        ? "/content-admin"
        : user?.role === "admin"
          ? "/admin"
          : "/dashboard";
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}
