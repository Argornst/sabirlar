export default function DashboardSkeleton() {
  return (
    <div style={styles.page}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div style={styles.hero} />
      <div style={styles.statsGrid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={styles.card} />
        ))}
      </div>
      <div style={styles.mainGrid}>
        <div style={{ ...styles.card, height: 340 }} />
        <div style={{ display: "grid", gap: 18 }}>
          <div style={{ ...styles.card, height: 180 }} />
          <div style={{ ...styles.card, height: 140 }} />
        </div>
      </div>
      <div style={{ ...styles.card, height: 260 }} />
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
  page: {
    display: "grid",
    gap: 20,
  },
  hero: {
    ...shimmer,
    height: 220,
    borderRadius: 34,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 16,
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.5fr 0.9fr",
    gap: 18,
  },
  card: {
    ...shimmer,
    borderRadius: 30,
  },
};