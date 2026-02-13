import Button from "./Button";

function getValue(row, column) {
  const value = row[column.key];
  if (column.render) {
    return column.render(value, row);
  }
  return value ?? "-";
}

export default function DataTable({ columns, rows, emptyMessage = "No data found.", rowActions }) {
  const hasActions = typeof rowActions === "function";

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
            {hasActions ? <th>Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row) => {
              const actions = hasActions ? rowActions(row) || [] : [];
              return (
                <tr key={row.id}>
                  {columns.map((column) => (
                    <td key={`${row.id}-${column.key}`}>{getValue(row, column)}</td>
                  ))}
                  {hasActions ? (
                    <td>
                      <div className="table-actions">
                        {actions.map((action) => (
                          <Button
                            key={`${row.id}-${action.label}`}
                            type="button"
                            variant={action.variant || "secondary"}
                            onClick={action.onClick}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </td>
                  ) : null}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={columns.length + (hasActions ? 1 : 0)} className="table-empty">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
