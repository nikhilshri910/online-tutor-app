import Button from "../../shared/ui/Button";
import Card from "../../shared/ui/Card";
import FormField from "../../shared/ui/FormField";

export default function FormRenderer({
  title,
  showTitle = true,
  fields,
  value,
  onChange,
  onSubmit,
  submitLabel,
  className = "panel"
}) {
  return (
    <Card as="form" className={className} onSubmit={onSubmit}>
      {showTitle ? <h2>{title}</h2> : null}
      {fields.map((field) => {
        const fieldValue = value[field.name];
        return <FormField key={field.name} field={field} value={fieldValue} onChange={onChange} />;
      })}
      <Button type="submit">{submitLabel}</Button>
    </Card>
  );
}
