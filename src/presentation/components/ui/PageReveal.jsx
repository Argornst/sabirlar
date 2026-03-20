import { useEffect, useState } from "react";

export default function PageReveal({
  children,
  delay = 0,
  y = 18,
  duration = 520,
  blur = 8,
  style = {},
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(id);
  }, [delay]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px) scale(1)" : `translateY(${y}px) scale(0.985)`,
        filter: visible ? "blur(0px)" : `blur(${blur}px)`,
        transition: `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1), transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1), filter ${duration}ms ease`,
        willChange: "opacity, transform, filter",
        ...style,
      }}
    >
      {children}
    </div>
  );
}