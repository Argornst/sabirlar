import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AnimatedPage from "../../../../shared/components/ui/AnimatedPage";
import Card from "../../../../shared/components/ui/Card";
import PageHeader from "../../../../shared/components/ui/PageHeader";
import Button from "../../../../shared/components/ui/Button";
import EmptyState from "../../../../shared/components/ui/EmptyState";
import ErrorState from "../../../../shared/components/ui/ErrorState";
import LoadingState from "../../../../shared/components/ui/LoadingState";
import { ROUTES } from "../../../../shared/constants/routes";
import { useSalesListQuery } from "../hooks/useSalesListQuery";
import { useSalesFilters } from "../hooks/useSalesFilters";
import SalesExportActions from "../components/SalesExportActions";
import SalesFilters from "../components/SalesFilters";
import SalesTable from "../components/SalesTable";
import { useProductsListQuery } from "../../../products/presentation/hooks/useProductsListQuery";

export default function SalesPage() {
  const location = useLocation();
  const { data, isLoading, isError, error } = useSalesListQuery();
  const sales = data ?? [];
  const { data: products = [] } = useProductsListQuery();

  const { search, setSearch, status, setStatus, filteredSales } =
    useSalesFilters(sales);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filter = params.get("filter");

    if (!filter) return;

    if (filter === "completed") {
      setStatus("odendi_faturalandi");
      return;
    }

    if (filter === "payment-pending") {
      setStatus("faturalandi");
      return;
    }

    if (filter === "invoicing-pending") {
      setStatus("odendi");
      return;
    }

    if (filter === "waiting") {
      setStatus("beklemede");
    }
  }, [location.search, setStatus]);

  return (
    <AnimatedPage>
      <Card>
        <PageHeader
          title="Sales"
          description="Satış kayıtlarını filtreleyin, detaylarını görüntüleyin, dışa aktarın ve yönetin."
          badge="Satış Yönetimi"
          actions={
            <div className="row-actions">
              <SalesExportActions sales={filteredSales} />
              <Link to={ROUTES.NEW_SALE}>
                <Button>Yeni Satış</Button>
              </Link>
            </div>
          }
        />

        <SalesFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
        />

        {isLoading ? (
          <LoadingState
            title="Satışlar yükleniyor"
            description="Kayıtlar hazırlanıyor."
          />
        ) : null}

        {isError ? (
          <ErrorState
            title="Satış kayıtları alınamadı"
            description={error?.message || "Bir hata oluştu."}
          />
        ) : null}

        {!isLoading && !isError && !filteredSales.length ? (
          <EmptyState
            title="Satış bulunamadı"
            description="Arama ve filtre kriterlerinize uygun kayıt yok."
          />
        ) : null}

        {!isLoading && !isError && filteredSales.length ? (
          <SalesTable sales={filteredSales} products={products} />
        ) : null}
      </Card>
    </AnimatedPage>
  );
}