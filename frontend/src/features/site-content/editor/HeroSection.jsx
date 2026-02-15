import Button from "../../shared/ui/Button";
import { getArray } from "./editorUtils";

export default function HeroSection({ value, onChange }) {
  const stats = getArray(value.stats);

  function updateStat(index, key, fieldValue) {
    const next = [...stats];
    next[index] = { ...(next[index] || {}), [key]: fieldValue };
    onChange("stats", next);
  }

  return (
    <div className="content-console-section">
      <label className="field-label">
        Kicker
        <input type="text" value={value.kicker || ""} onChange={(event) => onChange("kicker", event.target.value)} />
      </label>
      <label className="field-label">
        Hero Title
        <input type="text" value={value.title || ""} onChange={(event) => onChange("title", event.target.value)} />
      </label>
      <label className="field-label">
        Hero Subtitle
        <textarea value={value.subtitle || ""} onChange={(event) => onChange("subtitle", event.target.value)} />
      </label>

      <div className="content-console-list">
        <div className="content-console-list-header">
          <h3>Hero Stats</h3>
          <Button type="button" variant="secondary" onClick={() => onChange("stats", [...stats, { value: "", label: "" }])}>
            Add Stat
          </Button>
        </div>
        {stats.map((item, index) => (
          <div className="content-console-item-card" key={`hero-stat-${index}`}>
            <label className="field-label">
              Value
              <input type="text" value={item.value || ""} onChange={(event) => updateStat(index, "value", event.target.value)} />
            </label>
            <label className="field-label">
              Label
              <input type="text" value={item.label || ""} onChange={(event) => updateStat(index, "label", event.target.value)} />
            </label>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                const next = [...stats];
                next.splice(index, 1);
                onChange("stats", next);
              }}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

