import './logistics-packaging-layout.css';

export function LogisticsPackagingLayout({ title, subtitle, actions, children }) {
  return (
    <div className="lp-layout">
      <div className="lp-layout__hero">
        <div className="lp-layout__hero-content">
          <div className="lp-layout__eyebrow">Lojistik</div>
          <h1 className="lp-layout__title">{title}</h1>
          {subtitle ? <p className="lp-layout__subtitle">{subtitle}</p> : null}
        </div>

        {actions ? <div className="lp-layout__actions">{actions}</div> : null}
      </div>

      <div className="lp-layout__content">{children}</div>
    </div>
  );
}