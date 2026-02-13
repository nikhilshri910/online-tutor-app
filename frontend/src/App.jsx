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
import AppHeader from "./features/shared/components/AppHeader";
import AnimatedPage from "./features/shared/ui/AnimatedPage";

export default function App() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

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
                <ProtectedRoute>
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
              element={<Navigate to={isAuthenticated ? (user?.mustChangePassword ? "/change-password" : "/dashboard") : "/"} replace />}
            />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}
