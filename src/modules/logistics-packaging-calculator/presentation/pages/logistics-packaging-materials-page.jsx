import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { usePackagingMaterialsQuery } from '../../application';
import { SupabasePackagingMaterialsRepository } from '../../infrastructure/repositories/supabase-packaging-materials.repository.js';
import { MaterialsManager } from '../components/materials-manager/materials-manager';
import { LogisticsPackagingLayout } from '../components/logistics-packaging-layout/logistics-packaging-layout';

const materialsRepository = new SupabasePackagingMaterialsRepository();

export function LogisticsPackagingMaterialsPage() {
  const materialsQuery = usePackagingMaterialsQuery(materialsRepository);
  const [isSaving, setIsSaving] = useState(false);

  const materials = materialsQuery.data ?? [];
  console.log('materialsQuery.data', materialsQuery.data);
console.log('materialsQuery.error', materialsQuery.error);

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
            await materialsRepository.create(payload);
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