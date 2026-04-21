export default function Checkbox({
  checked,
  onChange,
  label,
  className = "",
  inputClassName = "",
  ...props
}) {
  return (
    <label className={["ui-checkbox", className].filter(Boolean).join(" ")}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={["ui-checkbox__input", inputClassName].filter(Boolean).join(" ")}
        {...props}
      />
      <span className="ui-checkbox__label">{label}</span>
    </label>
  );
}
