export default function CenteredSpinner({
  label = "Yükleniyor...",
  sublabel = "Lütfen bekleyin",
  overlay = true,
}) {
  return (
    <div
      style={{
        ...styles.wrapper,
        ...(overlay ? styles.overlay : styles.inline),
      }}
    >
      <style>{`
        @keyframes spinOuter {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spinInner {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes pulseCore {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.75;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.12);
            opacity: 1;
          }
        }

        @keyframes fadeInSoft {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div style={styles.loaderBox}>
        <div style={styles.spinnerArea}>
          <div style={styles.outerRing} />
          <div style={styles.innerRing} />
          <div style={styles.coreDot} />
        </div>

        <div style={styles.textArea}>
          <div style={styles.label}>{label}</div>
          <div style={styles.sublabel}>{sublabel}</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "grid",
    placeItems: "center",
    animation: "fadeInSoft 0.2s ease-out",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 999,
    background: "rgba(248,250,252,0.20)",
    backdropFilter: "blur(3px)",
    pointerEvents: "none",
  },
  inline: {
    minHeight: "180px",
    width: "100%",
  },
  loaderBox: {
    display: "grid",
    justifyItems: "center",
    gap: "14px",
  },
  spinnerArea: {
    position: "relative",
    width: "64px",
    height: "64px",
  },
  outerRing: {
    position: "absolute",
    inset: 0,
    borderRadius: "999px",
    border: "3px solid rgba(148,163,184,0.20)",
    borderTopColor: "#10b981",
    animation: "spinOuter 1s linear infinite",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.35) inset",
  },
  innerRing: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "38px",
    height: "38px",
    borderRadius: "999px",
    border: "3px solid rgba(148,163,184,0.14)",
    borderBottomColor: "#3b82f6",
    animation: "spinInner 0.8s linear infinite",
    transform: "translate(-50%, -50%)",
  },
  coreDot: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "10px",
    height: "10px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
    transform: "translate(-50%, -50%)",
    animation: "pulseCore 1.1s ease-in-out infinite",
  },
  textArea: {
    textAlign: "center",
  },
  label: {
    fontSize: "14px",
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.01em",
  },
  sublabel: {
    marginTop: "4px",
    fontSize: "12px",
    color: "#64748b",
  },
};