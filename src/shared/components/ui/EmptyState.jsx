export default function EmptyState({
  title = "Kayıt bulunamadı",
  description = "Gösterilecek veri bulunmuyor.",
}) {
  return (
    <div className="ui-empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}