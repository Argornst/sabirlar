import { motion } from "framer-motion";

export default function StatCard({ label, value, helper = null }) {
  return (
    <motion.div
      className="ui-stat-card ui-stat-card--premium"
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="ui-stat-card__glow" />

      <span className="ui-stat-card__label">{label}</span>

      <strong className="ui-stat-card__value">{value}</strong>

      {helper && <span className="ui-stat-card__helper">{helper}</span>}
    </motion.div>
  );
}