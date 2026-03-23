import { formatCurrency } from "../../../../shared/utils/currency";

export default function ReportsHero({ summary }) {
  return (
    <div className="reports-hero">
      <div className="reports-hero__content">
        <span className="reports-hero__eyebrow">Rapor Merkezi</span>
        <h2>Performans verileri ve dağılımlar</h2>
        <p>
          Finansal toplamlar, stok görünümü ve kullanıcı bazlı genel yoğunluk
          tek merkezden izlenir.
        </p>
      </div>

      <div className="reports-hero__stats">
        <div className="reports-hero__stat">
          <span>Toplam Ciro</span>
          <strong>{formatCurrency(summary.totalRevenue ?? 0, "TRY")}</strong>
        </div>

        <div className="reports-hero__stat">
          <span>Toplam Stok</span>
          <strong>{summary.totalStock ?? 0}</strong>
        </div>

        <div className="reports-hero__stat">
          <span>Aktif Kullanıcı</span>
          <strong>{summary.activeUsers ?? 0}</strong>
        </div>
      </div>
    </div>
  );
}