export default function ToastViewport({ toasts, onDismiss }) {
  return (
    <div style={styles.viewport}>
      <style>{`
        @keyframes toastEnter {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes toastProgress {
          from {
            width: 100%;
            opacity: 1;
          }
          to {
            width: 0%;
            opacity: 0.85;
          }
        }

        @keyframes glowPulseSuccess {
          0%, 100% {
            opacity: 0.22;
            transform: scale(1);
          }
          50% {
            opacity: 0.34;
            transform: scale(1.05);
          }
        }

        @keyframes glowPulseError {
          0%, 100% {
            opacity: 0.20;
            transform: scale(1);
          }
          50% {
            opacity: 0.30;
            transform: scale(1.04);
          }
        }

        @media (max-width: 640px) {
          .toast-viewport {
            width: calc(100vw - 24px) !important;
          }
        }
      `}</style>

      <div className="toast-viewport" style={styles.viewportInner}>
        {toasts.map((toast, index) => {
          const toneStyle = toneStyles[toast.tone] || toneStyles.default;
          const offsetY = index * 6;
          const scale = 1 - index * 0.015;

          return (
            <div
              key={toast.id}
              style={{
                ...styles.toast,
                background: toneStyle.background,
                borderColor: toneStyle.border,
                boxShadow: toneStyle.shadow,
                transform: `translateY(${offsetY}px) scale(${scale})`,
                zIndex: 100 - index,
              }}
            >
              {toneStyle.glow ? (
                <div
                  style={{
                    ...styles.glow,
                    background: toneStyle.glow,
                    animation:
                      toast.tone === "success"
                        ? "glowPulseSuccess 2.2s ease-in-out infinite"
                        : toast.tone === "error"
                        ? "glowPulseError 2.2s ease-in-out infinite"
                        : "none",
                  }}
                />
              ) : null}

              <div style={styles.inner}>
                <div
                  style={{
                    ...styles.iconWrap,
                    background: toneStyle.iconBackground,
                  }}
                >
                  <span style={styles.icon}>{toneStyle.icon}</span>
                </div>

                <div style={styles.content}>
                  <div style={styles.headerRow}>
                    <div style={styles.title}>{toast.title}</div>

                    <button
                      type="button"
                      style={styles.closeButton}
                      onClick={() => onDismiss(toast.id)}
                      aria-label="Bildirimi kapat"
                    >
                      ×
                    </button>
                  </div>

                  {toast.description ? (
                    <div style={styles.description}>{toast.description}</div>
                  ) : null}
                </div>
              </div>

              <div style={styles.progressTrack}>
                <div
                  style={{
                    ...styles.progressBar,
                    background: toneStyle.progress,
                    animationDuration: `${toast.duration || 3200}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const toneStyles = {
  default: {
    background: "rgba(255,255,255,0.76)",
    border: "rgba(226,232,240,0.95)",
    shadow: "0 18px 45px rgba(15,23,42,0.10)",
    iconBackground: "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)",
    progress: "linear-gradient(90deg, #64748b 0%, #334155 100%)",
    glow: null,
    icon: "•",
  },
  success: {
    background: "rgba(240,253,250,0.78)",
    border: "rgba(167,243,208,0.95)",
    shadow: "0 20px 48px rgba(16,185,129,0.16)",
    iconBackground: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    progress: "linear-gradient(90deg, #10b981 0%, #059669 100%)",
    glow: "radial-gradient(circle, rgba(16,185,129,0.30) 0%, rgba(16,185,129,0.10) 45%, rgba(16,185,129,0.00) 75%)",
    icon: "✓",
  },
  error: {
    background: "rgba(255,245,245,0.80)",
    border: "rgba(254,202,202,0.95)",
    shadow: "0 20px 48px rgba(239,68,68,0.15)",
    iconBackground: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    progress: "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)",
    glow: "radial-gradient(circle, rgba(239,68,68,0.28) 0%, rgba(239,68,68,0.10) 45%, rgba(239,68,68,0.00) 75%)",
    icon: "!",
  },
  info: {
    background: "rgba(245,249,255,0.80)",
    border: "rgba(191,219,254,0.95)",
    shadow: "0 18px 45px rgba(59,130,246,0.14)",
    iconBackground: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    progress: "linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)",
    glow: null,
    icon: "i",
  },
  warning: {
    background: "rgba(255,251,235,0.82)",
    border: "rgba(253,230,138,0.95)",
    shadow: "0 18px 45px rgba(245,158,11,0.14)",
    iconBackground: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
    progress: "linear-gradient(90deg, #f59e0b 0%, #ea580c 100%)",
    glow: null,
    icon: "!",
  },
};

const styles = {
  viewport: {
    position: "fixed",
    top: 16,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 9999,
    pointerEvents: "none",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  viewportInner: {
    width: "min(420px, calc(100vw - 24px))",
    display: "grid",
    gap: "10px",
    justifyItems: "center",
  },
  toast: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    border: "1px solid",
    borderRadius: "22px",
    backdropFilter: "blur(18px) saturate(160%)",
    WebkitBackdropFilter: "blur(18px) saturate(160%)",
    animation: "toastEnter 0.22s ease-out",
    pointerEvents: "auto",
    transformOrigin: "top center",
  },
  glow: {
    position: "absolute",
    inset: "-20% -10% auto -10%",
    height: "120%",
    pointerEvents: "none",
    filter: "blur(20px)",
  },
  inner: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "42px 1fr",
    gap: "12px",
    alignItems: "start",
    padding: "13px 14px 11px 14px",
  },
  iconWrap: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    display: "grid",
    placeItems: "center",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
    flexShrink: 0,
  },
  icon: {
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: 900,
    lineHeight: 1,
  },
  content: {
    minWidth: 0,
    paddingTop: "1px",
  },
  headerRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "10px",
  },
  title: {
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: 800,
    lineHeight: 1.35,
    letterSpacing: "-0.01em",
  },
  description: {
    marginTop: "5px",
    color: "#475569",
    fontSize: "12.5px",
    fontWeight: 500,
    lineHeight: 1.55,
    letterSpacing: "-0.005em",
  },
  closeButton: {
    width: "26px",
    height: "26px",
    borderRadius: "9px",
    border: "none",
    background: "rgba(15,23,42,0.04)",
    color: "#64748b",
    fontSize: "18px",
    lineHeight: 1,
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  progressTrack: {
    position: "relative",
    height: "3px",
    width: "100%",
    background: "rgba(255,255,255,0.22)",
  },
  progressBar: {
    height: "100%",
    borderRadius: "999px",
    animation: "toastProgress linear forwards",
  },
};