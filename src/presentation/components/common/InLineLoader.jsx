export default function InlineLoader({ label = "Veriler güncelleniyor..." }) {
  return (
    <div style={styles.wrap}>
      <style>{`
        @keyframes inlineMove {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(320%); }
        }
      `}</style>

      <div style={styles.label}>{label}</div>
      <div style={styles.track}>
        <div style={styles.bar} />
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    display: "grid",
    gap: "10px",
  },
  label: {
    fontSize: "12px",
    fontWeight: 800,
    color: "#64748b",
  },
  track: {
    position: "relative",
    height: "6px",
    borderRadius: "999px",
    background: "#e2e8f0",
    overflow: "hidden",
  },
  bar: {
    width: "28%",
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #10b981 0%, #3b82f6 100%)",
    animation: "inlineMove 1.6s ease-in-out infinite",
  },
};