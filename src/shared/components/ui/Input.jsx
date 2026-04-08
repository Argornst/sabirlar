export default function Input({
  name,
  type = "text",
  value,
  defaultValue,
  onChange,
  className = "",
  ...props
}) {
  return (
    <input
      name={name}
      type={type}
      value={value}
      defaultValue={value === undefined ? defaultValue : undefined}
      onChange={onChange}
      className={`ui-input ${className}`.trim()}
      {...props}
    />
  );
}