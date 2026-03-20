export default function AppPage({
  hero,
  actions = null,
  stats = null,
  children,
  contentStyle = {},
}) {
  return (
    <div style={styles.page}>
      <div style={styles.heroWrap}>{hero}</div>

      {actions && <div style={styles.actionsWrap}>{actions}</div>}
      {stats && <div style={styles.statsWrap}>{stats}</div>}

      <div style={{ ...styles.content, ...contentStyle }}>
        {children}
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "grid",
    gap: "18px",
    width: "100%",
    minWidth: 0, // 🔥 KRİTİK
  },
  heroWrap: {
    width: "100%",
    minWidth: 0, // 🔥
  },
  actionsWrap: {
    width: "100%",
    minWidth: 0,
  },
  statsWrap: {
    width: "100%",
    minWidth: 0,
  },
  content: {
    display: "grid",
    gap: "18px",
    width: "100%",
    minWidth: 0, // 🔥 EN ÖNEMLİ
  },
};