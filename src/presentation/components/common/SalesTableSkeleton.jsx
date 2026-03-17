export default function SalesTableSkeleton() {
  return (
    <div style={styles.card}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div style={styles.header}>
        <div style={styles.title} />
        <div style={styles.badge} />
      </div>

      <div style={styles.table}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={styles.row}>
            {Array.from({ length: 7 }).map((_, j) => (
              <div key={j} style={styles.cell} />
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
  animation: "shimmer 1.5s linear infinite",
};

const styles = {
  card: {
    background: "#fff",
    borderRadius: "28px",
    padding: "20px",
    border: "1px solid #e5e7eb",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  title: {
    ...shimmer,
    width: "180px",
    height: "20px",
    borderRadius: "8px",
  },
  badge: {
    ...shimmer,
    width: "80px",
    height: "20px",
    borderRadius: "999px",
  },
  table: {
    display: "grid",
    gap: "12px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "10px",
  },
  cell: {
    ...shimmer,
    height: "16px",
    borderRadius: "6px",
  },
};