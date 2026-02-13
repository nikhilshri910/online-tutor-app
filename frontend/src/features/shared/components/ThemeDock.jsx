import { useEffect, useRef, useState } from "react";
import { useTheme } from "../theme/ThemeContext";

export default function ThemeDock() {
  const { themeId, mode, themes, setThemeId, toggleMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeSubmenuOpen, setThemeSubmenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
        setThemeSubmenuOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setThemeSubmenuOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  function setMode(nextMode) {
    if (nextMode !== mode) {
      toggleMode();
    }
  }

  return (
    <div className="settings-menu" ref={menuRef}>
      <button
        type="button"
        className="settings-trigger"
        onClick={() => {
          setMenuOpen((prev) => !prev);
          setThemeSubmenuOpen(false);
        }}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-label="Open settings menu"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19.14 12.94a7.9 7.9 0 0 0 .05-.94a7.9 7.9 0 0 0-.05-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.2 7.2 0 0 0-1.63-.94l-.36-2.54a.5.5 0 0 0-.49-.42h-3.84a.5.5 0 0 0-.49.42l-.36 2.54a7.2 7.2 0 0 0-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.84a.5.5 0 0 0 .12.64l2.03 1.58a7.9 7.9 0 0 0-.05.94c0 .32.02.63.05.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96c.5.39 1.04.7 1.63.94l.36 2.54c.04.24.25.42.49.42h3.84c.24 0 .45-.18.49-.42l.36-2.54c.59-.24 1.13-.55 1.63-.94l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z" />
        </svg>
      </button>

      {menuOpen ? (
        <div className="settings-panel" role="menu" aria-label="Settings">
          <button
            type="button"
            className="settings-item"
            onClick={() => setThemeSubmenuOpen((prev) => !prev)}
            aria-expanded={themeSubmenuOpen}
          >
            <span>Theme</span>
            <span aria-hidden="true">{themeSubmenuOpen ? "▾" : "▸"}</span>
          </button>

          {themeSubmenuOpen ? (
            <div className="settings-submenu">
              <div className="settings-mode-row">
                <button
                  type="button"
                  className={`settings-pill ${mode === "light" ? "is-active" : ""}`}
                  onClick={() => setMode("light")}
                >
                  Light
                </button>
                <button
                  type="button"
                  className={`settings-pill ${mode === "dark" ? "is-active" : ""}`}
                  onClick={() => setMode("dark")}
                >
                  Dark
                </button>
              </div>

              <div className="settings-theme-grid">
                {themes.map((theme) => (
                  <button
                    type="button"
                    key={theme.id}
                    className={`settings-theme-chip ${themeId === theme.id ? "is-active" : ""}`}
                    onClick={() => setThemeId(theme.id)}
                  >
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
