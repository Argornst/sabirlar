import { motion } from "framer-motion";

export default function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  ...props
}) {
  const variantClassMap = {
    primary: "ui-button ui-button--primary",
    secondary: "ui-button ui-button--secondary",
    danger: "ui-button ui-button--danger",
    ghost: "ui-button ui-button--ghost",
  };

  return (
    <motion.button
      type={type}
      className={`${variantClassMap[variant] ?? variantClassMap.primary} ${className}`.trim()}
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.button>
  );
}