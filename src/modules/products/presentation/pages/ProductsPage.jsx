import AnimatedPage from "../../../../shared/components/ui/AnimatedPage";
import Card from "../../../../shared/components/ui/Card";
import PageHeader from "../../../../shared/components/ui/PageHeader";
import SectionCard from "../../../../shared/components/ui/SectionCard";
import EmptyState from "../../../../shared/components/ui/EmptyState";
import ErrorState from "../../../../shared/components/ui/ErrorState";
import LoadingState from "../../../../shared/components/ui/LoadingState";
import CreateProductForm from "../components/CreateProductForm";
import ProductsExportActions from "../components/ProductsExportActions";
import ProductsFilters from "../components/ProductsFilters";
import ProductsSummaryCards from "../components/ProductsSummaryCards";
import ProductsTable from "../components/ProductsTable";
import { useProductsListQuery } from "../hooks/useProductsListQuery";
import { useProductsFilters } from "../hooks/useProductsFilters";

export default function ProductsPage() {
  const { data, isLoading, isError, error } = useProductsListQuery();
  const products = data ?? [];

  const {
    search,
    setSearch,
    status,
    setStatus,
    filteredProducts,
    summary,
  } = useProductsFilters(products);

  return (
    <AnimatedPage>
      <Card>
        <PageHeader
          title="Products"
          description="Ürün tanımlarını oluşturun, filtreleyin, dışa aktarın ve mevcut ürünleri yönetin."
          badge="Ürün Yönetimi"
        />

        <div className="content-stack">
          <SectionCard
            title="Ürün Özeti"
            description="Genel ürün durumu ve fiyat görünümü"
          >
            <ProductsSummaryCards summary={summary} />
          </SectionCard>

          <SectionCard
            title="Yeni Ürün Ekle"
            description="Sisteme yeni ürün tanımı ekleyin"
          >
            <CreateProductForm />
          </SectionCard>

          <SectionCard
            title="Ürün Listesi"
            description={`Filtrelenmiş ${filteredProducts.length} / toplam ${products.length} ürün`}
          >
            <ProductsFilters
              search={search}
              onSearchChange={setSearch}
              status={status}
              onStatusChange={setStatus}
              actions={<ProductsExportActions products={filteredProducts} />}
            />

            {isLoading ? (
              <LoadingState
                title="Ürünler yükleniyor"
                description="Ürün kayıtları hazırlanıyor."
              />
            ) : null}

            {isError ? (
              <ErrorState
                title="Ürün kayıtları alınamadı"
                description={error?.message || "Bir hata oluştu."}
              />
            ) : null}

            {!isLoading && !isError && !filteredProducts.length ? (
              <EmptyState
                title="Ürün bulunamadı"
                description="Arama ve filtre kriterlerinize uygun ürün kaydı yok."
              />
            ) : null}

            {!isLoading && !isError && filteredProducts.length ? (
              <ProductsTable products={filteredProducts} />
            ) : null}
          </SectionCard>
        </div>
      </Card>
    </AnimatedPage>
  );
}