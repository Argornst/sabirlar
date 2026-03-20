export default function PageHero({
  kicker,
  title,
  subtitle,
  rightContent = null,
  children = null,
  variant = "blue",
}) {
  const variantStyles = heroVariants[variant] || heroVariants.blue;

  return (
    <div
      className="page-hero-root"
      style={{
        ...styles.wrapper,
        background: variantStyles.background,
      }}
    >
      <style>{`
        @media (max-width: 1180px) {
          .page-hero-root {
            padding-right: 28px !important;
          }

          .page-hero-right {
            position: static !important;
            width: 100% !important;
            max-width: none !important;
            margin-top: 18px !important;
          }

          .page-hero-top {
            display: block !important;
          }
        }
      `}</style>

      <div
        style={{
          ...styles.glowOne,
          background: variantStyles.glowOne,
        }}
      />
      <div
        style={{
          ...styles.glowTwo,
          background: variantStyles.glowTwo,
        }}
      />

      <div className="page-hero-top" style={styles.topRow}>
        <div style={styles.content}>
          {kicker ? (
            <div
              style={{
                ...styles.kicker,
                background: variantStyles.kickerBg,
                color: variantStyles.kickerColor,
                border: `1px solid ${variantStyles.kickerBorder}`,
              }}
            >
              {kicker}
            </div>
          ) : null}

          <h1 style={styles.title}>{title}</h1>

          {subtitle ? <p style={styles.subtitle}>{subtitle}</p> : null}
        </div>
      </div>

      {rightContent ? (
        <div className="page-hero-right" style={styles.rightContent}>
          {rightContent}
        </div>
      ) : null}

      {children ? <div style={styles.bottomContent}>{children}</div> : null}
    </div>
  );
}

const heroVariants = {
  blue: {
    background: "linear-gradient(135deg, #0f172a 0%, #111827 45%, #0b3b66 100%)",
    glowOne: "rgba(16,185,129,0.18)",
    glowTwo: "rgba(59,130,246,0.16)",
    kickerBg: "rgba(59,130,246,0.14)",
    kickerColor: "#93c5fd",
    kickerBorder: "rgba(147,197,253,0.12)",
  },
  green: {
    background: "linear-gradient(135deg, #052e2b 0%, #064e3b 45%, #0f766e 100%)",
    glowOne: "rgba(16,185,129,0.20)",
    glowTwo: "rgba(45,212,191,0.18)",
    kickerBg: "rgba(16,185,129,0.14)",
    kickerColor: "#86efac",
    kickerBorder: "rgba(134,239,172,0.12)",
  },
  indigo: {
    background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #1d4ed8 100%)",
    glowOne: "rgba(99,102,241,0.22)",
    glowTwo: "rgba(59,130,246,0.18)",
    kickerBg: "rgba(99,102,241,0.16)",
    kickerColor: "#c7d2fe",
    kickerBorder: "rgba(199,210,254,0.14)",
  },
};

const styles = {
  wrapper: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "34px",
    padding: "28px",
    paddingRight: "340px",
    boxShadow: "0 26px 60px rgba(15,23,42,0.18)",
    border: "1px solid rgba(255,255,255,0.08)",
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
  },
  glowOne: {
    position: "absolute",
    top: "-40px",
    right: "10%",
    width: "220px",
    height: "220px",
    borderRadius: "999px",
    filter: "blur(70px)",
    pointerEvents: "none",
  },
  glowTwo: {
    position: "absolute",
    bottom: "-40px",
    left: "8%",
    width: "180px",
    height: "180px",
    borderRadius: "999px",
    filter: "blur(60px)",
    pointerEvents: "none",
  },
  topRow: {
    position: "relative",
    zIndex: 2,
    minWidth: 0,
  },
  content: {
    maxWidth: "760px",
    minWidth: 0,
  },
  kicker: {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
    marginBottom: "14px",
  },
  title: {
    margin: 0,
    fontSize: "38px",
    fontWeight: 900,
    color: "#f8fafc",
    letterSpacing: "-0.04em",
    lineHeight: 1.05,
  },
  subtitle: {
    margin: "12px 0 0 0",
    color: "#cbd5e1",
    fontSize: "15px",
    lineHeight: 1.75,
    maxWidth: "720px",
  },
  rightContent: {
    position: "absolute",
    top: "28px",
    right: "28px",
    width: "280px",
    maxWidth: "280px",
    zIndex: 2,
  },
  bottomContent: {
    position: "relative",
    zIndex: 2,
    marginTop: "18px",
    minWidth: 0,
  },
};