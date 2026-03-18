import { useMemo, useState } from "react";
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

function getSaleFlags(status) {
  switch (status) {
    case "odendi":
      return { paid: true, invoiced: false };
    case "faturalandi":
      return { paid: false, invoiced: true };
    case "odendi_faturalandi":
      return { paid: true, invoiced: true };
    case "beklemede":
    default:
      return { paid: false, invoiced: false };
  }
}

function getStatusSummary(status) {
  const { paid, invoiced } = getSaleFlags(status);

  if (paid && invoiced) return "Ödendi • Faturalandı";
  if (paid) return "Ödendi";
  if (invoiced) return "Faturalandı";
  return "Beklemede";
}

export default function SalesPage({
  filteredSales,
  loadingSales,
  isAdmin,
  isOperasyon,
  onEditSale,
  onDeleteSale,
  onTogglePaid,
  onToggleInvoiced,
  pendingSaleActionIds = [],
}) {
  const navigate = useNavigate();
  const [progressFilter, setProgressFilter] = useState("all");
  const [datePreset, setDatePreset] = useState("all");

  const stats = useMemo(() => {
    return {
      total: filteredSales.length,
      totalAmount: filteredSales.reduce(
        (sum, sale) => sum + Number(sale.total_amount || 0),
        0
      ),
      paidCount: filteredSales.filter((sale) => getSaleFlags(sale.status).paid)
        .length,
      invoicedCount: filteredSales.filter(
        (sale) => getSaleFlags(sale.status).invoiced
      ).length,
    };
  }, [filteredSales]);

  const visibleSales = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? 6 : day - 1;
    startOfWeek.setDate(startOfWeek.getDate() - diff);
    const weekStartStr = startOfWeek.toISOString().slice(0, 10);

    const monthStartStr = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-01`;

    return filteredSales.filter((sale) => {
      const flags = getSaleFlags(sale.status);

      const matchesProgress =
        progressFilter === "all"
          ? true
          : progressFilter === "pending"
          ? !flags.paid && !flags.invoiced
          : progressFilter === "paid"
          ? flags.paid
          : progressFilter === "invoiced"
          ? flags.invoiced
          : progressFilter === "completed"
          ? flags.paid && flags.invoiced
          : true;

      const matchesDate =
        datePreset === "all"
          ? true
          : datePreset === "today"
          ? sale.sale_date === todayStr
          : datePreset === "week"
          ? sale.sale_date >= weekStartStr
          : datePreset === "month"
          ? sale.sale_date >= monthStartStr
          : true;

      return matchesProgress && matchesDate;
    });
  }, [filteredSales, progressFilter, datePreset]);

  const visibleStats = useMemo(() => {
    return {
      total: visibleSales.length,
      totalAmount: visibleSales.reduce(
        (sum, sale) => sum + Number(sale.total_amount || 0),
        0
      ),
      paidCount: visibleSales.filter((sale) => getSaleFlags(sale.status).paid)
        .length,
      invoicedCount: visibleSales.filter(
        (sale) => getSaleFlags(sale.status).invoiced
      ).length,
    };
  }, [visibleSales]);

  if (loadingSales) {
    return <SalesTableSkeleton rows={8} />;
  }

  return (
    <div style={styles.page}>
      <style>{`
        @media (max-width: 1024px) {
          .sales-hero-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .sales-toolbar {
            grid-template-columns: 1fr !important;
          }

          .sales-toolbar-right {
            justify-content: flex-start !important;
          }
        }

        @media (max-width: 640px) {
          .sales-hero-stats {
            grid-template-columns: 1fr !important;
          }

          .sales-toolbar-left {
            flex-direction: column !important;
            align-items: stretch !important;
          }

          .sales-toolbar-right {
            width: 100%;
          }

          .sales-new-button {
            width: 100%;
            justify-content: center;
          }

          .sales-filter-chips,
          .sales-date-chips {
            flex-wrap: wrap;
          }
        }

        .sales-table-wrap {
          overflow: auto;
          max-height: 70vh;
          border-radius: 22px;
          border: 1px solid rgba(226,232,240,1);
          background: rgba(255,255,255,0.72);
        }

        .sales-row:hover td {
          background: rgba(248,250,252,0.95) !important;
        }

        .sales-check-input {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .sales-check-input:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }
      `}</style>

      <PageHero
        kicker="Satış operasyonu"
        title="Satışlar"
        subtitle="Kayıtları yönetin, ödeme ve fatura durumlarını hızlıca işaretleyin."
        variant="blue"
      />

      <div className="sales-hero-stats" style={styles.heroStatsGrid}>
        <HeroMiniStat label="Toplam Kayıt" value={visibleStats.total} />
        <HeroMiniStat
          label="Toplam Tutar"
          value={formatMoney(visibleStats.totalAmount)}
        />
        <HeroMiniStat label="Ödendi" value={visibleStats.paidCount} />
        <HeroMiniStat label="Faturalandı" value={visibleStats.invoicedCount} />
      </div>

      <div style={styles.metricsGrid}>
        <MetricCard
          title="Tüm Satışlar"
          value={stats.total}
          subtitle="Filtre öncesi toplam kayıt"
        />
        <MetricCard
          title="Toplam Hacim"
          value={formatMoney(stats.totalAmount)}
          subtitle="Filtre öncesi toplam satış tutarı"
        />
        <MetricCard
          title="Ödenenler"
          value={stats.paidCount}
          subtitle="Ödeme alınan kayıtlar"
        />
        <MetricCard
          title="Faturalananlar"
          value={stats.invoicedCount}
          subtitle="Fatura kesilen kayıtlar"
        />
      </div>

      <SectionCard
        title="Satış Listesi"
        subtitle="Kayıtlar üzerinde hızlı operasyon yapın"
        rightContent={<div style={styles.tableBadge}>{visibleSales.length} kayıt</div>}
      >
        <div className="sales-toolbar" style={styles.toolbar}>
          <div className="sales-toolbar-left" style={styles.toolbarLeft}>
            <div style={styles.toolbarGroup}>
              <div style={styles.toolbarLabel}>Süreç</div>
              <div className="sales-filter-chips" style={styles.filterChips}>
                <button
                  type="button"
                  onClick={() => setProgressFilter("all")}
                  style={
                    progressFilter === "all"
                      ? styles.filterChipActive
                      : styles.filterChip
                  }
                >
                  Tümü
                </button>

                <button
                  type="button"
                  onClick={() => setProgressFilter("pending")}
                  style={
                    progressFilter === "pending"
                      ? styles.filterChipActive
                      : styles.filterChip
                  }
                >
                  Beklemede
                </button>

                <button
                  type="button"
                  onClick={() => setProgressFilter("paid")}
                  style={
                    progressFilter === "paid"
                      ? styles.filterChipActive
                      : styles.filterChip
                  }
                >
                  Ödendi
                </button>

                <button
                  type="button"
                  onClick={() => setProgressFilter("invoiced")}
                  style={
                    progressFilter === "invoiced"
                      ? styles.filterChipActive
                      : styles.filterChip
                  }
                >
                  Faturalandı
                </button>

                <button
                  type="button"
                  onClick={() => setProgressFilter("completed")}
                  style={
                    progressFilter === "completed"
                      ? styles.filterChipActive
                      : styles.filterChip
                  }
                >
                  Tamamlandı
                </button>
              </div>
            </div>

            <div style={styles.toolbarGroup}>
              <div style={styles.toolbarLabel}>Hızlı Tarih</div>
              <div className="sales-date-chips" style={styles.filterChips}>
                <button
                  type="button"
                  onClick={() => setDatePreset("all")}
                  style={
                    datePreset === "all"
                      ? styles.filterChipActive
                      : styles.filterChip
                  }
                >
                  Tümü
                </button>

                <button
                  type="button"
                  onClick={() => setDatePreset("today")}
                  style={
                    datePreset === "today"
                      ? styles.filterChipActive
                      : styles.filterChip
                  }
                >
                  Bugün
                </button>

                <button
                  type="button"
                  onClick={() => setDatePreset("week")}
                  style={
                    datePreset === "week"
                      ? styles.filterChipActive
                      : styles.filterChip
                  }
                >
                  Bu Hafta
                </button>

                <button
                  type="button"
                  onClick={() => setDatePreset("month")}
                  style={
                    datePreset === "month"
                      ? styles.filterChipActive
                      : styles.filterChip
                  }
                >
                  Bu Ay
                </button>
              </div>
            </div>
          </div>

          <div className="sales-toolbar-right" style={styles.toolbarRight}>
            <button
              type="button"
              className="sales-new-button"
              onClick={() => navigate("/new-sale")}
              style={styles.newButton}
            >
              + Yeni Satış
            </button>
          </div>
        </div>

        <div className="sales-table-wrap">
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Tarih</th>
                <th style={styles.th}>Müşteri</th>
                <th style={styles.th}>Ürün</th>
                <th style={styles.th}>Miktar</th>
                <th style={styles.th}>Birim Fiyat</th>
                <th style={styles.th}>Toplam</th>
                <th style={styles.th}>Ödendi</th>
                <th style={styles.th}>Faturalandı</th>
                <th style={styles.th}>Durum Özeti</th>
                <th style={styles.th}>İşlem</th>
              </tr>
            </thead>

            <tbody>
              {visibleSales.map((sale) => {
                const flags = getSaleFlags(sale.status);
                const isPending = pendingSaleActionIds.includes(sale.id);

                return (
                  <tr key={sale.id} className="sales-row" style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.dateCell}>{sale.sale_date}</div>
                    </td>

                    <td style={styles.tdStrong}>{sale.customer_name}</td>

                    <td style={styles.td}>
                      <div style={styles.productName}>{sale.products?.name || "-"}</div>
                    </td>

                    <td style={styles.td}>
                      {sale.quantity} {sale.unit || ""}
                    </td>

                    <td style={styles.td}>{formatMoney(sale.unit_price)}</td>

                    <td style={styles.tdStrong}>{formatMoney(sale.total_amount)}</td>

                    <td style={styles.tdCenter}>
                      <label style={styles.checkWrap}>
                        <input
                          className="sales-check-input"
                          type="checkbox"
                          checked={flags.paid}
                          disabled={!isAdmin || isPending}
                          onChange={() => onTogglePaid(sale)}
                        />
                      </label>
                    </td>

                    <td style={styles.tdCenter}>
                      <label style={styles.checkWrap}>
                        <input
                          className="sales-check-input"
                          type="checkbox"
                          checked={flags.invoiced}
                          disabled={!isAdmin || isPending}
                          onChange={() => onToggleInvoiced(sale)}
                        />
                      </label>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.statusCell}>
                        <span style={getStatusBadgeStyle(sale.status)}>
                          {getStatusSummary(sale.status)}
                        </span>

                        {isPending && (
                          <span style={styles.inlineSaving}>
                            <span style={styles.inlineSavingDot} />
                            Güncelleniyor
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.actionRow}>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => onEditSale(sale, navigate)}
                            style={styles.editButton}
                            disabled={isPending}
                          >
                            Düzenle
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => onDeleteSale(sale.id)}
                            style={styles.deleteButton}
                            disabled={isPending}
                          >
                            Sil
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {visibleSales.length === 0 && (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>▣</div>
              <div style={styles.emptyTitle}>Gösterilecek kayıt bulunamadı</div>
              <div style={styles.emptyText}>
                Seçilen filtrelere uygun satış kaydı yok. Filtreleri genişletip tekrar
                deneyin.
              </div>
            </div>
          )}
        </div>
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
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
    whiteSpace: "nowrap",
    border: "1px solid transparent",
  };

  switch (status) {
    case "odendi":
      return {
        ...base,
        background: "#f5f3ff",
        color: "#6d28d9",
        borderColor: "#c4b5fd",
      };
    case "faturalandi":
      return {
        ...base,
        background: "#eff6ff",
        color: "#1d4ed8",
        borderColor: "#93c5fd",
      };
    case "odendi_faturalandi":
      return {
        ...base,
        background: "#ecfdf5",
        color: "#047857",
        borderColor: "#86efac",
      };
    case "beklemede":
    default:
      return {
        ...base,
        background: "#fff7ed",
        color: "#c2410c",
        borderColor: "#fdba74",
      };
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
    background:
      "linear-gradient(180deg, rgba(15,23,42,0.18) 0%, rgba(15,23,42,0.10) 100%)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "22px",
    padding: "18px",
    backdropFilter: "blur(10px)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14)",
  },

  heroMiniLabel: {
    color: "#dbeafe",
    fontSize: "12px",
    fontWeight: 800,
    marginBottom: "10px",
  },

  heroMiniValue: {
    color: "#ffffff",
    fontSize: "26px",
    fontWeight: 900,
    lineHeight: 1.05,
    textShadow: "0 1px 2px rgba(15,23,42,0.22)",
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

  toolbar: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "16px",
    alignItems: "center",
    marginBottom: "18px",
    padding: "14px",
    borderRadius: "24px",
    background:
      "linear-gradient(180deg, rgba(248,250,252,0.92) 0%, rgba(255,255,255,0.78) 100%)",
    border: "1px solid rgba(226,232,240,1)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
  },

  toolbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },

  toolbarRight: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  toolbarGroup: {
    display: "grid",
    gap: "8px",
  },

  toolbarLabel: {
    color: "#64748b",
    fontSize: "11px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },

  filterChips: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  filterChip: {
    height: "38px",
    padding: "0 14px",
    borderRadius: "999px",
    border: "1px solid #e2e8f0",
    background: "rgba(255,255,255,0.76)",
    color: "#475569",
    fontWeight: 800,
    fontSize: "13px",
    cursor: "pointer",
  },

  filterChipActive: {
    height: "38px",
    padding: "0 14px",
    borderRadius: "999px",
    border: "1px solid rgba(147,197,253,1)",
    background:
      "linear-gradient(180deg, rgba(239,246,255,1) 0%, rgba(219,234,254,1) 100%)",
    color: "#1d4ed8",
    fontWeight: 800,
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(59,130,246,0.10)",
  },

  newButton: {
    height: "44px",
    padding: "0 18px",
    borderRadius: "14px",
    border: "1px solid rgba(59,130,246,0.16)",
    background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 800,
    boxShadow: "0 14px 30px rgba(37,99,235,0.20)",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
  },

  table: {
    width: "100%",
    minWidth: "1180px",
    borderCollapse: "separate",
    borderSpacing: 0,
  },

  th: {
    position: "sticky",
    top: 0,
    zIndex: 2,
    textAlign: "left",
    padding: "14px 16px",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    background: "rgba(248,250,252,0.98)",
    borderBottom: "1px solid rgba(226,232,240,1)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },

  tr: {
    background: "transparent",
  },

  td: {
    background: "rgba(255,255,255,0.78)",
    padding: "16px",
    fontSize: "14px",
    color: "#334155",
    borderBottom: "1px solid #eef2f7",
    verticalAlign: "middle",
  },

  tdCenter: {
    background: "rgba(255,255,255,0.78)",
    padding: "16px",
    fontSize: "14px",
    color: "#334155",
    borderBottom: "1px solid #eef2f7",
    verticalAlign: "middle",
    textAlign: "center",
  },

  tdStrong: {
    background: "rgba(255,255,255,0.78)",
    padding: "16px",
    fontSize: "14px",
    color: "#0f172a",
    fontWeight: 800,
    borderBottom: "1px solid #eef2f7",
    verticalAlign: "middle",
  },

  dateCell: {
    color: "#334155",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  productName: {
    color: "#0f172a",
    fontWeight: 800,
  },

  checkWrap: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },

  statusCell: {
    display: "grid",
    gap: "8px",
    alignItems: "start",
  },

  inlineSaving: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 700,
  },

  inlineSavingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "999px",
    background: "#3b82f6",
    boxShadow: "0 0 0 4px rgba(59,130,246,0.12)",
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
    padding: "34px 24px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px",
  },

  emptyIcon: {
    width: "56px",
    height: "56px",
    margin: "0 auto 16px",
    borderRadius: "18px",
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg, rgba(239,246,255,1) 0%, rgba(248,250,252,1) 100%)",
    border: "1px solid rgba(219,234,254,1)",
    color: "#3b82f6",
    fontWeight: 900,
    fontSize: "24px",
  },

  emptyTitle: {
    color: "#0f172a",
    fontSize: "20px",
    fontWeight: 900,
    marginBottom: "8px",
    letterSpacing: "-0.02em",
  },

  emptyText: {
    maxWidth: "460px",
    margin: "0 auto",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.7,
  },
};