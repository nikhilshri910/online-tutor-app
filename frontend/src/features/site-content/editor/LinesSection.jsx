import { linesValue, parseLines } from "./editorUtils";

export default function LinesSection({ labels, values, onChange }) {
  return (
    <div className="content-console-section">
      {labels.map((label, index) => (
        <label className="field-label" key={label}>
          {label}
          <textarea
            value={linesValue(values[index])}
            onChange={(event) => onChange(index, parseLines(event.target.value))}
          />
        </label>
      ))}
    </div>
  );
}

