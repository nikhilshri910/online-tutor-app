export default function FieldsSection({ fields, value, onChange }) {
  return (
    <div className="content-console-section">
      {fields.map((field) => (
        <label className="field-label" key={field.name}>
          {field.label}
          {field.type === "textarea" ? (
            <textarea value={value[field.name] || ""} onChange={(event) => onChange(field.name, event.target.value)} />
          ) : (
            <input type="text" value={value[field.name] || ""} onChange={(event) => onChange(field.name, event.target.value)} />
          )}
        </label>
      ))}
    </div>
  );
}

