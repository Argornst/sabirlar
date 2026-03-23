export default function Field({
  label,
  htmlFor,
  error,
  children,
  fullWidth = false,
}) {
  return (
    <div className={`ui-field ${fullWidth ? "ui-field--full" : ""}`.trim()}>
      {label ? <label htmlFor={htmlFor}>{label}</label> : null}
      {children}
      {error ? <div className="error-text">{error}</div> : null}
    </div>
  );
}