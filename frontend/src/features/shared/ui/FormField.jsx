function FieldControl({ field, value, onChange }) {
  if (field.type === "textarea") {
    return (
      <textarea
        value={value || ""}
        onChange={(event) => onChange(field.name, event.target.value)}
        required={field.required}
        placeholder={field.placeholder}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        value={value ?? ""}
        onChange={(event) => onChange(field.name, event.target.value)}
        required={field.required}
      >
        {field.placeholderOption ? <option value="">{field.placeholderOption}</option> : null}
        {(field.options || []).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "checkbox") {
    return (
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(event) => onChange(field.name, event.target.checked)}
      />
    );
  }

  return (
    <input
      type={field.type || "text"}
      value={value || ""}
      onChange={(event) => onChange(field.name, event.target.value)}
      required={field.required}
      placeholder={field.placeholder}
    />
  );
}

export default function FormField({ field, value, onChange }) {
  if (field.type === "checkbox") {
    return (
      <label className="check-row">
        <FieldControl field={field} value={value} onChange={onChange} />
        {field.label}
      </label>
    );
  }

  return (
    <label className="field-label">
      {field.label}
      <FieldControl field={field} value={value} onChange={onChange} />
    </label>
  );
}
