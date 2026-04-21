import { forwardRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

const IconButton = forwardRef(function IconButton(
  {
    children,
    type = "button",
    tone = "default",
    active = false,
    className = "",
    disabled = false,
    title,
    "aria-label": ariaLabel,
    ...props
  },
  ref
) {
  const prefersReducedMotion = useReducedMotion();
  const MotionButton = motion.button;

  const hoverProps = prefersReducedMotion
    ? {}
    : {
        whileHover: { y: -1, scale: 1.02 },
        whileTap: { scale: 0.98 },
        transition: { duration: 0.16, ease: "easeOut" },
      };

  return (
    <MotionButton
      ref={ref}
      type={type}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className={[
        "ui-icon-button",
        `ui-icon-button--${tone}`,
        active ? "ui-icon-button--active" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...hoverProps}
      {...props}
    >
      {children}
    </MotionButton>
  );
});

export default IconButton;
