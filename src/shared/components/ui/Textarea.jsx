export default function Textarea({
  name,
  value,
  defaultValue,
  onChange,
  rows = 4,
  className = "",
  ...props
}) {
  return (
    <textarea
      name={name}
      value={value}
      defaultValue={value === undefined ? defaultValue : undefined}
      onChange={onChange}
      rows={rows}
      className={`ui-textarea ${className}`.trim()}
      {...props}
    />
  );
}