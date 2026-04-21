import { forwardRef } from "react";

const Textarea = forwardRef(function Textarea(
  {
    name,
    value,
    defaultValue,
    onChange,
    rows = 4,
    className = "",
    ...props
  },
  ref
) {
  return (
    <textarea
      ref={ref}
      name={name}
      value={value}
      defaultValue={value === undefined ? defaultValue : undefined}
      onChange={onChange}
      rows={rows}
      className={`ui-textarea ${className}`.trim()}
      {...props}
    />
  );
});

export default Textarea;
