export default function PageHeader({
  title,
  description,
  actions = null,
  badge = null,
}) {
  return (
    <div className="ui-page-header ui-page-header--ultra">
      <div className="ui-page-header__content">
        {badge ? <div className="ui-page-header__badge">{badge}</div> : null}
        <h1 className="ui-page-header__title">{title}</h1>
        {description ? (
          <p className="ui-page-header__description">{description}</p>
        ) : null}
      </div>

      {actions ? <div className="ui-page-header__actions">{actions}</div> : null}
    </div>
  );
}