import Button from "../../shared/ui/Button";
import { getArray } from "./editorUtils";

export default function ObjectListSection({ title, items, fields, onChange, createItem }) {
  const list = getArray(items);

  function updateItem(index, fieldName, value) {
    const next = [...list];
    next[index] = { ...(next[index] || {}), [fieldName]: value };
    onChange(next);
  }

  return (
    <div className="content-console-list">
      <div className="content-console-list-header">
        <h3>{title}</h3>
        <Button type="button" variant="secondary" onClick={() => onChange([...list, createItem()])}>
          Add
        </Button>
      </div>

      {list.map((item, index) => (
        <div className="content-console-item-card" key={`${title}-${index}`}>
          {fields.map((field) => (
            <label className="field-label" key={field.name}>
              {field.label}
              {field.type === "textarea" ? (
                <textarea
                  value={item[field.name] || ""}
                  onChange={(event) => updateItem(index, field.name, event.target.value)}
                />
              ) : (
                <input
                  type="text"
                  value={item[field.name] || ""}
                  onChange={(event) => updateItem(index, field.name, event.target.value)}
                />
              )}
            </label>
          ))}

          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              const next = [...list];
              next.splice(index, 1);
              onChange(next);
            }}
          >
            Remove
          </Button>
        </div>
      ))}
    </div>
  );
}

