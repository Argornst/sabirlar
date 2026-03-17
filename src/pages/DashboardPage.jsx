import { useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { ROUTES } from "../shared/constants/routes";
import DashboardSkeleton from "../presentation/components/common/DashboardSkeleton";
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

function isToday(dateString) {
  if (!dateString) return false;

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  return dateString === `${yyyy}-${mm}-${dd}`;
}

function formatTodayLabel() {
  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export default function DashboardPage({ sales = [], loading = false }) {
  const { profile } = useOutletContext() || {};
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const totalSales = sales.length;
    const totalRevenue = sales.reduce(
      (sum, sale) => sum + Number(sale.total_amount || 0),
      0
    );
    const todaySales = sales.filter((sale) => isToday(sale.sale_date)).length;
    const pendingCount = sales.filter(
      (sale) => sale.status === "beklemede"
    ).length;
    const approvedCount = sales.filter(
      (sale) => sale.status === "onaylandi"
    ).length;
    const invoicedCount = sales.filter(
      (sale) => sale.status === "faturalandi"
    ).length;
    const cancelledCount = sales.filter(
      (sale) => sale.status === "iptal"
    ).length;

    const grouped = sales.reduce((acc, sale) => {
      const key = sale.sale_date || "Bilinmiyor";
      acc[key] = (acc[key] || 0) + Number(sale.total_amount || 0);
      return acc;
    }, {});

    const trend = Object.entries(grouped)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .slice(-7);

    const maxTrendValue = Math.max(...trend.map(([, value]) => value), 1);

    return {
      totalSales,
      totalRevenue,
      todaySales,
      pendingCount,
      approvedCount,
      invoicedCount,
      cancelledCount,
      trend,
      maxTrendValue,
    };
  }, [sales]);

  const recentSales = useMemo(() => {
    return [...sales].slice(0, 6);
  }, [sales]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div style={styles.page}>
      <style>{`
        @media (max-width: 1100px) {
          .dashboard-main-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 720px) {
          .dashboard-hero-actions {
            grid-template-columns: 1fr !important;
          }

          .dashboard-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 520px) {
          .dashboard-stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <PageHero
        kicker="Genel görünüm"
        title={`Hoş geldin, ${profile?.full_name || "Kullanıcı"}.`}
        subtitle="Satış operasyonunun güncel durumu, kritik metrikler ve son hareketler burada."
        variant="blue"
        rightContent={
          <div style={styles.metaCard}>
            <div style={styles.metaLabel}>Bugün</div>
            <div style={styles.metaValue}>{formatTodayLabel()}</div>
            <div style={styles.roleBadge}>
              Rol: {profile?.roles?.name || "-"}
            </div>
          </div>
        }
      >
        <div className="dashboard-stats-grid" style={styles.heroStatsGrid}>
          <HeroMiniStat
            label="Toplam Ciro"
            value={formatMoney(stats.totalRevenue)}
          />
          <HeroMiniStat
            label="Toplam Satış"
            value={stats.totalSales}
          />
          <HeroMiniStat
            label="Bugünkü Kayıt"
            value={stats.todaySales}
          />
          <HeroMiniStat
            label="Bekleyen"
            value={stats.pendingCount}
          />
        </div>

        <div className="dashboard-hero-actions" style={styles.actionsGrid}>
          <button
            type="button"
            style={styles.primaryAction}
            onClick={() => navigate(ROUTES.NEW_SALE)}
          >
            + Yeni Satış Oluştur
          </button>

          <button
            type="button"
            style={styles.secondaryAction}
            onClick={() => navigate(ROUTES.SALES)}
          >
            Satışları Görüntüle
          </button>

          <button
            type="button"
            style={styles.secondaryAction}
            onClick={() => navigate(ROUTES.REPORTS)}
          >
            Raporları Aç
          </button>
        </div>
      </PageHero>

      <div style={styles.metricsGrid}>
        <MetricCard
          title="Toplam Satış"
          value={stats.totalSales}
          subtitle="Sistemdeki toplam kayıt"
          tone="blue"
        />
        <MetricCard
          title="Toplam Ciro"
          value={formatMoney(stats.totalRevenue)}
          subtitle="Filtrelenmiş satış toplamı"
          tone="green"
        />
        <MetricCard
          title="Bugünkü Satış"
          value={stats.todaySales}
          subtitle="Bugün açılan satış kaydı"
          tone="default"
        />
        <MetricCard
          title="Bekleyen İşlem"
          value={stats.pendingCount}
          subtitle="Aksiyon bekleyen satışlar"
          tone="orange"
        />
      </div>

      <div className="dashboard-main-grid" style={styles.mainGrid}>
        <SectionCard
          title="Son 7 Günlük Satış Trendi"
          subtitle="Günlük toplam tutar akışı"
        >
          <div style={styles.chartArea}>
            {stats.trend.length === 0 ? (
              <div style={styles.empty}>Grafik için yeterli veri yok.</div>
            ) : (
              <div style={styles.barGrid}>
                {stats.trend.map(([date, value]) => {
                  const height = Math.max(
                    (value / stats.maxTrendValue) * 180,
                    14
                  );

                  return (
                    <div key={date} style={styles.barItem}>
                      <div style={styles.barValue}>{formatMoney(value)}</div>
                      <div style={styles.barTrack}>
                        <div
                          style={{
                            ...styles.barFill,
                            height: `${height}px`,
                          }}
                        />
                      </div>
                      <div style={styles.barLabel}>{date.slice(5)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </SectionCard>

        <div style={styles.sideColumn}>
          <SectionCard title="Durum Dağılımı">
            <div style={styles.statusList}>
              <StatusRow
                label="Beklemede"
                value={stats.pendingCount}
                tone="warning"
              />
              <StatusRow
                label="Onaylandı"
                value={stats.approvedCount}
                tone="info"
              />
              <StatusRow
                label="Faturalandı"
                value={stats.invoicedCount}
                tone="success"
              />
              <StatusRow
                label="İptal"
                value={stats.cancelledCount}
                tone="danger"
              />
            </div>
          </SectionCard>

          <SectionCard title="Kısa Özet">
            <div style={styles.summaryText}>
              Toplam <strong>{stats.totalSales}</strong> satış kaydı bulunuyor.
              Mevcut toplam ciro{" "}
              <strong>{formatMoney(stats.totalRevenue)}</strong>. Bekleyen kayıt
              sayısı <strong>{stats.pendingCount}</strong>.
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard
        title="Son Satış Hareketleri"
        subtitle="En güncel 6 kayıt"
      >
        {recentSales.length === 0 ? (
          <div style={styles.empty}>Henüz satış kaydı yok.</div>
        ) : (
          <div style={styles.recentList}>
            {recentSales.map((sale) => (
              <div key={sale.id} style={styles.recentItem}>
                <div>
                  <div style={styles.recentCustomer}>
                    {sale.customer_name || "-"}
                  </div>
                  <div style={styles.recentMeta}>
                    {sale.products?.name || "-"} • {sale.sale_date || "-"}
                  </div>
                </div>

                <div style={styles.recentRight}>
                  <div style={styles.recentAmount}>
                    {formatMoney(sale.total_amount)}
                  </div>
                  <div style={styles.recentStatus}>{sale.status}</div>
                </div>
              </div>
            ))}
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

function StatusRow({ label, value, tone }) {
  const tones = {
    warning: { bg: "#fff7ed", color: "#c2410c" },
    info: { bg: "#eff6ff", color: "#1d4ed8" },
    success: { bg: "#ecfdf5", color: "#047857" },
    danger: { bg: "#fef2f2", color: "#b91c1c" },
  };

  return (
    <div style={styles.statusRow}>
      <span style={styles.statusLabel}>{label}</span>
      <span
        style={{
          ...styles.statusPill,
          background: tones[tone].bg,
          color: tones[tone].color,
        }}
      >
        {value}
      </span>
    </div>
  );
}

const styles = {
  page: {
    display: "grid",
    gap: "20px",
  },

  metaCard: {
    minWidth: "220px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "24px",
    padding: "16px",
    backdropFilter: "blur(10px)",
  },
  metaLabel: {
    fontSize: "12px",
    color: "#93c5fd",
    fontWeight: 800,
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  metaValue: {
    fontSize: "15px",
    color: "#f8fafc",
    fontWeight: 800,
    lineHeight: 1.5,
    marginBottom: "14px",
  },
  roleBadge: {
    display: "inline-block",
    padding: "10px 12px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.12)",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 800,
  },

  heroStatsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "14px",
    marginBottom: "18px",
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

  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 220px))",
    gap: "12px",
  },
  primaryAction: {
    border: "none",
    borderRadius: "18px",
    padding: "15px 18px",
    background: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 18px 36px rgba(59,130,246,0.22)",
  },
  secondaryAction: {
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "18px",
    padding: "15px 18px",
    background: "rgba(255,255,255,0.08)",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
    backdropFilter: "blur(10px)",
  },

  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.5fr 0.9fr",
    gap: "18px",
  },
  sideColumn: {
    display: "grid",
    gap: "18px",
  },

  chartArea: {
    minHeight: "260px",
    display: "grid",
    alignItems: "end",
  },
  barGrid: {
    minHeight: "240px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(72px, 1fr))",
    gap: "14px",
    alignItems: "end",
  },
  barItem: {
    display: "grid",
    gap: "10px",
    justifyItems: "center",
  },
  barValue: {
    fontSize: "11px",
    color: "#64748b",
    textAlign: "center",
  },
  barTrack: {
    width: "100%",
    maxWidth: "42px",
    height: "190px",
    borderRadius: "18px",
    background: "#ecf2f7",
    display: "flex",
    alignItems: "flex-end",
    padding: "4px",
  },
  barFill: {
    width: "100%",
    borderRadius: "14px",
    background: "linear-gradient(180deg, #3b82f6 0%, #10b981 100%)",
    boxShadow: "0 16px 24px rgba(16,185,129,0.18)",
    transition: "height 0.3s ease",
  },
  barLabel: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#334155",
  },

  statusList: {
    display: "grid",
    gap: "12px",
  },
  statusRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    padding: "12px 0",
    borderTop: "1px solid #f1f5f9",
  },
  statusLabel: {
    color: "#334155",
    fontWeight: 700,
    fontSize: "14px",
  },
  statusPill: {
    minWidth: "48px",
    textAlign: "center",
    padding: "8px 12px",
    borderRadius: "999px",
    fontWeight: 900,
    fontSize: "13px",
  },

  summaryText: {
    color: "#475569",
    fontSize: "14px",
    lineHeight: 1.8,
  },

  recentList: {
    display: "grid",
    gap: "12px",
  },
  recentItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    paddingTop: "14px",
    borderTop: "1px solid #f1f5f9",
  },
  recentCustomer: {
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: 800,
    marginBottom: "4px",
  },
  recentMeta: {
    color: "#64748b",
    fontSize: "13px",
  },
  recentRight: {
    textAlign: "right",
  },
  recentAmount: {
    color: "#0f172a",
    fontWeight: 900,
    fontSize: "14px",
    marginBottom: "4px",
  },
  recentStatus: {
    color: "#64748b",
    fontSize: "12px",
    textTransform: "capitalize",
  },

  empty: {
    padding: "24px 0",
    color: "#64748b",
    fontSize: "14px",
  },
};