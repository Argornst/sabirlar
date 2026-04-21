import { motion, useReducedMotion } from "framer-motion";

export default function AnimatedPage({ children }) {
  const prefersReducedMotion = useReducedMotion();
  const MotionDiv = motion.div;

  if (prefersReducedMotion) {
    return <div>{children}</div>;
  }

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
    >
      {children}
    </MotionDiv>
  );
}
