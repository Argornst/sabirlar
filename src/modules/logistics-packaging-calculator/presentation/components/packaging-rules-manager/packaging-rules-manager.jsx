import './packaging-rules-manager.css';

export function PackagingRulesManager() {
  return (
    <div className="lp-panel">
      <div className="lp-section-heading">
        <div>
          <h3 className="lp-section-heading__title">Ürün Paketleme Kuralları</h3>
          <p className="lp-section-heading__description">
            Bu ekran bir sonraki fazda ürün bazlı izinli palet / kutu / varil / torba
            kombinasyonlarını yönetmek için genişletilecek.
          </p>
        </div>
      </div>

      <div className="lp-empty-state">
        Kural yönetimi altyapısı domain ve repository katmanında hazırlandı. İkinci fazda
        yönetim ekranı detaylandırılabilir.
      </div>
    </div>
  );
}