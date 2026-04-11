import { useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import {
  useCreatePackagingCalculationMutation,
  usePackagingCalculator,
  usePackagingMaterialsQuery,
  usePackagingProductsQuery,
  usePackagingRulesQuery,
} from '../../application';
import { SupabasePackagingCalculationsRepository } from '../../infrastructure/repositories/supabase-packaging-calculations.repository.js';
import { SupabasePackagingMaterialsRepository } from '../../infrastructure/repositories/supabase-packaging-materials.repository.js';
import { SupabasePackagingProductsRepository } from '../../infrastructure/repositories/supabase-packaging-products.repository.js';
import { SupabasePackagingRulesRepository } from '../../infrastructure/repositories/supabase-packaging-rules.repository.js';
import { CalculatorForm } from '../components/calculator-form/calculator-form';
import { LogisticsPackagingLayout } from '../components/logistics-packaging-layout/logistics-packaging-layout';

const productsRepository = new SupabasePackagingProductsRepository();
const materialsRepository = new SupabasePackagingMaterialsRepository();
const rulesRepository = new SupabasePackagingRulesRepository();
const calculationsRepository = new SupabasePackagingCalculationsRepository();

function pickPreferredMaterial(materials, rules) {
  if (!materials.length) return null;
  if (!rules.length) return materials[0];

  const requiredIds = new Set(
    rules.filter((rule) => rule.isRequired).map((rule) => rule.materialId),
  );

  const requiredMatch = materials.find((item) => requiredIds.has(item.id));
  return requiredMatch ?? materials[0];
}

export function LogisticsPackagingCalculatorPage() {
  const productsQuery = usePackagingProductsQuery(productsRepository);
  const materialsQuery = usePackagingMaterialsQuery(materialsRepository);

  const products = productsQuery.data ?? [];
  const materials = materialsQuery.data ?? [];

  const calculator = usePackagingCalculator({
    materials,
    productRules: [],
  });

  const rulesQuery = usePackagingRulesQuery(
    rulesRepository,
    calculator.values.productId || undefined,
  );

  const activeRules = useMemo(() => rulesQuery.data ?? [], [rulesQuery.data]);

  const allowedMaterialIds = useMemo(
    () => activeRules.map((rule) => rule.materialId),
    [activeRules],
  );

  const allowedMaterials = useMemo(() => {
    if (!allowedMaterialIds.length) return materials;
    const allowedSet = new Set(allowedMaterialIds);
    return materials.filter((item) => allowedSet.has(item.id));
  }, [allowedMaterialIds, materials]);

  const containerRules = useMemo(
    () =>
      activeRules.filter((rule) => {
        const material = materials.find((item) => item.id === rule.materialId);
        return material?.materialType === 'BOX' || material?.materialType === 'DRUM';
      }),
    [activeRules, materials],
  );

  const vacuumRules = useMemo(
    () =>
      activeRules.filter((rule) => {
        const material = materials.find((item) => item.id === rule.materialId);
        return material?.materialType === 'VACUUM_BAG';
      }),
    [activeRules, materials],
  );

  const palletRules = useMemo(
    () =>
      activeRules.filter((rule) => {
        const material = materials.find((item) => item.id === rule.materialId);
        return material?.materialType === 'PALLET';
      }),
    [activeRules, materials],
  );

  const allowedContainers = useMemo(
    () =>
      allowedMaterials.filter(
        (item) => item.materialType === 'BOX' || item.materialType === 'DRUM',
      ),
    [allowedMaterials],
  );

  const allowedVacuumBags = useMemo(
    () => allowedMaterials.filter((item) => item.materialType === 'VACUUM_BAG'),
    [allowedMaterials],
  );

  const allowedPallets = useMemo(
    () => allowedMaterials.filter((item) => item.materialType === 'PALLET'),
    [allowedMaterials],
  );

  const preferredContainer = useMemo(
    () => pickPreferredMaterial(allowedContainers, containerRules),
    [allowedContainers, containerRules],
  );

  const preferredVacuumBag = useMemo(
    () => pickPreferredMaterial(allowedVacuumBags, vacuumRules),
    [allowedVacuumBags, vacuumRules],
  );

  const preferredPallet = useMemo(
    () => pickPreferredMaterial(allowedPallets, palletRules),
    [allowedPallets, palletRules],
  );

  const allowedContainerIdsKey = useMemo(
    () => allowedContainers.map((item) => item.id).join(','),
    [allowedContainers],
  );

  const allowedVacuumIdsKey = useMemo(
    () => allowedVacuumBags.map((item) => item.id).join(','),
    [allowedVacuumBags],
  );

  const allowedPalletIdsKey = useMemo(
    () => allowedPallets.map((item) => item.id).join(','),
    [allowedPallets],
  );

  const preferredContainerId = preferredContainer?.id ?? '';
  const preferredVacuumBagId = preferredVacuumBag?.id ?? '';
  const preferredPalletId = preferredPallet?.id ?? '';

  useEffect(() => {
    if (!calculator.values.productId) return;

    calculator.setValues((current) => {
      let hasAnyChange = false;

      const next = {
        ...current,
        palletLines: current.palletLines.map((line) => ({ ...line })),
      };

      const currentContainerAllowed =
        !current.containerMaterialId ||
        allowedContainers.some((item) => item.id === current.containerMaterialId);

      if (!currentContainerAllowed) {
        next.containerMaterialId = preferredContainerId;
        hasAnyChange = true;
      } else if (!current.containerMaterialId && preferredContainerId) {
        next.containerMaterialId = preferredContainerId;
        hasAnyChange = true;
      }

      const currentVacuumAllowed =
        !current.vacuumBagMaterialId ||
        allowedVacuumBags.some((item) => item.id === current.vacuumBagMaterialId);

      if (!currentVacuumAllowed) {
        next.vacuumBagMaterialId = preferredVacuumBagId || null;
        hasAnyChange = true;
      } else if (!current.vacuumBagMaterialId && preferredVacuumBagId) {
        next.vacuumBagMaterialId = preferredVacuumBagId;
        hasAnyChange = true;
      }

      next.palletLines = next.palletLines.map((line, index) => {
        const isAllowed =
          !line.palletMaterialId ||
          allowedPallets.some((item) => item.id === line.palletMaterialId);

        if (!isAllowed) {
          hasAnyChange = true;
          return {
            ...line,
            palletMaterialId: preferredPalletId,
          };
        }

        if (!line.palletMaterialId && index === 0 && preferredPalletId) {
          hasAnyChange = true;
          return {
            ...line,
            palletMaterialId: preferredPalletId,
          };
        }

        return line;
      });

      return hasAnyChange ? next : current;
    });
  }, [
    calculator.values.productId,
    calculator.setValues,
    allowedContainerIdsKey,
    allowedVacuumIdsKey,
    allowedPalletIdsKey,
    preferredContainerId,
    preferredVacuumBagId,
    preferredPalletId,
    allowedContainers,
    allowedVacuumBags,
    allowedPallets,
  ]);

  const handleAddPalletLine = () => {
    calculator.setValues((current) => ({
      ...current,
      palletLines: [
        ...current.palletLines,
        {
          id: crypto.randomUUID(),
          palletMaterialId: preferredPalletId,
          palletCount: 1,
          unitsPerRow: '',
          unitsPerPallet: '',
          stackGroup: '',
          stackGroupMode: 'select',
          stackGroupDraft: '',
          stackOrder: 1,
        },
      ],
    }));
  };

  const createMutation = useCreatePackagingCalculationMutation({
    calculationsRepository,
    materials,
    productRules: activeRules,
  });

  const isLoading = productsQuery.isLoading || materialsQuery.isLoading;
  const isSaving = createMutation.isPending;

  if (isLoading) {
    return (
      <LogisticsPackagingLayout
        title="Paketleme Hesaplayıcı"
        subtitle="Paketleme verileri yükleniyor."
      >
        <div className="lp-panel">Yükleniyor...</div>
      </LogisticsPackagingLayout>
    );
  }

  return (
    <LogisticsPackagingLayout
      title="Paketleme Hesaplayıcı"
      subtitle="Lot bazlı ürün, ambalaj, palet ve istif planını hesaplayın; brüt ağırlık ve yükseklik limitlerini gerçek zamanlı izleyin."
    >
      <CalculatorForm
        values={calculator.values}
        result={calculator.result}
        products={products}
        materials={materials}
        allowedMaterialIds={allowedMaterialIds}
        onChangeValues={calculator.setValues}
        onAddPalletLine={handleAddPalletLine}
        onRemovePalletLine={calculator.removePalletLine}
        onSubmit={async () => {
          try {
            await createMutation.mutateAsync({
              values: calculator.values,
            });
            toast.success('Paketleme hesaplaması kaydedildi.');
            calculator.reset();
          } catch (error) {
            toast.error(error?.message || 'Kayıt sırasında hata oluştu.');
          }
        }}
        isSaving={isSaving}
      />
    </LogisticsPackagingLayout>
  );
}