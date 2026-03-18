export default function FullScreenLoader() {
  return (
    <div style={styles.overlay}>
      <style>{`
        @keyframes appLoaderSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes appLoaderPulse {
          0%, 100% {
            opacity: 0.65;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }
      `}</style>

      <div style={styles.glowBlue} />
      <div style={styles.glowGreen} />

      <div style={styles.loaderWrap}>
        <div style={styles.loaderHalo} />
        <div style={styles.loaderRing} />
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.10)",
    backdropFilter: "blur(16px) saturate(140%)",
    WebkitBackdropFilter: "blur(16px) saturate(140%)",
    overflow: "hidden",
  },

  glowBlue: {
    position: "absolute",
    top: "22%",
    left: "28%",
    width: "220px",
    height: "220px",
    borderRadius: "999px",
    background: "rgba(37,99,235,0.14)",
    filter: "blur(80px)",
    pointerEvents: "none",
  },

  glowGreen: {
    position: "absolute",
    right: "26%",
    bottom: "24%",
    width: "220px",
    height: "220px",
    borderRadius: "999px",
    background: "rgba(16,185,129,0.12)",
    filter: "blur(80px)",
    pointerEvents: "none",
  },

  loaderWrap: {
    position: "relative",
    width: "104px",
    height: "104px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  loaderHalo: {
    position: "absolute",
    width: "84px",
    height: "84px",
    borderRadius: "999px",
    background:
      "radial-gradient(circle, rgba(59,130,246,0.20) 0%, rgba(16,185,129,0.12) 45%, rgba(255,255,255,0) 72%)",
    filter: "blur(12px)",
    animation: "appLoaderPulse 2s ease-in-out infinite",
    pointerEvents: "none",
  },

  loaderRing: {
    width: "56px",
    height: "56px",
    borderRadius: "999px",
    border: "6px solid rgba(226,232,240,0.45)",
    borderTopColor: "#2563eb",
    borderRightColor: "#3b82f6",
    borderBottomColor: "#10b981",
    borderLeftColor: "rgba(226,232,240,0.28)",
    boxSizing: "border-box",
    animation: "appLoaderSpin 0.95s linear infinite",
    filter: "drop-shadow(0 10px 24px rgba(37,99,235,0.18))",
  },
};