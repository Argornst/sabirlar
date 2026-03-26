import { motion, useReducedMotion } from "framer-motion";

export default function StatCard({ label, value, helper = null }) {
  const prefersReducedMotion = useReducedMotion();

  const hoverProps = prefersReducedMotion
    ? {}
    : {
        whileHover: { y: -2, scale: 1.008 },
        transition: { duration: 0.14, ease: "easeOut" },
      };

  return (
    <motion.div
      className="ui-stat-card ui-stat-card--premium"
      {...hoverProps}
    >
      <div className="ui-stat-card__glow" />

      <div className="ui-stat-card__top">
        <span className="ui-stat-card__label">{label}</span>
      </div>

      <strong className="ui-stat-card__value">{value}</strong>

      {helper ? <span className="ui-stat-card__helper">{helper}</span> : null}
    </motion.div>
  );
}