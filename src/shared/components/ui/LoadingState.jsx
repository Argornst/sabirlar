export default function LoadingState({
  title = "Yükleniyor...",
  description = "Veriler hazırlanıyor.",
}) {
  return (
    <div className="ui-loading-state">
      <div className="ui-loading-state__spinner" />
      <div className="ui-loading-state__content">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
    </div>
  );
}