import {
  usePackagingCalculationsQuery,
  usePackagingMaterialsQuery,
  usePackagingProductsQuery,
} from '../../application';
import { logisticsPackagingRuntime } from '../../runtime/logistics-packaging.runtime.js';
import { CalculationsHistoryTable } from '../components/calculations-history-table/calculations-history-table';
import { LogisticsPackagingLayout } from '../components/logistics-packaging-layout/logistics-packaging-layout';

const {
  calculationsRepository,
  productsRepository,
  materialsRepository,
} = logisticsPackagingRuntime;

export function LogisticsPackagingHistoryPage() {
  const calculationsQuery = usePackagingCalculationsQuery(calculationsRepository);
  const productsQuery = usePackagingProductsQuery(productsRepository);
  const materialsQuery = usePackagingMaterialsQuery(materialsRepository);

  const items = calculationsQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const materials = materialsQuery.data ?? [];

  const isLoading =
    calculationsQuery.isLoading || productsQuery.isLoading || materialsQuery.isLoading;

  if (isLoading) {
    return (
      <LogisticsPackagingLayout
        title="Paketleme Geçmişi"
        description="Kayıtlı hesaplamalar yükleniyor."
      >
        <div className="lp-panel">Yükleniyor...</div>
      </LogisticsPackagingLayout>
    );
  }

  return (
    <LogisticsPackagingLayout
      title="Paketleme Geçmişi"
      description="Daha önce kaydedilen lot bazlı paketleme senaryolarını görüntüleyin."
    >
      <div className="lp-panel lp-page-hero">
        <div className="lp-page-hero__eyebrow">Lojistik</div>
        <h2 className="lp-page-hero__title">Paketleme Geçmişi</h2>
        <p className="lp-page-hero__description">
          Kaydedilen hesaplamaları inceleyin, detaylarını açın ve palet bazlı brüt /
          yükseklik verilerini görüntüleyin.
        </p>
      </div>

      <div className="lp-panel">
        <div className="lp-section-heading">
          <div>
            <h3 className="lp-section-heading__title">Hesaplama Geçmişi</h3>
            <p className="lp-section-heading__description">
              Kaydedilen lot bazlı paketleme hesaplamaları.
            </p>
          </div>
        </div>

        <CalculationsHistoryTable
          items={items}
          products={products}
          materials={materials}
        />
      </div>
    </LogisticsPackagingLayout>
  );
}