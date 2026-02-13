import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_MODE,
  DEFAULT_THEME,
  MODE_STORAGE_KEY,
  THEME_OPTIONS,
  THEME_STORAGE_KEY
} from "./themeConfig";

const ThemeContext = createContext(null);

function getStoredValue(key, fallback) {
  if (typeof window === "undefined") {
    return fallback;
  }

  return window.localStorage.getItem(key) || fallback;
}

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => getStoredValue(THEME_STORAGE_KEY, DEFAULT_THEME));
  const [mode, setMode] = useState(() => getStoredValue(MODE_STORAGE_KEY, DEFAULT_MODE));

  useEffect(() => {
    document.documentElement.dataset.theme = themeId;
    window.localStorage.setItem(THEME_STORAGE_KEY, themeId);
  }, [themeId]);

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
    window.localStorage.setItem(MODE_STORAGE_KEY, mode);
  }, [mode]);

  const value = useMemo(
    () => ({
      themeId,
      mode,
      themes: THEME_OPTIONS,
      setThemeId,
      toggleMode: () => setMode((prev) => (prev === "light" ? "dark" : "light"))
    }),
    [themeId, mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
