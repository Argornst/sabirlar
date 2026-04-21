import { motion } from "framer-motion";

export default function Card({ children, className = "" }) {
  const MotionSection = motion.section;

  return (
    <MotionSection
      className={`ui-card ${className}`.trim()}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      {children}
    </MotionSection>
  );
}
