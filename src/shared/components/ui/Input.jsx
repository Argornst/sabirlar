import { forwardRef } from "react";

const Input = forwardRef(function Input(
  {
    name,
    type = "text",
    value,
    defaultValue,
    onChange,
    className = "",
    ...props
  },
  ref
) {
  return (
    <input
      ref={ref}
      name={name}
      type={type}
      value={value}
      defaultValue={value === undefined ? defaultValue : undefined}
      onChange={onChange}
      className={`ui-input ${className}`.trim()}
      {...props}
    />
  );
});

export default Input;
