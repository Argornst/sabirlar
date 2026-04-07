import { Link } from "react-router-dom";
import "../productions.css";
import { ProductionsFilters } from "../components/ProductionsFilters";
import { ProductionsTable } from "../components/ProductionsTable";
import { useProductionsFilters } from "../hooks/useProductionsFilters";
import { useProductionsListQuery } from "../hooks/useProductionsListQuery";

export default function ProductionsPage() {
  const { filters, queryFilters, updateFilter, resetFilters } = useProductionsFilters();
  const productionsQuery = useProductionsListQuery(queryFilters);

  return (
    <div className="production-page">
      <div className="production-page__header">
        <div>
          <h1 className="production-page__title">Üretimler</h1>
          <p className="production-page__subtitle">
            Tüm üretim kayıtlarını yönet, filtrele ve sevkiyat planına hazırlık yap.
          </p>
        </div>

        <div className="production-page__actions">
          <Link to="/dispatch-plan" className="production-button production-button--ghost production-button--with-icon">
            <DispatchIcon />
            <span>Sevkiyat Planı</span>
          </Link>

          <Link to="/productions/new" className="production-button production-button--primary production-button--with-icon">
            <PlusIcon />
            <span>Yeni Kayıt</span>
          </Link>
        </div>
      </div>

      <ProductionsFilters
        filters={filters}
        onChange={updateFilter}
        onReset={resetFilters}
      />

      <div className="production-card">
        {productionsQuery.isLoading ? (
          <div className="production-loading">Kayıtlar yükleniyor...</div>
        ) : productionsQuery.isError ? (
          <div className="production-alert">
            {productionsQuery.error?.message || "Liste alınırken hata oluştu."}
          </div>
        ) : (
          <ProductionsTable items={productionsQuery.data || []} />
        )}
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function DispatchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M7.5 3.5v3" />
      <path d="M16.5 3.5v3" />
      <path d="M3.5 9.5h17" />
      <path d="M8 14h3" />
      <path d="M13 14h3" />
      <path d="M8 17h3" />
    </svg>
  );
}