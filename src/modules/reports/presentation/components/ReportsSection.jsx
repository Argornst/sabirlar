export default function ReportsSection({
  title,
  description,
  actions = null,
  children,
}) {
  return (
    <section className="production-card reports-section">
      <div className="production-card__header reports-section__header">
        <div>
          <h3 className="production-card__title">{title}</h3>
          {description ? (
            <p className="production-card__subtitle">{description}</p>
          ) : null}
        </div>

        {actions ? (
          <div className="reports-section__actions">{actions}</div>
        ) : null}
      </div>

      {children}
    </section>
  );
}