import AnimatedPage from "../../../../shared/components/ui/AnimatedPage";
import Card from "../../../../shared/components/ui/Card";
import PageHeader from "../../../../shared/components/ui/PageHeader";
import SectionCard from "../../../../shared/components/ui/SectionCard";
import EmptyState from "../../../../shared/components/ui/EmptyState";
import ErrorState from "../../../../shared/components/ui/ErrorState";
import LoadingState from "../../../../shared/components/ui/LoadingState";

import DashboardStats from "../components/DashboardStats";
import DashboardQuickActions from "../components/DashboardQuickActions";
import DashboardStatusOverview from "../components/DashboardStatusOverview";
import DashboardHighlights from "../components/DashboardHighlights";
import DashboardHero from "../components/DashboardHero";
import DashboardMetricsStrip from "../components/DashboardMetricsStrip";
import RecentActivityFeed from "../components/RecentActivityFeed";
import RecentSalesList from "../components/RecentSalesList";

import { useAuditLogsQuery } from "../hooks/useAuditLogsQuery";
import { useDashboardSummaryQuery } from "../hooks/useDashboardSummaryQuery";

const ENABLE_HERO = false;
const ENABLE_ADVANCED_METRICS = false;
const ENABLE_ACTIVITY_FEED = false;

const EMPTY_SUMMARY = {
  totalRevenue: 0,
  totalSalesCount: 0,
  pendingSalesCount: 0,
  paidSalesCount: 0,
  totalUsersCount: 0,
  totalProductsCount: 0,
  recentSales: [],
};

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboardSummaryQuery();
  const { data: logs = [], isError: isAuditError } = useAuditLogsQuery();

  const summary = data ?? EMPTY_SUMMARY;

  return (
    <AnimatedPage>
      <Card>
        <PageHeader
          title="Dashboard"
          description="Temel durum, hızlı aksiyonlar ve son satış kayıtları."
          badge="Genel Bakış"
        />

        {isLoading && (
          <LoadingState
            title="Dashboard yükleniyor"
            description="Özet veriler hazırlanıyor."
          />
        )}

        {isError && (
          <ErrorState
            title="Dashboard verileri alınamadı"
            description={error?.message || "Bir hata oluştu."}
          />
        )}

        {!isLoading && !isError && (
          <div className="dashboard-layout">
            {ENABLE_HERO && <DashboardHero summary={summary} />}

            <SectionCard
              title="Durum"
              description="Sistemin temel görünümü"
            >
              <DashboardStatusOverview summary={summary} />
            </SectionCard>

            <SectionCard
              title="Hızlı Aksiyonlar"
              description="Panel içinde sık kullanılan işlemler"
            >
              <DashboardQuickActions />
            </SectionCard>

            <SectionCard
              title="Son Satışlar"
              description="En son eklenen satış kayıtları"
            >
              {summary.recentSales?.length ? (
                <RecentSalesList sales={summary.recentSales} />
              ) : (
                <EmptyState
                  title="Henüz satış yok"
                  description="Sistemde gösterilecek son satış kaydı bulunmuyor."
                />
              )}
            </SectionCard>

            {ENABLE_ADVANCED_METRICS && (
              <>
                <DashboardMetricsStrip summary={summary} />

                <div className="dashboard-grid-2">
                  <SectionCard
                    title="Öne Çıkan Metrikler"
                    description="Genel performans göstergeleri"
                  >
                    <DashboardHighlights summary={summary} />
                  </SectionCard>

                  <SectionCard
                    title="Genel Özet"
                    description="Satış, ürün, kullanıcı ve ciro metrikleri"
                  >
                    <DashboardStats summary={summary} />
                  </SectionCard>
                </div>
              </>
            )}

            {ENABLE_ACTIVITY_FEED && (
              <SectionCard
                title="Son Aktiviteler"
                description="Panelde gerçekleşen son işlemler"
              >
                {isAuditError ? (
                  <ErrorState
                    title="Aktivite akışı alınamadı"
                    description="Audit log verileri şu anda yüklenemiyor."
                  />
                ) : (
                  <RecentActivityFeed logs={logs} />
                )}
              </SectionCard>
            )}
          </div>
        )}
      </Card>
    </AnimatedPage>
  );
}