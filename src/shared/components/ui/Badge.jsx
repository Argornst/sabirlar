export default function Badge({
  children,
  tone = "default",
  size = "md",
  className = "",
  ...props
}) {
  return (
    <span
      className={[
        "ui-status-badge",
        `ui-status-badge--${tone}`,
        size !== "md" ? `ui-status-badge--${size}` : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
