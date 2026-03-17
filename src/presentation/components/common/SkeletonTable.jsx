export default function SkeletonTable({
  rows = 6,
  columns = 6,
  title = "Tablo yükleniyor",
  subtitle = "Kayıtlar hazırlanıyor...",
}) {
  return (
    <div style={styles.wrapper}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>{title}</h3>
          <p style={styles.subtitle}>{subtitle}</p>
        </div>
        <div style={styles.actions}>
          <div style={{ ...styles.pill, width: 120 }} />
          <div style={{ ...styles.pill, width: 90 }} />
        </div>
      </div>

      <div style={styles.head}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={`head-${i}`} style={styles.headCell} />
        ))}
      </div>

      <div style={styles.body}>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} style={styles.row}>
            {Array.from({ length: columns }).map((__, cellIndex) => (
              <div
                key={`${rowIndex}-${cellIndex}`}
                style={{
                  ...styles.cell,
                  width:
                    cellIndex === 0
                      ? "74%"
                      : cellIndex === columns - 1
                      ? "54%"
                      : `${56 + ((rowIndex + cellIndex) % 4) * 10}%`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const shimmer = {
  background:
    "linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 20%, #f8fafc 40%, #e2e8f0 60%, #f1f5f9 100%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.6s linear infinite",
};

const styles = {
  wrapper: {
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(10px)",
    border: "1px solid #e5e7eb",
    borderRadius: "28px",
    padding: "22px",
    boxShadow: "0 20px 40px rgba(15,23,42,0.05)",
    overflowX: "auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  title: {
    margin: "0 0 6px 0",
    fontSize: "20px",
    fontWeight: 800,
    color: "#0f172a",
  },
  subtitle: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
  },
  actions: {
    display: "flex",
    gap: "10px",
  },
  pill: {
    ...shimmer,
    height: "38px",
    borderRadius: "999px",
  },
  head: {
    display: "grid",
    gridTemplateColumns: "repeat(8, minmax(120px, 1fr))",
    gap: "12px",
    minWidth: "920px",
    marginBottom: "16px",
  },
  headCell: {
    ...shimmer,
    height: "15px",
    borderRadius: "999px",
  },
  body: {
    display: "grid",
    gap: "14px",
    minWidth: "920px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "repeat(8, minmax(120px, 1fr))",
    gap: "12px",
    alignItems: "center",
    paddingTop: "14px",
    borderTop: "1px solid #f1f5f9",
  },
  cell: {
    ...shimmer,
    height: "14px",
    borderRadius: "999px",
  },
};