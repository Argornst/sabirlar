export default function PremiumStatsRow({ items = [] }) {
  return (
    <div className="premium-stats-row" style={styles.grid}>
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} style={styles.card}>
          <div
            style={{
              ...styles.accent,
              background:
                item.accent ||
                "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)",
            }}
          />
          <div style={styles.label}>{item.label}</div>
          <div style={styles.value}>{item.value}</div>
          {item.hint ? <div style={styles.hint}>{item.hint}</div> : null}
        </div>
      ))}
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "14px",
  },
  card: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "24px",
    padding: "18px",
    background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
    border: "1px solid rgba(226,232,240,0.9)",
    boxShadow: "0 12px 24px rgba(15,23,42,0.05)",
    minHeight: "112px",
  },
  accent: {
    width: "40px",
    height: "6px",
    borderRadius: "999px",
    marginBottom: "12px",
  },
  label: {
    color: "#64748b",
    fontSize: "13px",
    fontWeight: 800,
    marginBottom: "8px",
  },
  value: {
    color: "#0f172a",
    fontSize: "24px",
    lineHeight: 1.05,
    fontWeight: 900,
    letterSpacing: "-0.03em",
    marginBottom: "8px",
  },
  hint: {
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 600,
    lineHeight: 1.5,
  },
};