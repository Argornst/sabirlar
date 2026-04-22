export default function PageHeader({
  title,
  description,
  actions = null,
  badge = null,
  eyebrow = null,
  variant = "default",
}) {
  // eyebrow takes precedence: if both are passed, badge is suppressed
  const visibleBadge = eyebrow ? null : badge;

  return (
    <div className={[
      "ui-page-header",
      "ui-page-header--ultra",
      "ui-page-header--premium",
      variant === "hero" ? "ui-page-header--hero" : "",
    ].filter(Boolean).join(" ")}>
      <div className="ui-page-header__content">
        {eyebrow ? (
          <div className="ui-page-header__eyebrow">
            {eyebrow}
          </div>
        ) : null}

        {visibleBadge ? (
          <div className="ui-page-header__badge ui-page-header__badge--premium">
            {visibleBadge}
          </div>
        ) : null}

        <h1 className="ui-page-header__title">
          {title}
        </h1>

        {description ? (
          <p className="ui-page-header__description">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="ui-page-header__actions ui-page-header__actions--premium">
          {actions}
        </div>
      ) : null}
    </div>
  );
}