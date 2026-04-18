import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  useCreatePackagingScenarioMutation,
  useDeletePackagingScenarioMutation,
  usePackagingMaterialsQuery,
  usePackagingProductsQuery,
  usePackagingRulesQuery,
  usePackagingScenarioCalculator,
  usePackagingScenariosQuery,
  useUpdatePackagingScenarioMutation,
} from '../../application';
import { SupabasePackagingMaterialsRepository } from '../../infrastructure/repositories/supabase-packaging-materials.repository.js';
import { SupabasePackagingProductsRepository } from '../../infrastructure/repositories/supabase-packaging-products.repository.js';
import { SupabasePackagingRulesRepository } from '../../infrastructure/repositories/supabase-packaging-rules.repository.js';
import { SupabasePackagingScenariosRepository } from '../../infrastructure/repositories/supabase-packaging-scenarios.repository.js';
import { LogisticsPackagingLayout } from '../components/logistics-packaging-layout/logistics-packaging-layout';
import { ScenarioHistory } from '../components/scenario-history/scenario-history';
import { ScenarioLotSidebar } from '../components/scenario-lot-sidebar/scenario-lot-sidebar';
import { ScenarioLotEditor } from '../components/scenario-lot-editor/scenario-lot-editor';
import { ScenarioPreviewPanel } from '../components/scenario-preview-panel/scenario-preview-panel';
import './logistics-packaging-calculator-page.css';

const productsRepository = new SupabasePackagingProductsRepository();
const materialsRepository = new SupabasePackagingMaterialsRepository();
const rulesRepository = new SupabasePackagingRulesRepository();
const scenariosRepository = new SupabasePackagingScenariosRepository();

function pickPreferredMaterial(materials, rules) {
  if (!materials.length) return '';

  if (!rules.length) {
    return materials[0]?.id ?? '';
  }

  const requiredIds = new Set(
    rules.filter((rule) => rule.isRequired).map((rule) => rule.materialId),
  );

  const requiredMatch = materials.find((item) => requiredIds.has(item.id));
  return requiredMatch?.id ?? materials[0]?.id ?? '';
}

function pickPreferredMaterialByTypes(materials, rules, allowedTypes = []) {
  const filtered = materials.filter((item) =>
    allowedTypes.includes(item.materialType),
  );

  if (!filtered.length) {
    return '';
  }

  return pickPreferredMaterial(filtered, rules);
}

function normalizeText(value) {
  return String(value ?? '').trim().toLocaleLowerCase('tr-TR');
}

function formatNumber(value, fractionDigits = 3) {
  if (value == null || Number.isNaN(Number(value))) {
    return '-';
  }

  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(Number(value));
}

function resolveStatusLabel(status) {
  if (status === 'VALID') return 'Uygun';
  if (status === 'WARNING') return 'Uyarılı';
  if (status === 'INVALID') return 'Hatalı';
  return status ?? '-';
}

function getStatusClass(status) {
  if (status === 'VALID') return 'is-valid';
  if (status === 'WARNING') return 'is-warning';
  return 'is-invalid';
}

function getValidationCounts(messages = []) {
  return messages.reduce(
    (acc, message) => {
      if (message.level === 'ERROR') {
        acc.errors += 1;
      } else if (message.level === 'WARNING') {
        acc.warnings += 1;
      } else {
        acc.info += 1;
      }

      return acc;
    },
    { errors: 0, warnings: 0, info: 0 },
  );
}

function mapScenarioToDraftValues(record) {
  return {
    name: record.scenario.name ?? '',
    lots: (record.lots ?? []).map((item) => ({
      id: item.lot.id,
      values: {
        lotNumber: item.lot.lotNumber ?? '',
        productId: item.lot.productId ?? '',
        totalQuantityKg: item.lot.totalQuantityKg ?? '',
        containerMaterialId: item.lot.containerMaterialId ?? '',
        vacuumBagMaterialId: item.lot.vacuumBagMaterialId ?? null,
        unitNetWeightKg: item.lot.unitNetWeightKg ?? '',
        notes: item.lot.notes ?? '',
        palletLines: (item.palletLines ?? []).map((line) => ({
          id: line.id,
          palletMaterialId: line.palletMaterialId ?? '',
          palletCount: line.palletCount ?? 1,
          unitsPerRow: line.unitsPerRow ?? '',
          unitsPerPallet: line.unitsPerPallet ?? '',
          stackGroup: line.stackGroup ?? '',
          stackOrder: line.stackOrder ?? 1,
        })),
      },
    })),
  };
}

function createScenarioResultMap(scenario) {
  return new Map(
    scenario.values.lots.map((lot) => [lot.id, scenario.getLotResult(lot.id)]),
  );
}

function getAggregateSummaryItems(result) {
  return [
    {
      label: 'Genel Net',
      value: `${formatNumber(result?.totalNetWeightKg)} kg`,
    },
    {
      label: 'Genel Brüt',
      value: `${formatNumber(result?.totalGrossWeightKg)} kg`,
    },
    {
      label: 'Toplam Ambalaj',
      value: `${result?.totalContainerCount ?? 0}`,
    },
    {
      label: 'Toplam Palet',
      value: `${result?.totalPalletCount ?? 0}`,
    },
    {
      label: 'Zemindeki Palet',
      value: `${result?.totalGroundPalletCount ?? 0}`,
    },
    {
      label: 'İstif Grubu',
      value: `${result?.stackSummaries?.length ?? 0}`,
    },
  ];
}

function buildAutoFilledPalletLines(currentLines, preferredPalletMaterialId) {
  if (!preferredPalletMaterialId) {
    return currentLines ?? [];
  }

  if (Array.isArray(currentLines) && currentLines.length > 0) {
    return currentLines.map((line) => ({
      ...line,
      palletMaterialId: line.palletMaterialId || preferredPalletMaterialId,
    }));
  }

  return [
    {
      id: crypto.randomUUID(),
      palletMaterialId: preferredPalletMaterialId,
      palletCount: 1,
      unitsPerRow: '',
      unitsPerPallet: '',
      stackGroup: '',
      stackOrder: 1,
    },
  ];
}

export function LogisticsPackagingCalculatorPage() {
  const [historySearch, setHistorySearch] = useState('');
  const [historySort, setHistorySort] = useState('updated_desc');
  const [selectedLotId, setSelectedLotId] = useState(null);

  const productsQuery = usePackagingProductsQuery(productsRepository);
  const materialsQuery = usePackagingMaterialsQuery(materialsRepository);
  const scenariosQuery = usePackagingScenariosQuery(scenariosRepository);
  const rulesQuery = usePackagingRulesQuery(rulesRepository);

  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);
  const materials = useMemo(() => materialsQuery.data ?? [], [materialsQuery.data]);
  const scenariosData = useMemo(() => scenariosQuery.data ?? [], [scenariosQuery.data]);
  const allRules = rulesQuery.data ?? [];

  const rulesByProduct = useMemo(() => {
    const map = new Map();

    allRules.forEach((rule) => {
      const current = map.get(rule.productId) ?? [];
      current.push(rule);
      map.set(rule.productId, current);
    });

    return map;
  }, [allRules]);

  const scenario = usePackagingScenarioCalculator({
    materials,
    productRules: allRules,
  });

  const createScenarioMutation = useCreatePackagingScenarioMutation({
    scenariosRepository,
    materials,
    productRules: allRules,
  });

  const updateScenarioMutation = useUpdatePackagingScenarioMutation({
    scenariosRepository,
    materials,
    productRules: allRules,
  });

  const deleteScenarioMutation = useDeletePackagingScenarioMutation(
    scenariosRepository,
  );

  const isLoading =
    productsQuery.isLoading ||
    materialsQuery.isLoading ||
    scenariosQuery.isLoading ||
    rulesQuery.isLoading;

  const isSaving =
    createScenarioMutation.isPending || updateScenarioMutation.isPending;

  useEffect(() => {
    if (!scenario.values.lots.length) {
      setSelectedLotId(null);
      return;
    }

    const hasSelectedLot = scenario.values.lots.some(
      (lot) => lot.id === selectedLotId,
    );

    if (!selectedLotId || !hasSelectedLot) {
      setSelectedLotId(scenario.values.lots[0].id);
    }
  }, [scenario.values.lots, selectedLotId]);

  const lotResultsMap = useMemo(
    () => createScenarioResultMap(scenario),
    [scenario],
  );

  const selectedLot =
    scenario.values.lots.find((lot) => lot.id === selectedLotId) ??
    scenario.values.lots[0] ??
    null;

  const selectedLotResult = selectedLot
    ? lotResultsMap.get(selectedLot.id)
    : null;

  const aggregateSummaryItems = useMemo(
    () => getAggregateSummaryItems(scenario.aggregateResult),
    [scenario.aggregateResult],
  );

  const validationCounts = useMemo(
    () => getValidationCounts(scenario.aggregateResult?.validationMessages ?? []),
    [scenario.aggregateResult?.validationMessages],
  );

  const firstWarningMessage =
    (scenario.aggregateResult?.validationMessages ?? []).find(
      (message) => message.level === 'WARNING',
    )?.message ?? '';

  const visibleScenarios = useMemo(() => {
    const normalizedSearch = normalizeText(historySearch);
    const items = [...scenariosData];

    const filtered = normalizedSearch
      ? items.filter((record) => {
          const name = normalizeText(record.scenario.name);
          const lotNumbers = normalizeText(
            record.lots.map((item) => item.lot.lotNumber).join(' '),
          );

          return (
            name.includes(normalizedSearch) ||
            lotNumbers.includes(normalizedSearch)
          );
        })
      : items;

    const sorted = filtered.sort((a, b) => {
      const aDate = new Date(
        a.scenario.updatedAt || a.scenario.createdAt,
      ).getTime();
      const bDate = new Date(
        b.scenario.updatedAt || b.scenario.createdAt,
      ).getTime();

      if (historySort === 'updated_asc') {
        return aDate - bDate;
      }

      if (historySort === 'name_asc') {
        return normalizeText(a.scenario.name).localeCompare(
          normalizeText(b.scenario.name),
          'tr',
        );
      }

      if (historySort === 'name_desc') {
        return normalizeText(b.scenario.name).localeCompare(
          normalizeText(a.scenario.name),
          'tr',
        );
      }

      return bDate - aDate;
    });

    return sorted;
  }, [historySearch, historySort, scenariosData]);

  const handleAddLot = () => {
    scenario.addLot();

    queueMicrotask(() => {
      const lots = scenario.values.lots;
      const lastLot = lots[lots.length - 1];
      if (lastLot?.id) {
        setSelectedLotId(lastLot.id);
      }
    });
  };

  const handleSaveScenario = async () => {
    try {
      if (scenario.editingScenarioId) {
        await updateScenarioMutation.mutateAsync({
          scenarioId: scenario.editingScenarioId,
          values: scenario.values,
        });

        scenario.markSaved(scenario.editingScenarioId);
        toast.success('Senaryo güncellendi.');
        return;
      }

      const created = await createScenarioMutation.mutateAsync({
        values: scenario.values,
      });

      scenario.markSaved(created?.scenario?.id ?? null);
      toast.success('Senaryo kaydedildi.');
    } catch (error) {
      toast.error(error?.message || 'Senaryo kaydedilemedi.');
    }
  };

  const handleCreateNewScenario = () => {
    scenario.startCreateMode();
    setSelectedLotId(null);
  };

  const handleLoadScenario = (record) => {
    const nextValues = mapScenarioToDraftValues(record);
    scenario.loadScenario(record.scenario.id, nextValues);
    setSelectedLotId(nextValues.lots[0]?.id ?? null);
    toast.success('Senaryo yüklendi.');
  };

  const handleDuplicateScenario = (record) => {
    const nextValues = mapScenarioToDraftValues(record);

    scenario.duplicateScenario({
      ...nextValues,
      name: nextValues.name ? `${nextValues.name} (Kopya)` : 'Yeni Kopya',
      lots: nextValues.lots.map((lot) => ({
        ...lot,
        id: crypto.randomUUID(),
        values: {
          ...lot.values,
          palletLines: lot.values.palletLines.map((line) => ({
            ...line,
            id: crypto.randomUUID(),
          })),
        },
      })),
    });

    setSelectedLotId(null);
    toast.success('Senaryo kopyalandı.');
  };

  const handleDeleteScenario = async (scenarioId) => {
    try {
      await deleteScenarioMutation.mutateAsync(scenarioId);

      if (scenario.editingScenarioId === scenarioId) {
        scenario.startCreateMode();
        setSelectedLotId(null);
      }

      toast.success('Senaryo silindi.');
    } catch (error) {
      toast.error(error?.message || 'Senaryo silinemedi.');
    }
  };

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
      subtitle="Çoklu lot paketleme senaryolarını düzenleyin, 3D yükleme planını canlı izleyin ve tek ekranda yönetin."
    >
      <div className="lp-page-hero lp-page-hero--scenario">
        <div className="lp-page-hero__content">
          <div className="lp-page-hero__eyebrow">Lojistik · Senaryo Planlama</div>
          <h2 className="lp-page-hero__title">
            Çoklu Lot Paketleme Çalışma Alanı
          </h2>
          <p className="lp-page-hero__description">
            Sol panelden lot seçin, ortada detaylarını düzenleyin, altta tam genişlikte 3D sonucu ve genel dengeyi canlı takip edin.
          </p>
        </div>
      </div>

      <div className="lp-panel lp-scenario-topbar">
        <div className="lp-scenario-topbar__summary">
          {aggregateSummaryItems.map((item) => (
            <div key={item.label} className="lp-scenario-topbar__summary-item">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>

        <div className="lp-scenario-topbar__controls">
          <div className="lp-scenario-topbar__field">
            <label className="lp-field__label" htmlFor="scenario-name">
              Senaryo Adı
            </label>
            <input
              id="scenario-name"
              className="lp-input"
              value={scenario.values.name}
              onChange={(event) => scenario.setScenarioName(event.target.value)}
              placeholder="Örn. 20 DC Karma Yükleme Senaryosu"
            />
          </div>

          <div className="lp-scenario-topbar__actions">
            <span
              className={`lp-scenario-topbar__status ${getStatusClass(
                scenario.aggregateResult.validationStatus,
              )}`}
            >
              ● {resolveStatusLabel(scenario.aggregateResult.validationStatus)}
            </span>

            <button
              type="button"
              className="lp-button lp-button--ghost"
              onClick={handleCreateNewScenario}
              disabled={isSaving}
            >
              ＋ Yeni
            </button>

            <button
              type="button"
              className="lp-button"
              onClick={handleSaveScenario}
              disabled={isSaving}
            >
              {isSaving
                ? '⏳ Kaydediliyor...'
                : scenario.editingScenarioId
                  ? '🖫 Güncelle'
                  : '🖫 Kaydet'}
            </button>
          </div>

          <div className="lp-scenario-topbar__validation">
            <span className="lp-scenario-topbar__validation-pill is-error">
              Hata: {validationCounts.errors}
            </span>
            <span className="lp-scenario-topbar__validation-pill is-warning">
              Uyarı: {validationCounts.warnings}
            </span>
            <span className="lp-scenario-topbar__validation-pill is-info">
              Bilgi: {validationCounts.info}
            </span>
          </div>

          {firstWarningMessage ? (
            <div className="lp-scenario-topbar__warning-text">
              Uyarı: {firstWarningMessage}
            </div>
          ) : null}
        </div>
      </div>

      <div className="lp-panel lp-lot-strip">
        <div className="lp-lot-strip__header">
          <div>
            <h3 className="lp-lot-strip__title">Lotlar</h3>
            <p className="lp-lot-strip__description">
              Lotları buradan hızlıca ekleyin, seçin ve yönetin. Sığmazsa otomatik olarak alt satıra geçer.
            </p>
          </div>

          <button
            type="button"
            className="lp-button"
            onClick={handleAddLot}
          >
            ✚ Yeni Lot
          </button>
        </div>

        <ScenarioLotSidebar
          lots={scenario.values.lots}
          products={products}
          selectedLotId={selectedLot?.id ?? null}
          lotResultsMap={lotResultsMap}
          onSelectLot={setSelectedLotId}
          onAddLot={handleAddLot}
          onRemoveLot={(lotId) => {
            const currentLots = scenario.values.lots;
            const currentIndex = currentLots.findIndex((lot) => lot.id === lotId);
            const fallbackLot =
              currentLots[currentIndex - 1] ??
              currentLots[currentIndex + 1] ??
              null;

            scenario.removeLot(lotId);
            setSelectedLotId(fallbackLot?.id ?? null);
          }}
          onMoveLotUp={scenario.moveLotUp}
          onMoveLotDown={scenario.moveLotDown}
          hideInternalHeader
        />
      </div>

      <div className="lp-scenario-editor-fullwidth">
        <ScenarioLotEditor
          scenario={scenario}
          selectedLotId={selectedLot?.id ?? null}
          setSelectedLotId={setSelectedLotId}
          lotResult={selectedLotResult}
          aggregateResult={scenario.aggregateResult}
          products={products}
          materials={materials}
          onUpdateLotValues={(lotId, nextValuesOrUpdater) => {
            const currentLot = scenario.values.lots.find((lot) => lot.id === lotId);

            if (!currentLot) {
              return;
            }

            const nextValues =
              typeof nextValuesOrUpdater === 'function'
                ? nextValuesOrUpdater(currentLot.values)
                : {
                    ...currentLot.values,
                    ...nextValuesOrUpdater,
                  };

            const previousProductId = currentLot.values.productId ?? '';
            const nextProductId = nextValues.productId ?? '';

            if (nextProductId && nextProductId !== previousProductId) {
              const activeRules = rulesByProduct.get(nextProductId) ?? [];

              const preferredContainerMaterialId = pickPreferredMaterialByTypes(
                materials,
                activeRules,
                ['BOX', 'DRUM'],
              );

              const preferredVacuumBagMaterialId = pickPreferredMaterialByTypes(
                materials,
                activeRules,
                ['VACUUM_BAG'],
              );

              const preferredPalletMaterialId = pickPreferredMaterialByTypes(
                materials,
                activeRules,
                ['PALLET'],
              );

              nextValues.containerMaterialId =
                nextValues.containerMaterialId || preferredContainerMaterialId || '';

              nextValues.vacuumBagMaterialId =
                nextValues.vacuumBagMaterialId || preferredVacuumBagMaterialId || null;

              nextValues.palletLines = buildAutoFilledPalletLines(
                nextValues.palletLines,
                preferredPalletMaterialId,
              );
            }

            scenario.updateLotValues(lotId, nextValues);
          }}
          onAddPalletLine={(lotId, preferredId) => {
            const activeLot = scenario.values.lots.find((lot) => lot.id === lotId);
            const activeRules = activeLot?.values.productId
              ? rulesByProduct.get(activeLot.values.productId) ?? []
              : [];

            const palletMaterials = materials.filter(
              (item) => item.materialType === 'PALLET',
            );

            const preferredPalletId =
              preferredId || pickPreferredMaterial(palletMaterials, activeRules);

            scenario.addPalletLine(lotId, preferredPalletId);
          }}
          onRemovePalletLine={scenario.removePalletLine}
        />
      </div>

      <div className="lp-scenario-preview-fullwidth">
        <ScenarioPreviewPanel
          scenario={scenario}
          aggregateResult={scenario.aggregateResult}
          products={products}
          materials={materials}
        />
      </div>

      <div className="lp-panel">
        <div className="lp-section-heading">
          <div>
            <h3 className="lp-section-heading__title">Geçmiş Senaryolar</h3>
            <p className="lp-section-heading__description">
              Daha önce kaydedilen çoklu lot paketleme senaryoları.
            </p>
          </div>
        </div>

        <ScenarioHistory
          scenarios={visibleScenarios}
          products={products}
          materials={materials}
          search={historySearch}
          sort={historySort}
          onSearchChange={setHistorySearch}
          onSortChange={setHistorySort}
          onLoadScenario={handleLoadScenario}
          onDuplicateScenario={handleDuplicateScenario}
          onDeleteScenario={handleDeleteScenario}
          deletingScenarioId={deleteScenarioMutation.variables ?? null}
        />
      </div>
    </LogisticsPackagingLayout>
  );
}