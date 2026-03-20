export default function AppPage({
  hero,
  actions = null,
  stats = null,
  children,
  contentStyle = {},
}) {
  return (
    <div style={styles.page}>
      {hero ? <div style={styles.heroWrap}>{hero}</div> : null}
      {actions ? <div style={styles.actionsWrap}>{actions}</div> : null}
      {stats ? <div style={styles.statsWrap}>{stats}</div> : null}

      <div style={{ ...styles.content, ...contentStyle }}>{children}</div>
    </div>
  );
}

const styles = {
  page: {
    width: "100%",
    minWidth: 0,
    display: "grid",
    gap: "18px",
    boxSizing: "border-box",
  },

  heroWrap: {
    width: "100%",
    minWidth: 0,
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
    width: "100%",
    minWidth: 0,
    display: "grid",
    gap: "18px",
    boxSizing: "border-box",
  },
};