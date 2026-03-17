export default function SectionCard({
  title,
  subtitle = "",
  rightContent = null,
  children,
  padding = 22,
}) {
  return (
    <div
      style={{
        ...styles.card,
        padding,
      }}
    >
      {(title || subtitle || rightContent) && (
        <div style={styles.header}>
          <div>
            {title ? <h2 style={styles.title}>{title}</h2> : null}
            {subtitle ? <p style={styles.subtitle}>{subtitle}</p> : null}
          </div>

          {rightContent ? <div>{rightContent}</div> : null}
        </div>
      )}

      <div>{children}</div>
    </div>
  );
}

const styles = {
  card: {
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(10px)",
    border: "1px solid #e5e7eb",
    borderRadius: "30px",
    boxShadow: "0 20px 40px rgba(15,23,42,0.05)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },
  title: {
    margin: 0,
    color: "#0f172a",
    fontSize: "22px",
    fontWeight: 900,
  },
  subtitle: {
    margin: "6px 0 0 0",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.6,
  },
};