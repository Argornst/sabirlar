import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  usePackagingMaterialsQuery,
  usePackagingProductsQuery,
  usePackagingRulesQuery,
  useUpsertPackagingRulesMutation,
} from '../../application';
import { logisticsPackagingRuntime } from '../../runtime/logistics-packaging.runtime.js';
import { LogisticsPackagingLayout } from '../components/logistics-packaging-layout/logistics-packaging-layout';
import { ProductPackagingRulesManager } from '../components/product-packaging-rules-manager/product-packaging-rules-manager';

const {
  productsRepository,
  materialsRepository,
  rulesRepository,
} = logisticsPackagingRuntime;

export function LogisticsPackagingRulesPage() {
  const [selectedProductId, setSelectedProductId] = useState('');

  const productsQuery = usePackagingProductsQuery(productsRepository);
  const materialsQuery = usePackagingMaterialsQuery(materialsRepository);
  const rulesQuery = usePackagingRulesQuery(
    rulesRepository,
    selectedProductId || undefined,
  );

  const mutation = useUpsertPackagingRulesMutation(rulesRepository);

  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);
  const materials = useMemo(() => materialsQuery.data ?? [], [materialsQuery.data]);
  const rules = useMemo(() => rulesQuery.data ?? [], [rulesQuery.data]);

  const isLoading = productsQuery.isLoading || materialsQuery.isLoading;

  if (isLoading) {
    return (
      <LogisticsPackagingLayout
        title="Ürün Ambalaj Kuralları"
        subtitle="Ürün ve malzeme verileri yükleniyor."
      >
        <div className="lp-panel">Yükleniyor...</div>
      </LogisticsPackagingLayout>
    );
  }

  return (
    <LogisticsPackagingLayout
      title="Ürün Ambalaj Kuralları"
      subtitle="Ürün bazlı ambalaj izinlerini sade, hızlı ve operasyonel bir arayüzle yönetin."
    >
      <ProductPackagingRulesManager
        products={products}
        materials={materials}
        selectedProductId={selectedProductId}
        onSelectProduct={setSelectedProductId}
        rules={rules}
        isSaving={mutation.isPending}
        onSave={async (payload) => {
          try {
            await mutation.mutateAsync(payload);
            toast.success('Ürün ambalaj kuralları kaydedildi.');
          } catch (error) {
            toast.error(error?.message || 'Kurallar kaydedilemedi.');
          }
        }}
      />
    </LogisticsPackagingLayout>
  );
}