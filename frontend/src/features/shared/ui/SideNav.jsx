import Button from "./Button";

export default function SideNav({ items, activeId, onChange }) {
  return (
    <nav className="side-nav" aria-label="Admin sections">
      {items.map((item) => (
        <Button
          key={item.id}
          type="button"
          variant={activeId === item.id ? "primary" : "secondary"}
          className="side-nav-item"
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </Button>
      ))}
    </nav>
  );
}
