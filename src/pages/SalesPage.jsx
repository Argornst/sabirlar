import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SalesTableSkeleton from "../presentation/components/common/SalesTableSkeleton";
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

const STATUS_OPTIONS = ["beklemede", "onaylandi", "faturalandi", "iptal"];

export default function SalesPage({
  filteredSales,
  loadingSales,
  isAdmin,
  isOperasyon,
  onEditSale,
  onDeleteSale,
  onStatusChange,
}) {
  const navigate = useNavigate();

  const stats = useMemo(() => {
    return {
      total: filteredSales.length,
      totalAmount: filteredSales.reduce(
        (sum, sale) => sum + Number(sale.total_amount || 0),
        0
      ),
      pending: filteredSales.filter((sale) => sale.status === "beklemede")
        .length,
      invoiced: filteredSales.filter((sale) => sale.status === "faturalandi")
        .length,
    };
  }, [filteredSales]);

  return (
    <div style={styles.page}>
      <style>{`
        .sales-table-wrap::-webkit-scrollbar {
          height: 10px;
        }

        .sales-table-wrap::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }

        .sales-table thead th {
          position: sticky;
          top: 0;
          z-index: 3;
          backdrop-filter: blur(8px);
        }

        .sales-row {
          transition: transform 0.16s ease, box-shadow 0.18s ease, background 0.18s ease;
        }

        .sales-row:hover td {
          background: #eef6ff !important;
        }

        .sales-row:active {
          transform: scale(0.998);
        }

        @media (max-width: 720px) {
          .sales-hero-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 520px) {
          .sales-hero-stats {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <PageHero
        kicker="Satış operasyonu"
        title={
          isAdmin || isOperasyon
            ? "Tüm Satış Kayıtları"
            : "Kendi Satış Kayıtların"
        }
        subtitle="Kayıtları görüntüle, düzenle, durum değiştir ve operasyonu takip et."
        variant="blue"
      >
        <div className="sales-hero-stats" style={styles.heroStatsGrid}>
          <HeroMiniStat label="Toplam Kayıt" value={stats.total} />
          <HeroMiniStat
            label="Toplam Tutar"
            value={formatMoney(stats.totalAmount)}
          />
          <HeroMiniStat label="Beklemede" value={stats.pending} />
          <HeroMiniStat label="Faturalandı" value={stats.invoiced} />
        </div>
      </PageHero>

      <div style={styles.metricsGrid}>
        <MetricCard
          title="Toplam Kayıt"
          value={stats.total}
          subtitle="Filtrelenen satış satırı"
          tone="blue"
        />
        <MetricCard
          title="Toplam Tutar"
          value={formatMoney(stats.totalAmount)}
          subtitle="Görüntülenen satış toplamı"
          tone="green"
        />
        <MetricCard
          title="Bekleyen"
          value={stats.pending}
          subtitle="Onay veya işlem bekleyenler"
          tone="orange"
        />
        <MetricCard
          title="Faturalandı"
          value={stats.invoiced}
          subtitle="Tamamlanmış kayıtlar"
          tone="default"
        />
      </div>

      <SectionCard
        title="Satış Listesi"
        subtitle="Tüm kayıtlar aşağıda listeleniyor."
        rightContent={<div style={styles.tableBadge}>{filteredSales.length} kayıt</div>}
      >
        {loadingSales ? (
          <SalesTableSkeleton />
        ) : (
          <div className="sales-table-wrap" style={styles.tableWrapper}>
            <table className="sales-table" style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Tarih</th>
                  <th style={styles.th}>Müşteri</th>
                  <th style={styles.th}>Ürün</th>
                  <th style={styles.th}>Miktar</th>
                  <th style={styles.th}>Birim Fiyat</th>
                  <th style={styles.th}>Toplam</th>
                  <th style={styles.th}>Durum</th>
                  {isAdmin && <th style={styles.th}>İşlem</th>}
                </tr>
              </thead>

              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="sales-row">
                    <td style={styles.td}>{sale.sale_date}</td>
                    <td style={styles.tdStrong}>{sale.customer_name}</td>
                    <td style={styles.td}>{sale.products?.name || "-"}</td>
                    <td style={styles.td}>
                      {sale.quantity} {sale.unit}
                    </td>
                    <td style={styles.td}>{formatMoney(sale.unit_price)}</td>
                    <td style={styles.tdStrong}>
                      {formatMoney(sale.total_amount)}
                    </td>
                    <td style={styles.td}>
                      {isAdmin ? (
                        <select
                          style={styles.statusSelect}
                          value={sale.status}
                          onChange={(e) =>
                            onStatusChange(sale.id, e.target.value)
                          }
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span style={getStatusBadgeStyle(sale.status)}>
                          {sale.status}
                        </span>
                      )}
                    </td>

                    {isAdmin && (
                      <td style={styles.td}>
                        <div style={styles.actionRow}>
                          <button
                            type="button"
                            style={styles.editButton}
                            onClick={() => onEditSale(sale, navigate)}
                          >
                            Düzenle
                          </button>

                          <button
                            type="button"
                            style={styles.deleteButton}
                            onClick={() => onDeleteSale(sale.id)}
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSales.length === 0 && (
              <div style={styles.empty}>Gösterilecek kayıt bulunamadı.</div>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function HeroMiniStat({ label, value }) {
  return (
    <div style={styles.heroMiniCard}>
      <div style={styles.heroMiniLabel}>{label}</div>
      <div style={styles.heroMiniValue}>{value}</div>
    </div>
  );
}

function getStatusBadgeStyle(status) {
  const base = {
    display: "inline-block",
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
    textTransform: "capitalize",
  };

  switch (status) {
    case "beklemede":
      return { ...base, background: "#fff7ed", color: "#c2410c" };
    case "onaylandi":
      return { ...base, background: "#eff6ff", color: "#1d4ed8" };
    case "faturalandi":
      return { ...base, background: "#ecfdf5", color: "#047857" };
    case "iptal":
      return { ...base, background: "#fef2f2", color: "#b91c1c" };
    default:
      return { ...base, background: "#f1f5f9", color: "#334155" };
  }
}

const styles = {
  page: {
    display: "grid",
    gap: "20px",
  },

  heroStatsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "14px",
  },
  heroMiniCard: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "22px",
    padding: "16px",
    backdropFilter: "blur(10px)",
  },
  heroMiniLabel: {
    color: "#bfdbfe",
    fontSize: "12px",
    fontWeight: 800,
    marginBottom: "10px",
  },
  heroMiniValue: {
    color: "#ffffff",
    fontSize: "26px",
    fontWeight: 900,
    lineHeight: 1.05,
  },

  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
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
    maxHeight: "560px",
    borderRadius: "18px",
  },
  table: {
    width: "100%",
    minWidth: "960px",
    borderCollapse: "separate",
    borderSpacing: "0 10px",
  },
  th: {
    textAlign: "left",
    padding: "12px 14px",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    background: "rgba(255,255,255,0.92)",
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

  statusSelect: {
    padding: "10px 12px",
    borderRadius: "12px",
    border: "1px solid #dbe4ef",
    background: "#fff",
    fontSize: "13px",
    fontWeight: 700,
    color: "#334155",
  },

  actionRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  editButton: {
    border: "none",
    borderRadius: "12px",
    padding: "10px 12px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "#fff",
    fontSize: "12px",
    fontWeight: 800,
    cursor: "pointer",
  },
  deleteButton: {
    border: "none",
    borderRadius: "12px",
    padding: "10px 12px",
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "#fff",
    fontSize: "12px",
    fontWeight: 800,
    cursor: "pointer",
  },

  empty: {
    padding: "26px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px",
  },
};