export default function ContentLoader({
  title = "Veriler hazırlanıyor",
  subtitle = "Lütfen kısa bir süre bekleyin...",
}) {
  return (
    <div style={styles.wrapper}>
      <style>{`
        @keyframes contentSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes contentPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
          50% { transform: translate(-50%, -50%) scale(1.08); opacity: 1; }
        }
      `}</style>

      <div style={styles.card}>
        <div style={styles.iconArea}>
          <div style={styles.ring} />
          <div style={styles.dot} />
        </div>
        <h3 style={styles.title}>{title}</h3>
        <p style={styles.subtitle}>{subtitle}</p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "320px",
    display: "grid",
    placeItems: "center",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: "460px",
    background: "rgba(255,255,255,0.86)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(226,232,240,0.9)",
    borderRadius: "28px",
    boxShadow: "0 20px 40px rgba(15,23,42,0.06)",
    padding: "28px",
    textAlign: "center",
  },
  iconArea: {
    width: "70px",
    height: "70px",
    margin: "0 auto 18px auto",
    position: "relative",
  },
  ring: {
    position: "absolute",
    inset: 0,
    borderRadius: "999px",
    border: "4px solid #e2e8f0",
    borderTopColor: "#10b981",
    animation: "contentSpin 1s linear infinite",
  },
  dot: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "16px",
    height: "16px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
    animation: "contentPulse 1.2s ease-in-out infinite",
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "22px",
    fontWeight: 800,
    color: "#0f172a",
  },
  subtitle: {
    margin: 0,
    fontSize: "14px",
    lineHeight: 1.6,
    color: "#64748b",
  },
};