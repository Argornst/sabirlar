import AnimatedPage from "../../../../shared/components/ui/AnimatedPage";
import Card from "../../../../shared/components/ui/Card";
import PageHeader from "../../../../shared/components/ui/PageHeader";
import SectionCard from "../../../../shared/components/ui/SectionCard";
import EmptyState from "../../../../shared/components/ui/EmptyState";
import ErrorState from "../../../../shared/components/ui/ErrorState";
import LoadingState from "../../../../shared/components/ui/LoadingState";
import ReportsHero from "../components/ReportsHero";
import ReportsStatusGrid from "../components/ReportsStatusGrid";
import ReportsSummaryCards from "../components/ReportsSummaryCards";
import SalesStatusSummary from "../components/SalesStatusSummary";
import { useReportsSummaryQuery } from "../hooks/useReportsSummaryQuery";

export default function ReportsPage() {
  const { data, isLoading, isError, error } = useReportsSummaryQuery();

  return (
    <AnimatedPage>
      <Card>
        <PageHeader
          title="Reports"
          description="Genel rapor metriklerini ve durum bazlı dağılımları izleyin."
          badge="Raporlama"
        />

        {isLoading ? (
          <LoadingState
            title="Raporlar yükleniyor"
            description="Özet veriler hazırlanıyor."
          />
        ) : null}

        {isError ? (
          <ErrorState
            title="Rapor verileri alınamadı"
            description={error?.message || "Bir hata oluştu."}
          />
        ) : null}

        {!isLoading && !isError && data ? (
          <div className="content-stack">
            <ReportsHero summary={data} />

            <SectionCard
              title="Rapor Özeti"
              description="Ciro, stok, kullanıcı ve satış metrikleri"
            >
              <ReportsSummaryCards summary={data} />
            </SectionCard>

            <SectionCard
              title="Durum Kartları"
              description="Satış durumlarının premium özet görünümü"
            >
              {Object.keys(data.salesByStatus || {}).length ? (
                <ReportsStatusGrid salesByStatus={data.salesByStatus} />
              ) : (
                <EmptyState
                  title="Durum verisi yok"
                  description="Durum bazında gösterilecek satış kaydı bulunmuyor."
                />
              )}
            </SectionCard>

            <SectionCard
              title="Satış Durum Dağılımı"
              description="Kayıtların durum bazlı özet görünümü"
            >
              {Object.keys(data.salesByStatus || {}).length ? (
                <SalesStatusSummary salesByStatus={data.salesByStatus} />
              ) : (
                <EmptyState
                  title="Durum verisi yok"
                  description="Durum bazında gösterilecek satış kaydı bulunmuyor."
                />
              )}
            </SectionCard>
          </div>
        ) : null}
      </Card>
    </AnimatedPage>
  );
}