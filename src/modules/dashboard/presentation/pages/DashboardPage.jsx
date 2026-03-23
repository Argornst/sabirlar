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

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboardSummaryQuery();
  const { data: logs = [] } = useAuditLogsQuery();

  return (
    <AnimatedPage>
      <Card>
        <PageHeader
          title="Dashboard"
          description="Genel performans, hızlı aksiyonlar ve son satış hareketleri."
          badge="Genel Bakış"
        />

        {isLoading ? (
          <LoadingState
            title="Dashboard yükleniyor"
            description="Özet metrikler hazırlanıyor."
          />
        ) : null}

        {isError ? (
          <ErrorState
            title="Dashboard verileri alınamadı"
            description={error?.message || "Bir hata oluştu."}
          />
        ) : null}

        {!isLoading && !isError && data ? (
          <div className="content-stack">
            <DashboardHero summary={data} />
            <DashboardMetricsStrip summary={data} />

            <SectionCard
              title="Hızlı Aksiyonlar"
              description="Panel içinde sık kullanılan işlemlere kısa erişim"
            >
              <DashboardQuickActions />
            </SectionCard>

            <SectionCard
              title="Öne Çıkan Metrikler"
              description="En önemli genel performans göstergeleri"
            >
              <DashboardHighlights summary={data} />
            </SectionCard>

            <SectionCard
              title="Genel Özet"
              description="Satış, ürün, kullanıcı ve ciro metrikleri"
            >
              <DashboardStats summary={data} />
            </SectionCard>

            <SectionCard
              title="Durum Özeti"
              description="Kritik sayıların kısa görünümü"
            >
              <DashboardStatusOverview summary={data} />
            </SectionCard>

            <SectionCard
              title="Son Aktiviteler"
              description="Panelde gerçekleşen son işlemler"
            >
              <RecentActivityFeed logs={logs} />
            </SectionCard>

            <SectionCard
              title="Son Satış Hareketleri"
              description="En son eklenen satış kayıtları"
            >
              {data.recentSales?.length ? (
                <RecentSalesList sales={data.recentSales} />
              ) : (
                <EmptyState
                  title="Henüz satış yok"
                  description="Sistemde gösterilecek son satış kaydı bulunmuyor."
                />
              )}
            </SectionCard>
          </div>
        ) : null}
      </Card>
    </AnimatedPage>
  );
}