export default function MetricCard({
  title,
  value,
  subtitle = "",
  tone = "default",
}) {
  const toneStyle = tones[tone] || tones.default;

  return (
    <div
      style={{
        ...styles.card,
        border: `1px solid ${toneStyle.border}`,
        background: toneStyle.background,
      }}
    >
      <div style={styles.title}>{title}</div>
      <div style={styles.value}>{value}</div>
      {subtitle ? <div style={styles.subtitle}>{subtitle}</div> : null}
    </div>
  );
}

const tones = {
  default: {
    background: "rgba(255,255,255,0.88)",
    border: "#e5e7eb",
  },
  blue: {
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(239,246,255,0.92) 100%)",
    border: "#bfdbfe",
  },
  green: {
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(236,253,245,0.92) 100%)",
    border: "#a7f3d0",
  },
  orange: {
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,247,237,0.92) 100%)",
    border: "#fed7aa",
  },
  red: {
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(254,242,242,0.92) 100%)",
    border: "#fecaca",
  },
};

const styles = {
  card: {
    backdropFilter: "blur(10px)",
    borderRadius: "26px",
    padding: "20px",
    boxShadow: "0 18px 36px rgba(15,23,42,0.05)",
  },
  title: {
    color: "#64748b",
    fontSize: "13px",
    fontWeight: 800,
    marginBottom: "10px",
  },
  value: {
    color: "#0f172a",
    fontSize: "30px",
    fontWeight: 900,
    lineHeight: 1.1,
    marginBottom: "8px",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "13px",
    lineHeight: 1.5,
  },
};