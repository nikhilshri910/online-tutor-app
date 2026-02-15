import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { API_ENDPOINTS } from "../api/api-constant";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    try {
      const response = await api.get(API_ENDPOINTS.auth.profile);
      setUser(response.data.user);
    } catch (_err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const login = useCallback(async (email, password) => {
    const response = await api.post(API_ENDPOINTS.auth.login, { email, password });
    setUser(response.data.user);
    return response.data.user;
  }, []);

  const logout = useCallback(async () => {
    await api.post(API_ENDPOINTS.auth.logout);
    setUser(null);
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    const payload = { newPassword };
    if (currentPassword) {
      payload.currentPassword = currentPassword;
    }

    const response = await api.post(API_ENDPOINTS.auth.changePassword, payload);
    setUser(response.data.user);
    return response.data.user;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      changePassword,
      logout,
      refreshMe
    }),
    [user, loading, login, changePassword, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
