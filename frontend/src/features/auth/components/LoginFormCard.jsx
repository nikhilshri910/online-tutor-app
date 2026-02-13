import Button from "../../shared/ui/Button";
import Card from "../../shared/ui/Card";
import FormField from "../../shared/ui/FormField";

export default function LoginFormCard({ title, fields, value, onChange, onSubmit, submitting }) {
  return (
    <Card as="form" onSubmit={onSubmit} className="panel">
      <h1>{title}</h1>

      {fields.map((field) => (
        <FormField key={field.name} field={field} value={value[field.name]} onChange={onChange} />
      ))}

      <Button type="submit" disabled={submitting} fullWidth>
        {submitting ? "Signing in..." : "Login"}
      </Button>
    </Card>
  );
}
