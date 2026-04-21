import Badge from "./Badge";

export default function StatusBadge({ children, tone = "default", className = "" }) {
  return (
    <Badge tone={tone} className={className}>
      {children}
    </Badge>
  );
}
