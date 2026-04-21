import { forwardRef } from "react";
import { motion } from "framer-motion";

const MotionButton = motion.button;

const Button = forwardRef(function Button(
  {
    children,
    type = "button",
    variant = "primary",
    className = "",
    loading = false,
    disabled = false,
    ...rest
  },
  ref
) {
  const variantClassMap = {
    primary: "ui-button ui-button--primary",
    secondary: "ui-button ui-button--secondary",
    danger: "ui-button ui-button--danger",
    ghost: "ui-button ui-button--ghost",
  };

  return (
    <MotionButton
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`${variantClassMap[variant] ?? variantClassMap.primary} ${className}`.trim()}
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      {...rest}
    >
      {loading ? (
        <span className="ui-button__loading">
          <span className="ui-button__spinner" />
          Yükleniyor...
        </span>
      ) : (
        children
      )}
    </MotionButton>
  );
});

export default Button;
