export default function StatusBadge({ children, tone = "default" }) {
  return (
    <span className={`ui-status-badge ui-status-badge--${tone}`}>
      {children}
    </span>
  );
}