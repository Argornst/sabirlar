export default function FullScreenLoader({
  title = "Workspace hazırlanıyor",
  subtitle = "Oturum doğrulanıyor ve kullanıcı verileri yükleniyor...",
}) {
  return (
    <div style={styles.wrapper}>
      <style>{`
        @keyframes rotateSlow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes rotateReverse {
          from { transform: translate(-50%, -50%) rotate(360deg); }
          to { transform: translate(-50%, -50%) rotate(0deg); }
        }
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 0.55; }
          50% { transform: scale(1.12); opacity: 1; }
        }
        @keyframes moveBar {
          0% { transform: translateX(-130%); }
          100% { transform: translateX(320%); }
        }
      `}</style>

      <div style={styles.glowOne} />
      <div style={styles.glowTwo} />

      <div style={styles.card}>
        <div style={styles.brandRow}>
          <div style={styles.logo}>S</div>
          <div>
            <div style={styles.brandTitle}>Satış Sistemi</div>
            <div style={styles.brandSubtitle}>Premium Workspace</div>
          </div>
        </div>

        <div style={styles.rings}>
          <div style={styles.outerRing} />
          <div style={styles.innerRing} />
          <div style={styles.centerDot} />
        </div>

        <h1 style={styles.title}>{title}</h1>
        <p style={styles.subtitle}>{subtitle}</p>

        <div style={styles.track}>
          <div style={styles.bar} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "radial-gradient(circle at top, #eef2f7 0%, #e2e8f0 45%, #dbe4ef 100%)",
    position: "relative",
    overflow: "hidden",
    padding: "24px",
  },
  glowOne: {
    position: "absolute",
    top: "-30px",
    left: "-40px",
    width: "340px",
    height: "340px",
    borderRadius: "999px",
    background: "rgba(16,185,129,0.14)",
    filter: "blur(80px)",
  },
  glowTwo: {
    position: "absolute",
    right: "-20px",
    bottom: "-20px",
    width: "320px",
    height: "320px",
    borderRadius: "999px",
    background: "rgba(59,130,246,0.14)",
    filter: "blur(80px)",
  },
  card: {
    width: "100%",
    maxWidth: "520px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.74)",
    backdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.8)",
    padding: "36px 32px",
    boxShadow: "0 30px 70px rgba(15,23,42,0.12)",
    textAlign: "center",
    position: "relative",
    zIndex: 2,
  },
  brandRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "14px",
    marginBottom: "26px",
  },
  logo: {
    width: "54px",
    height: "54px",
    borderRadius: "18px",
    display: "grid",
    placeItems: "center",
    color: "#fff",
    fontWeight: 800,
    fontSize: "20px",
    background: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
  },
  brandTitle: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#0f172a",
    textAlign: "left",
  },
  brandSubtitle: {
    fontSize: "13px",
    color: "#64748b",
    marginTop: "3px",
    textAlign: "left",
  },
  rings: {
    position: "relative",
    width: "124px",
    height: "124px",
    margin: "0 auto 26px auto",
  },
  outerRing: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "124px",
    height: "124px",
    borderRadius: "999px",
    border: "4px solid rgba(15,23,42,0.08)",
    borderTopColor: "#0f172a",
    animation: "rotateSlow 1.5s linear infinite",
  },
  innerRing: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "84px",
    height: "84px",
    borderRadius: "999px",
    border: "4px solid rgba(16,185,129,0.10)",
    borderBottomColor: "#10b981",
    animation: "rotateReverse 1.1s linear infinite",
  },
  centerDot: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "18px",
    height: "18px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
    animation: "pulseDot 1.3s ease-in-out infinite",
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: "30px",
    lineHeight: 1.15,
    color: "#0f172a",
    fontWeight: 800,
  },
  subtitle: {
    margin: "0 auto",
    maxWidth: "380px",
    fontSize: "14px",
    lineHeight: 1.65,
    color: "#64748b",
  },
  track: {
    marginTop: "24px",
    height: "10px",
    borderRadius: "999px",
    background: "#e2e8f0",
    overflow: "hidden",
  },
  bar: {
    width: "35%",
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #10b981 0%, #3b82f6 100%)",
    animation: "moveBar 1.8s ease-in-out infinite",
  },
};