import { forwardRef } from "react";

const Pressable = forwardRef(function Pressable(
  {
    children,
    type = "button",
    className = "",
    disabled = false,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={["ui-pressable", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </button>
  );
});

export default Pressable;
