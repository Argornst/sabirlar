export default function Select({
  name,
  value,
  defaultValue,
  onChange,
  children,
  className = "",
  ...props
}) {
  return (
    <select
      name={name}
      value={value}
      defaultValue={value === undefined ? defaultValue : undefined}
      onChange={onChange}
      className={`ui-select ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}