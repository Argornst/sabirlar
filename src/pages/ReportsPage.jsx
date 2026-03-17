import InlineLoader from "../presentation/components/common/InLineLoader";
import PageHero from "../presentation/components/ui/PageHero";
import MetricCard from "../presentation/components/ui/MetricCard";
import SectionCard from "../presentation/components/ui/SectionCard";

function formatMoney(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export default function ReportsPage({
  filterStartDate,
  setFilterStartDate,
  filterEndDate,
  setFilterEndDate,
  search,
  setSearch,
  filteredSales,
  totalSalesAmount,
  pendingCount,
  invoicedCount,
  onExportCsv,
  onExportExcel,
  onExportPdf,
  loadingReports = false,
}) {
  return (
    <div style={styles.page}>
      <PageHero
        kicker="Rapor merkezi"
        title="Raporlar"
        subtitle="Filtreleri kullanarak satış hareketlerini analiz et ve dışa aktar."
        variant="indigo"
      />

      <div style={styles.metricsGrid}>
        <MetricCard
          title="Kayıt Sayısı"
          value={filteredSales.length}
          subtitle="Filtreye uyan toplam satış"
          tone="blue"
        />
        <MetricCard
          title="Toplam Tutar"
          value={formatMoney(totalSalesAmount)}
          subtitle="Seçili aralıktaki toplam tutar"
          tone="green"
        />
        <MetricCard
          title="Beklemede"
          value={pendingCount}
          subtitle="İşlem bekleyen satışlar"
          tone="orange"
        />
        <MetricCard
          title="Faturalandı"
          value={invoicedCount}
          subtitle="Tamamlanmış satışlar"
          tone="default"
        />
      </div>

      <SectionCard
        title="Filtreler ve Dışa Aktarma"
        subtitle="Tarih aralığı ve arama kriterleri ile sonuçları daralt."
      >
        <div style={styles.toolbarGrid}>
          <div style={styles.field}>
            <label style={styles.label}>Başlangıç Tarihi</label>
            <input
              style={styles.input}
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Bitiş Tarihi</label>
            <input
              style={styles.input}
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Arama</label>
            <input
              style={styles.input}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Müşteri, ürün, tarih, durum..."
            />
          </div>

          <div style={styles.actionWrap}>
            <button type="button" style={styles.exportPrimaryButton} onClick={onExportCsv}>
              CSV
            </button>
            <button
              type="button"
              style={styles.exportSecondaryButton}
              onClick={onExportExcel}
            >
              Excel
            </button>
            <button
              type="button"
              style={styles.exportSecondaryButton}
              onClick={onExportPdf}
            >
              PDF
            </button>
          </div>
        </div>

        {loadingReports && (
          <div style={styles.loaderWrap}>
            <InlineLoader label="Rapor verileri güncelleniyor..." />
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Filtrelenmiş Kayıtlar"
        subtitle="Seçtiğin kriterlere göre listelenen satışlar"
        rightContent={
          <div style={styles.tableBadge}>{filteredSales.length} kayıt</div>
        }
      >
        <div className="reports-table-wrap" style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Tarih</th>
                <th style={styles.th}>Müşteri</th>
                <th style={styles.th}>Ürün</th>
                <th style={styles.th}>Miktar</th>
                <th style={styles.th}>Toplam</th>
                <th style={styles.th}>Durum</th>
              </tr>
            </thead>

            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id}>
                  <td style={styles.td}>{sale.sale_date}</td>
                  <td style={styles.tdStrong}>{sale.customer_name}</td>
                  <td style={styles.td}>{sale.products?.name || "-"}</td>
                  <td style={styles.td}>
                    {sale.quantity} {sale.unit}
                  </td>
                  <td style={styles.tdStrong}>
                    {formatMoney(sale.total_amount)}
                  </td>
                  <td style={styles.td}>{sale.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSales.length === 0 && (
            <div style={styles.empty}>
              Seçilen filtrelere uygun kayıt bulunamadı.
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

const styles = {
  page: {
    display: "grid",
    gap: "20px",
  },

  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },

  toolbarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "14px",
    alignItems: "end",
  },
  field: {
    display: "grid",
    gap: "8px",
  },
  label: {
    color: "#334155",
    fontSize: "13px",
    fontWeight: 800,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    borderRadius: "16px",
    border: "1px solid #dbe4ef",
    background: "#fff",
    padding: "14px 16px",
    fontSize: "14px",
    color: "#0f172a",
  },

  actionWrap: {
    display: "grid",
    gap: "10px",
  },
  exportPrimaryButton: {
    border: "none",
    borderRadius: "18px",
    padding: "16px",
    background: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 900,
    cursor: "pointer",
  },
  exportSecondaryButton: {
    border: "1px solid #dbe4ef",
    borderRadius: "18px",
    padding: "16px",
    background: "#ffffff",
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: 900,
    cursor: "pointer",
  },
  loaderWrap: {
    marginTop: "14px",
  },

  tableBadge: {
    padding: "10px 14px",
    borderRadius: "999px",
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    color: "#334155",
    fontWeight: 800,
    fontSize: "12px",
  },

  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    minWidth: "820px",
    borderCollapse: "separate",
    borderSpacing: "0 10px",
  },
  th: {
    textAlign: "left",
    padding: "0 14px 8px 14px",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  td: {
    background: "#f8fafc",
    padding: "16px 14px",
    fontSize: "14px",
    color: "#334155",
    borderTop: "1px solid #eef2f7",
    borderBottom: "1px solid #eef2f7",
  },
  tdStrong: {
    background: "#f8fafc",
    padding: "16px 14px",
    fontSize: "14px",
    color: "#0f172a",
    fontWeight: 800,
    borderTop: "1px solid #eef2f7",
    borderBottom: "1px solid #eef2f7",
  },

  empty: {
    padding: "26px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px",
  },
};