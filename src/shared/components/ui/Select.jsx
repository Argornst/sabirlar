import { forwardRef } from "react";

const Select = forwardRef(function Select(
  {
    name,
    value,
    defaultValue,
    onChange,
    children,
    className = "",
    ...props
  },
  ref
) {
  return (
    <select
      ref={ref}
      name={name}
      value={value}
      defaultValue={value === undefined ? defaultValue : undefined}
      onChange={onChange}
      className={`ui-select ${className}`.trim()}
      {...props}
    >
      {children}
    </select>
  );
});

export default Select;
