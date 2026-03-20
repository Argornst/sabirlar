import { useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { ROUTES } from "../shared/constants/routes";
import DashboardSkeleton from "../presentation/components/common/DashboardSkeleton";
import PageHero from "../presentation/components/ui/PageHero";
import SectionCard from "../presentation/components/ui/SectionCard";
import PageReveal from "../presentation/components/ui/PageReveal";

function isToday(dateString) {
  if (!dateString) return false;

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  return dateString === `${yyyy}-${mm}-${dd}`;
}

function isThisMonth(dateString) {
  if (!dateString) return false;

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");

  return String(dateString).startsWith(`${yyyy}-${mm}`);
}

function formatTodayLabel() {
  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function formatShortDate(dateString) {
  if (!dateString) return "-";

  const [year, month, day] = String(dateString).split("-");
  return `${day}.${month}.${year}`;
}

function getStatusLabel(status) {
  switch (status) {
    case "odendi":
      return "Ödendi";
    case "faturalandi":
      return "Faturalandı";
    case "odendi_faturalandi":
      return "Ödendi + Faturalandı";
    case "beklemede":
    default:
      return "İşlem Yok";
  }
}

function getStatusTone(status) {
  switch (status) {
    case "odendi":
      return {
        color: "#1d4ed8",
        background: "rgba(59,130,246,0.12)",
        border: "1px solid rgba(59,130,246,0.14)",
      };
    case "faturalandi":
      return {
        color: "#047857",
        background: "rgba(16,185,129,0.14)",
        border: "1px solid rgba(16,185,129,0.14)",
      };
    case "odendi_faturalandi":
      return {
        color: "#6d28d9",
        background: "rgba(139,92,246,0.14)",
        border: "1px solid rgba(139,92,246,0.14)",
      };
    case "beklemede":
    default:
      return {
        color: "#c2410c",
        background: "rgba(249,115,22,0.14)",
        border: "1px solid rgba(249,115,22,0.14)",
      };
  }
}

export default function DashboardPage({ sales = [], loading = false }) {
  const { profile } = useOutletContext() || {};
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const todayCount = sales.filter((sale) => isToday(sale.sale_date)).length;

    const monthCount = sales.filter((sale) => isThisMonth(sale.sale_date)).length;

    const pendingCount = sales.filter((sale) => sale.status === "beklemede").length;

    const paidOnlyCount = sales.filter((sale) => sale.status === "odendi").length;

    const invoicedOnlyCount = sales.filter(
      (sale) => sale.status === "faturalandi"
    ).length;

    const completedCount = sales.filter(
      (sale) => sale.status === "odendi_faturalandi"
    ).length;

    const groupedByDate = sales.reduce((acc, sale) => {
      const key = sale.sale_date || "Bilinmiyor";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const trend = Object.entries(groupedByDate)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .slice(-7);

    const maxTrendValue = Math.max(...trend.map(([, value]) => value), 1);

    const trendTotal = trend.reduce((sum, [, value]) => sum + Number(value || 0), 0);
    const trendAverage = trend.length ? trendTotal / trend.length : 0;

    const topProductsMap = sales.reduce((acc, sale) => {
      const name = sale.products?.name || "Bilinmeyen Ürün";

      if (!acc[name]) {
        acc[name] = {
          name,
          quantity: 0,
        };
      }

      acc[name].quantity += Number(sale.quantity || 0);
      return acc;
    }, {});

    const topProducts = Object.values(topProductsMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      todayCount,
      monthCount,
      pendingCount,
      paidOnlyCount,
      invoicedOnlyCount,
      completedCount,
      trend,
      maxTrendValue,
      trendAverage,
      topProducts,
    };
  }, [sales]);

  const recentSales = useMemo(() => {
    return [...sales].slice(0, 5);
  }, [sales]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div style={styles.page}>
      <style>{`
        @media (max-width: 1240px) {
          .dashboard-premium-top-grid {
            grid-template-columns: 1fr !important;
          }

          .dashboard-premium-bottom-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 920px) {
          .dashboard-premium-summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .dashboard-premium-distribution-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .dashboard-premium-actions {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 560px) {
          .dashboard-premium-summary-grid {
            grid-template-columns: 1fr !important;
          }

          .dashboard-premium-distribution-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <PageHero
        kicker="Premium Control Center"
        title={`Hoş geldin, ${profile?.full_name || "Kullanıcı"}.`}
        subtitle="Verilen malzeme hareketlerinin güncel özeti, bekleyen işlemler ve son kayıtlar burada."
        variant="blue"
        rightContent={
          <div style={styles.rightPanel}>
            <div style={styles.rightPanelGlowOne} />
            <div style={styles.rightPanelGlowTwo} />

            <div style={styles.rightPanelLabel}>Sistem Özeti</div>
            <div style={styles.rightPanelDate}>{formatTodayLabel()}</div>

            <div style={styles.rightPanelMetaRow}>
              <div style={styles.rightMiniBox}>
                <div style={styles.rightMiniLabel}>Rol</div>
                <div style={styles.rightMiniValue}>{profile?.roles?.name || "-"}</div>
              </div>

              <div style={styles.rightMiniBox}>
                <div style={styles.rightMiniLabel}>Toplam Kayıt</div>
                <div style={styles.rightMiniValue}>{sales.length}</div>
              </div>
            </div>
          </div>
        }
      >
        <div className="dashboard-premium-summary-grid" style={styles.summaryGrid}>
          <PremiumStatCard
            label="Bugünkü Kayıt"
            value={stats.todayCount}
            hint="Bugün eklenen satış hareketi"
            tone="blue"
          />

          <PremiumStatCard
            label="Bu Ay Toplam"
            value={stats.monthCount}
            hint="Bu ay açılan kayıt sayısı"
            tone="green"
          />

          <PremiumStatCard
            label="Ödendi, Faturalanmadı"
            value={stats.paidOnlyCount}
            hint="Ödeme alındı, fatura bekliyor"
            tone="orange"
          />

          <PremiumStatCard
            label="Faturalandı, Ödenmedi"
            value={stats.invoicedOnlyCount}
            hint="Fatura var, ödeme bekliyor"
            tone="purple"
          />
        </div>

        <div className="dashboard-premium-actions" style={styles.actionsGrid}>
          <button
            type="button"
            style={styles.primaryAction}
            onClick={() => navigate(ROUTES.NEW_SALE)}
          >
            <span style={styles.actionAccent} />
            + Yeni Satış Oluştur
          </button>

          <button
            type="button"
            style={styles.secondaryAction}
            onClick={() => navigate(ROUTES.SALES)}
          >
            Satış Operasyonuna Git
          </button>
        </div>
      </PageHero>

      <div className="dashboard-premium-top-grid" style={styles.topGrid}>
        <PageReveal delay={120}>
          <SectionCard
            title="Son 7 Günlük Kayıt Trendi"
            subtitle={`Günlük ortalama: ${stats.trendAverage.toFixed(1)} kayıt`}
          >
            <div style={styles.chartShell}>
              {stats.trend.length === 0 ? (
                <PremiumEmpty text="Trend grafiği için yeterli veri yok." />
              ) : (
                <div style={styles.barGrid}>
                  {stats.trend.map(([date, value]) => {
                    const height = Math.max(
                      (value / stats.maxTrendValue) * 180,
                      18
                    );

                    return (
                      <div key={date} style={styles.barItem}>
                        <div style={styles.barValue}>{value} kayıt</div>

                        <div style={styles.barTrack}>
                          <div style={styles.barGlow} />
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
        </PageReveal>

        <PageReveal delay={180}>
          <SectionCard
            title="Durum Dağılımı"
            subtitle="İşlem akışının mevcut durumu"
          >
            <div
              className="dashboard-premium-distribution-grid"
              style={styles.distributionGrid}
            >
              <StatusMetric
                label="İşlem Yok"
                value={stats.pendingCount}
                tone="pending"
              />
              <StatusMetric
                label="Ödendi"
                value={stats.paidOnlyCount}
                tone="paid"
              />
              <StatusMetric
                label="Faturalandı"
                value={stats.invoicedOnlyCount}
                tone="invoiced"
              />
              <StatusMetric
                label="Tamamlandı"
                value={stats.completedCount}
                tone="completed"
              />
            </div>
          </SectionCard>
        </PageReveal>
      </div>

      <div className="dashboard-premium-bottom-grid" style={styles.bottomGrid}>
        <PageReveal delay={240}>
          <SectionCard title="Son Satış Hareketleri" subtitle="En yeni 5 kayıt">
            {recentSales.length === 0 ? (
              <PremiumEmpty text="Henüz satış hareketi görünmüyor." />
            ) : (
              <div style={styles.recentList}>
                {recentSales.map((sale) => {
                  const tone = getStatusTone(sale.status);

                  return (
                    <div key={sale.id} style={styles.recentItem}>
                      <div style={styles.recentStripe} />

                      <div style={styles.recentLeft}>
                        <div style={styles.recentCustomer}>
                          {sale.customer_name || "-"}
                        </div>
                        <div style={styles.recentMeta}>
                          {sale.products?.name || "-"} •{" "}
                          {formatShortDate(sale.sale_date)}
                        </div>
                      </div>

                      <div style={styles.recentRight}>
                        <div style={styles.recentAmount}>
                          {Number(sale.quantity || 0)} {sale.unit || ""}
                        </div>
                        <div
                          style={{
                            ...styles.recentStatus,
                            color: tone.color,
                            background: tone.background,
                            border: tone.border,
                          }}
                        >
                          {getStatusLabel(sale.status)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </PageReveal>

        <PageReveal delay={300}>
          <SectionCard
            title="En Çok Satılan Ürünler"
            subtitle="Miktara göre ilk 5 ürün"
          >
            {stats.topProducts.length === 0 ? (
              <PremiumEmpty text="Ürün bazlı görünüm için henüz veri yok." />
            ) : (
              <div style={styles.topProductsList}>
                {stats.topProducts.map((product, index) => (
                  <div key={product.name} style={styles.topProductItem}>
                    <div style={styles.topProductRank}>{index + 1}</div>

                    <div style={styles.topProductContent}>
                      <div style={styles.topProductName}>{product.name}</div>
                      <div style={styles.topProductMeta}>
                        En çok çıkan ürünlerden biri
                      </div>
                    </div>

                    <div style={styles.topProductRevenueWrap}>
                      <div style={styles.topProductRevenue}>
                        {product.quantity} adet
                      </div>
                      <div style={styles.topProductRevenueHint}>
                        Toplam miktar
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </PageReveal>
      </div>
    </div>
  );
}

function PremiumStatCard({ label, value, hint, tone = "blue" }) {
  const tones = {
    blue: {
      glow: "rgba(59,130,246,0.22)",
      accent: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
      shadow: "0 18px 40px rgba(59,130,246,0.16)",
    },
    green: {
      glow: "rgba(16,185,129,0.22)",
      accent: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
      shadow: "0 18px 40px rgba(16,185,129,0.16)",
    },
    orange: {
      glow: "rgba(249,115,22,0.22)",
      accent: "linear-gradient(135deg, #f97316 0%, #fb923c 100%)",
      shadow: "0 18px 40px rgba(249,115,22,0.16)",
    },
    purple: {
      glow: "rgba(139,92,246,0.22)",
      accent: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
      shadow: "0 18px 40px rgba(139,92,246,0.16)",
    },
  };

  const theme = tones[tone];

  return (
    <div style={{ ...styles.statCard, boxShadow: theme.shadow }}>
      <div style={{ ...styles.statCardGlow, background: theme.glow }} />
      <div style={{ ...styles.statCardAccent, background: theme.accent }} />
      <div style={styles.statCardLabel}>{label}</div>
      <div style={styles.statCardValue}>{value}</div>
      <div style={styles.statCardHint}>{hint}</div>
    </div>
  );
}

function StatusMetric({ label, value, tone }) {
  const tones = {
    pending: {
      glow: "rgba(249,115,22,0.12)",
      border: "1px solid rgba(249,115,22,0.18)",
      text: "#c2410c",
      accent: "linear-gradient(135deg, #f97316 0%, #fb923c 100%)",
    },
    paid: {
      glow: "rgba(59,130,246,0.12)",
      border: "1px solid rgba(59,130,246,0.18)",
      text: "#1d4ed8",
      accent: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
    },
    invoiced: {
      glow: "rgba(16,185,129,0.12)",
      border: "1px solid rgba(16,185,129,0.18)",
      text: "#047857",
      accent: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
    },
    completed: {
      glow: "rgba(139,92,246,0.12)",
      border: "1px solid rgba(139,92,246,0.18)",
      text: "#6d28d9",
      accent: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
    },
  };

  const style = tones[tone];

  return (
    <div
      style={{
        ...styles.statusMetricCard,
        background: style.glow,
        border: style.border,
      }}
    >
      <div style={styles.statusMetricTop}>
        <div style={styles.statusMetricLabel}>{label}</div>
        <div
          style={{
            ...styles.statusMetricDot,
            background: style.accent,
          }}
        />
      </div>

      <div style={{ ...styles.statusMetricValue, color: style.text }}>
        {value}
      </div>
    </div>
  );
}

function PremiumEmpty({ text }) {
  return (
    <div style={styles.emptyWrap}>
      <div style={styles.emptyOrb} />
      <div style={styles.emptyText}>{text}</div>
    </div>
  );
}

const styles = {
  page: {
    display: "grid",
    gap: "20px",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
  },

  rightPanel: {
    width: "100%",
    maxWidth: "280px",
    position: "relative",
    overflow: "hidden",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "28px",
    padding: "18px",
    backdropFilter: "blur(12px)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
    boxSizing: "border-box",
  },
  rightPanelGlowOne: {
    position: "absolute",
    top: "-26px",
    right: "-20px",
    width: "110px",
    height: "110px",
    borderRadius: "999px",
    background: "rgba(96,165,250,0.22)",
    filter: "blur(24px)",
  },
  rightPanelGlowTwo: {
    position: "absolute",
    bottom: "-26px",
    left: "-18px",
    width: "100px",
    height: "100px",
    borderRadius: "999px",
    background: "rgba(16,185,129,0.18)",
    filter: "blur(24px)",
  },
  rightPanelLabel: {
    position: "relative",
    zIndex: 1,
    color: "#bfdbfe",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  rightPanelDate: {
    position: "relative",
    zIndex: 1,
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 900,
    lineHeight: 1.5,
    marginBottom: "16px",
    wordBreak: "break-word",
  },
  rightPanelMetaRow: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gap: "12px",
  },
  rightMiniBox: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "18px",
    padding: "12px 14px",
  },
  rightMiniLabel: {
    color: "#93c5fd",
    fontSize: "11px",
    fontWeight: 800,
    marginBottom: "6px",
  },
  rightMiniValue: {
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 800,
    lineHeight: 1.45,
    wordBreak: "break-word",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "14px",
    marginBottom: "18px",
    width: "100%",
    minWidth: 0,
  },
  statCard: {
    position: "relative",
    overflow: "hidden",
    background: "rgba(255,255,255,0.09)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: "24px",
    padding: "18px",
    backdropFilter: "blur(12px)",
    minWidth: 0,
  },
  statCardGlow: {
    position: "absolute",
    top: "-18px",
    right: "-18px",
    width: "92px",
    height: "92px",
    borderRadius: "999px",
    filter: "blur(22px)",
    opacity: 0.9,
  },
  statCardAccent: {
    position: "absolute",
    left: "18px",
    top: "18px",
    width: "42px",
    height: "6px",
    borderRadius: "999px",
  },
  statCardLabel: {
    position: "relative",
    zIndex: 1,
    color: "#bfdbfe",
    fontSize: "12px",
    fontWeight: 800,
    marginTop: "14px",
    marginBottom: "10px",
    wordBreak: "break-word",
  },
  statCardValue: {
    position: "relative",
    zIndex: 1,
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: 900,
    lineHeight: 1.05,
    letterSpacing: "-0.03em",
    marginBottom: "8px",
    wordBreak: "break-word",
  },
  statCardHint: {
    position: "relative",
    zIndex: 1,
    color: "rgba(255,255,255,0.72)",
    fontSize: "12px",
    fontWeight: 600,
    wordBreak: "break-word",
  },

  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 240px))",
    gap: "12px",
    width: "100%",
  },
  primaryAction: {
    position: "relative",
    overflow: "hidden",
    border: "none",
    borderRadius: "18px",
    padding: "15px 18px",
    background: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 18px 36px rgba(59,130,246,0.22)",
    minWidth: 0,
  },
  actionAccent: {
    position: "absolute",
    inset: "0",
    background:
      "linear-gradient(90deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 40%)",
    pointerEvents: "none",
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
    minWidth: 0,
  },

  topGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.45fr) minmax(0, 0.95fr)",
    gap: "18px",
    width: "100%",
    minWidth: 0,
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 0.8fr)",
    gap: "18px",
    width: "100%",
    minWidth: 0,
  },

  chartShell: {
    minHeight: "280px",
    display: "grid",
    alignItems: "end",
    width: "100%",
    minWidth: 0,
  },
  barGrid: {
    minHeight: "250px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(72px, 1fr))",
    gap: "14px",
    alignItems: "end",
    width: "100%",
    minWidth: 0,
  },
  barItem: {
    display: "grid",
    gap: "10px",
    justifyItems: "center",
    minWidth: 0,
  },
  barValue: {
    fontSize: "11px",
    color: "#64748b",
    textAlign: "center",
    fontWeight: 700,
  },
  barTrack: {
    position: "relative",
    width: "100%",
    maxWidth: "46px",
    height: "194px",
    borderRadius: "20px",
    background: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
    display: "flex",
    alignItems: "flex-end",
    padding: "4px",
    border: "1px solid rgba(148,163,184,0.14)",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  barGlow: {
    position: "absolute",
    bottom: "-12px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "34px",
    height: "34px",
    borderRadius: "999px",
    background: "rgba(59,130,246,0.20)",
    filter: "blur(12px)",
  },
  barFill: {
    width: "100%",
    borderRadius: "16px",
    background: "linear-gradient(180deg, #3b82f6 0%, #10b981 100%)",
    boxShadow: "0 18px 30px rgba(59,130,246,0.20)",
    transition: "height 0.3s ease",
    position: "relative",
    zIndex: 1,
  },
  barLabel: {
    fontSize: "12px",
    fontWeight: 800,
    color: "#334155",
  },

  distributionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
    width: "100%",
    minWidth: 0,
  },
  statusMetricCard: {
    borderRadius: "22px",
    padding: "18px",
    minHeight: "112px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "0 10px 28px rgba(15,23,42,0.04)",
    minWidth: 0,
    boxSizing: "border-box",
  },
  statusMetricTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  statusMetricLabel: {
    color: "#475569",
    fontSize: "13px",
    fontWeight: 800,
    wordBreak: "break-word",
  },
  statusMetricDot: {
    width: "12px",
    height: "12px",
    borderRadius: "999px",
    flexShrink: 0,
  },
  statusMetricValue: {
    fontSize: "34px",
    lineHeight: 1,
    fontWeight: 900,
    letterSpacing: "-0.04em",
    wordBreak: "break-word",
  },

  recentList: {
    display: "grid",
    gap: "12px",
    width: "100%",
    minWidth: 0,
  },
  recentItem: {
    position: "relative",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    padding: "16px 16px 16px 18px",
    borderRadius: "20px",
    background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
    border: "1px solid rgba(226,232,240,0.8)",
    boxShadow: "0 12px 24px rgba(15,23,42,0.04)",
    minWidth: 0,
    boxSizing: "border-box",
  },
  recentStripe: {
    position: "absolute",
    left: "0",
    top: "12px",
    bottom: "12px",
    width: "4px",
    borderRadius: "999px",
    background: "linear-gradient(180deg, #3b82f6 0%, #10b981 100%)",
  },
  recentLeft: {
    minWidth: 0,
    paddingLeft: "2px",
    flex: 1,
  },
  recentCustomer: {
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: 900,
    marginBottom: "4px",
    wordBreak: "break-word",
  },
  recentMeta: {
    color: "#64748b",
    fontSize: "13px",
    fontWeight: 600,
    wordBreak: "break-word",
  },
  recentRight: {
    textAlign: "right",
    display: "grid",
    gap: "8px",
    justifyItems: "end",
    flexShrink: 0,
  },
  recentAmount: {
    color: "#0f172a",
    fontWeight: 900,
    fontSize: "14px",
    whiteSpace: "nowrap",
  },
  recentStatus: {
    fontSize: "12px",
    fontWeight: 800,
    padding: "8px 10px",
    borderRadius: "999px",
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  },

  topProductsList: {
    display: "grid",
    gap: "12px",
    width: "100%",
    minWidth: 0,
  },
  topProductItem: {
    display: "grid",
    gridTemplateColumns: "46px minmax(0, 1fr) auto",
    gap: "12px",
    alignItems: "center",
    padding: "16px",
    borderRadius: "20px",
    background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
    border: "1px solid rgba(226,232,240,0.8)",
    boxShadow: "0 12px 24px rgba(15,23,42,0.04)",
    minWidth: 0,
    boxSizing: "border-box",
  },
  topProductRank: {
    width: "46px",
    height: "46px",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg, rgba(59,130,246,0.14) 0%, rgba(16,185,129,0.14) 100%)",
    color: "#0f172a",
    fontWeight: 900,
    fontSize: "15px",
    border: "1px solid rgba(148,163,184,0.14)",
    flexShrink: 0,
  },
  topProductContent: {
    minWidth: 0,
  },
  topProductName: {
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: 900,
    marginBottom: "4px",
    wordBreak: "break-word",
  },
  topProductMeta: {
    color: "#64748b",
    fontSize: "13px",
    fontWeight: 600,
    wordBreak: "break-word",
  },
  topProductRevenueWrap: {
    textAlign: "right",
    flexShrink: 0,
  },
  topProductRevenue: {
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: 900,
    marginBottom: "4px",
    whiteSpace: "nowrap",
  },
  topProductRevenueHint: {
    color: "#64748b",
    fontSize: "11px",
    fontWeight: 700,
  },

  emptyWrap: {
    minHeight: "180px",
    display: "grid",
    placeItems: "center",
    gap: "12px",
    alignContent: "center",
  },
  emptyOrb: {
    width: "58px",
    height: "58px",
    borderRadius: "999px",
    background:
      "linear-gradient(135deg, rgba(59,130,246,0.14) 0%, rgba(16,185,129,0.14) 100%)",
    border: "1px solid rgba(148,163,184,0.14)",
    boxShadow: "0 16px 30px rgba(59,130,246,0.10)",
  },
  emptyText: {
    color: "#64748b",
    fontSize: "14px",
    fontWeight: 700,
    textAlign: "center",
  },
};