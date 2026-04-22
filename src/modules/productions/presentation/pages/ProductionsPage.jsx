import { Link } from "react-router-dom";
import { CalendarBlank, Plus } from "@phosphor-icons/react";

import AnimatedPage from "../../../../shared/components/ui/AnimatedPage";
import Card from "../../../../shared/components/ui/Card";
import PageHeader from "../../../../shared/components/ui/PageHeader";
import Button from "../../../../shared/components/ui/Button";
import EmptyState from "../../../../shared/components/ui/EmptyState";
import ErrorState from "../../../../shared/components/ui/ErrorState";
import LoadingState from "../../../../shared/components/ui/LoadingState";
import { ROUTES } from "../../../../shared/constants/routes";

import "../productions.css";
import { ProductionsFilters } from "../components/ProductionsFilters";
import { ProductionsTable } from "../components/ProductionsTable";
import { useProductionsFilters } from "../hooks/useProductionsFilters";
import { useProductionsListQuery } from "../hooks/useProductionsListQuery";

export default function ProductionsPage() {
  const { filters, queryFilters, updateFilter, resetFilters } =
    useProductionsFilters();

  const productionsQuery = useProductionsListQuery(queryFilters);
  const productions = productionsQuery.data ?? [];

  return (
    <AnimatedPage>
      <Card>
        <PageHeader
          variant="hero"
          eyebrow="ÜRETİM"
          title="Üretimler"
          description="Tüm üretim kayıtlarını filtreleyin, detaylarını görüntüleyin, düzenleyin ve sevkiyat planına hazırlayın."
          actions={
            <div className="production-header-actions">
              <Link to={ROUTES.DISPATCH_PLAN}>
                <Button variant="secondary" className="btn-premium">
                  <CalendarBlank size={18} />
                  Sevkiyat Planı
                </Button>
              </Link>

              <Link to={ROUTES.NEW_PRODUCTION}>
                <Button className="btn-premium">
                  <Plus size={18} />
                  Yeni Kayıt
                </Button>
              </Link>
            </div>
          }
        />

        <ProductionsFilters
          filters={filters}
          onChange={updateFilter}
          onReset={resetFilters}
        />

        {productionsQuery.isLoading ? (
          <LoadingState
            title="Üretimler yükleniyor"
            description="Kayıtlar hazırlanıyor."
          />
        ) : null}

        {productionsQuery.isError ? (
          <ErrorState
            title="Üretim kayıtları alınamadı"
            description={
              productionsQuery.error?.message || "Bir hata oluştu."
            }
          />
        ) : null}

        {!productionsQuery.isLoading &&
        !productionsQuery.isError &&
        !productions.length ? (
          <EmptyState
            title="Üretim bulunamadı"
            description="Arama ve filtre kriterlerinize uygun kayıt yok."
          />
        ) : null}

        {!productionsQuery.isLoading &&
        !productionsQuery.isError &&
        productions.length ? (
          <ProductionsTable items={productions} />
        ) : null}
      </Card>
    </AnimatedPage>
  );
}