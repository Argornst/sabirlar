export default function Field({
  label,
  htmlFor,
  error,
  helper,
  children,
  fullWidth = false,
}) {
  const hasError = Boolean(error);

  return (
    <div
      className={`ui-field ${
        fullWidth ? "ui-field--full" : ""
      } ${hasError ? "ui-field--error" : ""}`.trim()}
    >
      {label ? (
        <label htmlFor={htmlFor} className="ui-field__label">
          {label}
        </label>
      ) : null}

      <div className="ui-field__control">
        {children}
      </div>

      {hasError ? (
        <div className="ui-field__error">
          {error}
        </div>
      ) : helper ? (
        <div className="ui-field__helper">
          {helper}
        </div>
      ) : null}
    </div>
  );
}