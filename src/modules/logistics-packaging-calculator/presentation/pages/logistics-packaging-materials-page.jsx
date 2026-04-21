import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { usePackagingMaterialsQuery } from '../../application';
import { createPackagingMaterial, logisticsPackagingRuntime } from '../../runtime/logistics-packaging.runtime.js';
import { MaterialsManager } from '../components/materials-manager/materials-manager';
import { LogisticsPackagingLayout } from '../components/logistics-packaging-layout/logistics-packaging-layout';

const { materialsRepository } = logisticsPackagingRuntime;

export function LogisticsPackagingMaterialsPage() {
  const materialsQuery = usePackagingMaterialsQuery(materialsRepository);
  const [isSaving, setIsSaving] = useState(false);

  const materials = materialsQuery.data ?? [];

  return (
    <LogisticsPackagingLayout
      title="Paketleme Malzemeleri"
      subtitle="Palet, kutu, vakum torbası ve varil master verilerini yönetin."
    >
      <MaterialsManager
        materials={materials}
        isSaving={isSaving}
        onCreateMaterial={async (payload) => {
          try {
            setIsSaving(true);
            await createPackagingMaterial(payload);
            await materialsQuery.refetch();
            toast.success('Malzeme kaydedildi.');
          } catch (error) {
            toast.error(error?.message || 'Malzeme kaydedilemedi.');
          } finally {
            setIsSaving(false);
          }
        }}
      />
    </LogisticsPackagingLayout>
  );
}