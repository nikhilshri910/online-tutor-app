export function buttonClassName({ variant = "primary", fullWidth = false } = {}) {
  const classes = ["btn", `btn-${variant}`];

  if (fullWidth) {
    classes.push("btn-block");
  }

  return classes.join(" ");
}

export default function Button({
  type = "button",
  variant = "primary",
  fullWidth = false,
  className = "",
  children,
  ...props
}) {
  const baseClass = buttonClassName({ variant, fullWidth });
  const finalClass = className ? `${baseClass} ${className}` : baseClass;

  return (
    <button type={type} className={finalClass} {...props}>
      {children}
    </button>
  );
}
