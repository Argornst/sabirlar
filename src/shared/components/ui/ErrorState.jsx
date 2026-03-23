export default function ErrorState({
  title = "Bir hata oluştu",
  description = "İşlem tamamlanamadı.",
}) {
  return (
    <div className="ui-error-state">
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}