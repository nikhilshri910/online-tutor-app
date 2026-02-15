import { Navigate, Route, Routes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import HomeContentEditorPage from "./pages/HomeContentEditorPage";
import AppHeader from "./features/shared/components/AppHeader";
import AnimatedPage from "./features/shared/ui/AnimatedPage";

export default function App() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const role = user?.role;

  const defaultAuthenticatedPath = user?.mustChangePassword
    ? "/change-password"
    : role === "super_admin"
      ? "/content-admin"
      : role === "admin"
        ? "/admin"
        : "/dashboard";

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-content">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <AnimatedPage>
                  <HomePage />
                </AnimatedPage>
              }
            />

            <Route
              path="/login"
              element={
                <AnimatedPage>
                  <LoginPage />
                </AnimatedPage>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute roles={["student", "teacher"]}>
                  <AnimatedPage>
                    <DashboardPage />
                  </AnimatedPage>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AnimatedPage>
                    <AdminPage />
                  </AnimatedPage>
                </ProtectedRoute>
              }
            />

            <Route
              path="/content-admin"
              element={
                <ProtectedRoute roles={["super_admin"]}>
                  <AnimatedPage>
                    <HomeContentEditorPage />
                  </AnimatedPage>
                </ProtectedRoute>
              }
            />

            <Route
              path="/change-password"
              element={
                <ProtectedRoute allowPasswordChangeRequired>
                  <AnimatedPage>
                    <ChangePasswordPage />
                  </AnimatedPage>
                </ProtectedRoute>
              }
            />

            <Route
              path="*"
              element={
                <Navigate
                  to={
                    isAuthenticated
                      ? defaultAuthenticatedPath
                      : "/"
                  }
                  replace
                />
              }
            />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}
