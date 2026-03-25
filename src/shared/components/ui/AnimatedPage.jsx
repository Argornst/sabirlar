import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.32,
      ease: "easeOut",
    },
  },
};

export default function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        {children}
      </motion.div>
    </motion.div>
  );
}