import { motion } from "framer-motion";

export default function SectionCard({ title, description, children }) {
  return (
    <motion.div
      className="ui-section-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <div className="ui-section-card__header">
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
      </div>
      <div>{children}</div>
    </motion.div>
  );
}