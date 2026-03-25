import { motion } from "framer-motion";

export default function SectionCard({
  title,
  description,
  children,
}) {
  return (
    <motion.div
      className="ui-section-card ui-section-card--premium"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.01 }}
    >
      <div className="ui-section-card__glow" />

      <div className="ui-section-card__header">
        <div className="ui-section-card__header-text">
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
      </div>

      <div className="ui-section-card__content">
        {children}
      </div>
    </motion.div>
  );
}