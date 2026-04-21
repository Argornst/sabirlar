import { useMemo, useState } from "react";
import AnimatedPage from "../../../../shared/components/ui/AnimatedPage";
import Card from "../../../../shared/components/ui/Card";
import PageHeader from "../../../../shared/components/ui/PageHeader";
import EmptyState from "../../../../shared/components/ui/EmptyState";
import ErrorState from "../../../../shared/components/ui/ErrorState";
import LoadingState from "../../../../shared/components/ui/LoadingState";
import ReportsSection from "../components/ReportsSection";
import DispatchLogsFilters from "../components/DispatchLogsFilters";
import DispatchLogsSummaryCards from "../components/DispatchLogsSummaryCards";
import DispatchLogsTable from "../components/DispatchLogsTable";
import { useReportsDispatchLogsQuery } from "../hooks/useReportsDispatchLogsQuery";
import "../../reports.css";

const INITIAL_FILTERS = {
  search: "",
  actionType: "",
  fromDate: "",
  toDate: "",
  page: 1,
  pageSize: 10,
};

export default function ReportsPage() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const { data, isLoading, isError, error } = useReportsDispatchLogsQuery(filters);

  const pagination = useMemo(
    () => ({
      rows: data?.rows || [],
      total: data?.total || 0,
      page: data?.page || filters.page,
      pageSize: data?.pageSize || filters.pageSize,
      totalPages: data?.totalPages || 1,
    }),
    [data, filters.page, filters.pageSize]
  );

  function updateFilter(name, value) {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  }

  function resetFilters() {
    setFilters(INITIAL_FILTERS);
  }

  function handlePageChange(nextPage) {
    setFilters((prev) => ({
      ...prev,
      page: nextPage,
    }));
  }

  return (
    <AnimatedPage>
      <Card>
        <PageHeader
          title="Raporlar"
          description="Sevkiyat hareket loglarını filtreleyin, inceleyin ve ileride eklenecek diğer rapor modülleriyle birlikte tek merkezden yönetin."
          badge="Raporlama"
        />

        <div className="content-stack">
          <ReportsSection
            title="Sevkiyat Log Filtreleri"
            description="Kayıtları işlem tipine, tarihe ve metin aramasına göre daralt."
          >
            <DispatchLogsFilters
              filters={filters}
              onChange={updateFilter}
              onReset={resetFilters}
            />
          </ReportsSection>

          <ReportsSection
            title="Sevkiyat Log Özeti"
            description="Mevcut filtre sonucundaki kayıtların özet dağılımı"
          >
            <DispatchLogsSummaryCards data={data} />
          </ReportsSection>

          <ReportsSection
            title="Sevkiyat Log Tablosu"
            description="Filtrelenmiş log kayıtlarının detaylı tablosu"
          >
            {isLoading ? (
              <LoadingState
                title="Loglar yükleniyor"
                description="Sevkiyat hareket kayıtları getiriliyor."
              />
            ) : isError ? (
              <ErrorState
                title="Log kayıtları alınamadı"
                description={error?.message || "Bir hata oluştu."}
              />
            ) : !pagination.rows.length ? (
              <EmptyState
                title="Kayıt bulunamadı"
                description="Bu filtrelere uygun sevkiyat logu yok."
              />
            ) : (
              <DispatchLogsTable
                rows={pagination.rows}
                total={pagination.total}
                page={pagination.page}
                pageSize={pagination.pageSize}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </ReportsSection>
        </div>
      </Card>
    </AnimatedPage>
  );
}
