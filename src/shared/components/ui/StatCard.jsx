import { motion } from "framer-motion";

export default function StatCard({ label, value, helper = null }) {
  return (
    <motion.div
      className="ui-stat-card"
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <span className="ui-stat-card__label">{label}</span>
      <strong className="ui-stat-card__value">{value}</strong>
      {helper ? <span className="ui-stat-card__helper">{helper}</span> : null}
    </motion.div>
  );
}