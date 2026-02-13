import { useTheme } from "../theme/ThemeContext";
import Button from "../ui/Button";

export default function ThemeDock() {
  const { themeId, mode, themes, setThemeId, toggleMode } = useTheme();

  return (
    <div className="theme-controls">
      <label className="theme-inline-label" aria-label="Select theme">
        <span className="visually-hidden">Theme</span>
        <select value={themeId} onChange={(event) => setThemeId(event.target.value)}>
          {themes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.label}
            </option>
          ))}
        </select>
      </label>
      <Button type="button" variant="secondary" onClick={toggleMode}>
        {mode === "light" ? "Dark" : "Light"}
      </Button>
    </div>
  );
}
