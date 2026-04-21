import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  BrushCleaning,
  ChevronLeft,
  ChevronRight,
  FilePlus2,
  Grid2X2,
  History,
  Loader2,
  Package2,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react';
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
import { logisticsPackagingRuntime } from '../../runtime/logistics-packaging.runtime.js';
import Button from '../../../../shared/components/ui/Button';
import Input from '../../../../shared/components/ui/Input';
import { CalculatorForm } from '../components/calculator-form/calculator-form';
import { LogisticsPackagingLayout } from '../components/logistics-packaging-layout/logistics-packaging-layout';
import { ScenarioHistory } from '../components/scenario-history/scenario-history';
import { StackSummary } from '../components/stack-summary/stack-summary';
import { LotSummary } from '../components/lot-summary/lot-summary';
import { ContainerLoadPlan } from '../components/container-load-plan/container-load-plan';
import { AggregateBar } from '../components/aggregate-bar/aggregate-bar';
import './logistics-packaging-calculator-page.css';

const {
  productsRepository,
  materialsRepository,
  rulesRepository,
  scenariosRepository,
} = logisticsPackagingRuntime;

function pickPreferredMaterial(materials, rules) {
  if (!materials.length) return '';
  if (!rules.length) return materials[0]?.id ?? '';

  const requiredIds = new Set(
    rules.filter((rule) => rule.isRequired).map((rule) => rule.materialId),
  );

  const requiredMatch = materials.find((item) => requiredIds.has(item.id));
  return requiredMatch?.id ?? materials[0]?.id ?? '';
}

function translateValidationStatus(status) {
  if (status === 'VALID') return 'Uygun';
  if (status === 'WARNING') return 'Uyarılı';
  if (status === 'INVALID') return 'Hatalı';
  return status ?? '-';
}

function getStatusClass(status) {
  if (status === 'INVALID') return 'is-invalid';
  if (status === 'WARNING') return 'is-warning';
  return '';
}

function createDefaultPalletLine() {
  return {
    id: crypto.randomUUID(),
    palletMaterialId: '',
    palletCount: 1,
    unitsPerRow: '',
    unitsPerPallet: '',
    stackGroup: '',
    stackOrder: 1,
  };
}

function mapScenarioHistoryItemToFormValues(item) {
  return {
    name: item.scenario.name || '',
    lots: item.lots.map((lotWrapper) => ({
      id: crypto.randomUUID(),
      values: {
        lotNumber: lotWrapper.lot.lotNumber || '',
        productId: lotWrapper.lot.productId || '',
        totalQuantityKg:
          lotWrapper.lot.totalQuantityKg == null
            ? ''
            : Number(lotWrapper.lot.totalQuantityKg),
        containerMaterialId: lotWrapper.lot.containerMaterialId || '',
        vacuumBagMaterialId: lotWrapper.lot.vacuumBagMaterialId || null,
        unitNetWeightKg:
          lotWrapper.lot.unitNetWeightKg == null
            ? ''
            : Number(lotWrapper.lot.unitNetWeightKg),
        notes: lotWrapper.lot.notes || '',
        palletLines:
          lotWrapper.palletLines.length > 0
            ? lotWrapper.palletLines.map((line) => ({
                id: crypto.randomUUID(),
                palletMaterialId: line.palletMaterialId || '',
                palletCount: line.palletCount ?? 1,
                unitsPerRow: line.unitsPerRow ?? '',
                unitsPerPallet: line.unitsPerPallet ?? '',
                stackGroup: line.stackGroup || '',
                stackOrder: line.stackOrder ?? 1,
              }))
            : [createDefaultPalletLine()],
      },
    })),
  };
}

function mapScenarioHistoryItemToDuplicatedFormValues(item) {
  const base = mapScenarioHistoryItemToFormValues(item);

  return {
    ...base,
    name: base.name ? `${base.name} (Kopya)` : 'Kopya Senaryo',
  };
}

function sortScenarios(items, sort) {
  const list = [...items];

  if (sort === 'name_asc') {
    return list.sort((a, b) =>
      String(a.scenario.name || '').localeCompare(String(b.scenario.name || ''), 'tr'),
    );
  }

  if (sort === 'name_desc') {
    return list.sort((a, b) =>
      String(b.scenario.name || '').localeCompare(String(a.scenario.name || ''), 'tr'),
    );
  }

  if (sort === 'updated_asc') {
    return list.sort((a, b) => {
      const left = new Date(a.scenario.updatedAt ?? a.scenario.createdAt ?? 0).getTime();
      const right = new Date(b.scenario.updatedAt ?? b.scenario.createdAt ?? 0).getTime();
      return left - right;
    });
  }

  return list.sort((a, b) => {
    const left = new Date(a.scenario.updatedAt ?? a.scenario.createdAt ?? 0).getTime();
    const right = new Date(b.scenario.updatedAt ?? b.scenario.createdAt ?? 0).getTime();
    return right - left;
  });
}

function filterScenarios(items, search) {
  const normalized = search.trim().toLocaleLowerCase('tr');

  if (!normalized) {
    return items;
  }

  return items.filter((item) => {
    const name = String(item.scenario.name || '').toLocaleLowerCase('tr');
    const lotNumbers = item.lots
      .map((lotWrapper) => String(lotWrapper.lot.lotNumber || '').toLocaleLowerCase('tr'))
      .join(' ');

    return name.includes(normalized) || lotNumbers.includes(normalized);
  });
}

function confirmDiscardChanges(isDirty, message) {
  if (!isDirty) {
    return true;
  }

  return window.confirm(message);
}

export function LogisticsPackagingCalculatorPage() {
  const productsQuery = usePackagingProductsQuery(productsRepository);
  const materialsQuery = usePackagingMaterialsQuery(materialsRepository);
  const rulesQuery = usePackagingRulesQuery(rulesRepository);
  const scenariosQuery = usePackagingScenariosQuery(scenariosRepository);

  const products = productsQuery.data ?? [];
  const materials = materialsQuery.data ?? [];
  const allRules = rulesQuery.data ?? [];
  const scenarios = scenariosQuery.data ?? [];

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

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

  const [focusedProblemLotId, setFocusedProblemLotId] = useState(null);
  const [activeLotId, setActiveLotId] = useState(null);
  const [historySearch, setHistorySearch] = useState('');
  const [historySort, setHistorySort] = useState('updated_desc');
  const [activeBottomTab, setActiveBottomTab] = useState('stack');
  const [headerActionLoading, setHeaderActionLoading] = useState(null);

  const isLoading =
    productsQuery.isLoading ||
    materialsQuery.isLoading ||
    rulesQuery.isLoading ||
    scenariosQuery.isLoading;

  const isSaving =
    createScenarioMutation.isPending || updateScenarioMutation.isPending;

  const sharedStackGroupOptions = useMemo(() => {
    return Array.from(
      new Set(
        scenario.values.lots.flatMap((lot) =>
          lot.values.palletLines
            .map((line) => line.stackGroup?.trim())
            .filter(Boolean),
        ),
      ),
    ).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [scenario.values.lots]);

  const visibleScenarios = useMemo(() => {
    return sortScenarios(filterScenarios(scenarios, historySearch), historySort);
  }, [historySearch, historySort, scenarios]);

  const runHeaderAction = (key, callback) => {
    setHeaderActionLoading(key);

    window.setTimeout(() => {
      try {
        callback();
      } finally {
        window.setTimeout(() => {
          setHeaderActionLoading((current) => (current === key ? null : current));
        }, 450);
      }
    }, 120);
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!scenario.isDirty) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [scenario.isDirty]);

  useEffect(() => {
    const handleShortcuts = (event) => {
      if (!event.altKey) return;

      const tag = String(document.activeElement?.tagName || '').toLowerCase();
      const isTyping =
        tag === 'input' || tag === 'textarea' || tag === 'select' || document.activeElement?.isContentEditable;

      if (isTyping) return;

      const key = event.key.toLowerCase();

      if (key === 'c') {
        event.preventDefault();
        runHeaderAction('clear', handleClearScenario);
      }

      if (key === 'n') {
        event.preventDefault();
        runHeaderAction('new', handleStartNewScenario);
      }

      if (key === 'l') {
        event.preventDefault();
        runHeaderAction('add', handleAddLot);
      }
    };

    window.addEventListener('keydown', handleShortcuts);
    return () => {
      window.removeEventListener('keydown', handleShortcuts);
    };
  });

  useEffect(() => {
    const firstLotId = scenario.values.lots[0]?.id ?? null;

    if (!firstLotId) {
      setActiveLotId(null);
      return;
    }

    const exists = scenario.values.lots.some((lot) => lot.id === activeLotId);

    if (!exists) {
      setActiveLotId(firstLotId);
    }
  }, [activeLotId, scenario.values.lots]);

  useEffect(() => {
    scenario.values.lots.forEach((lot) => {
      const lotRules = allRules.filter(
        (rule) => rule.productId === lot.values.productId,
      );

      const allowedMaterialIds = lotRules.map((rule) => rule.materialId);
      const allowedSet = new Set(allowedMaterialIds);

      const allowedMaterials =
        allowedSet.size > 0
          ? materials.filter((item) => allowedSet.has(item.id))
          : materials;

      const allowedContainers = allowedMaterials.filter(
        (item) => item.materialType === 'BOX' || item.materialType === 'DRUM',
      );
      const allowedVacuumBags = allowedMaterials.filter(
        (item) => item.materialType === 'VACUUM_BAG',
      );
      const allowedPallets = allowedMaterials.filter(
        (item) => item.materialType === 'PALLET',
      );

      const preferredContainerId = pickPreferredMaterial(allowedContainers, lotRules);
      const preferredVacuumBagId = pickPreferredMaterial(allowedVacuumBags, lotRules);
      const preferredPalletId = pickPreferredMaterial(allowedPallets, lotRules);

      let hasChanges = false;

      const nextPalletLines = lot.values.palletLines.map((line) => {
        if (!lot.values.productId) {
          return line;
        }

        if (
          (!line.palletMaterialId || !allowedSet.has(line.palletMaterialId)) &&
          preferredPalletId
        ) {
          hasChanges = true;
          return {
            ...line,
            palletMaterialId: preferredPalletId,
          };
        }

        return line;
      });

      const shouldFixContainer =
        lot.values.productId &&
        ((!lot.values.containerMaterialId && preferredContainerId) ||
          (lot.values.containerMaterialId &&
            !allowedSet.has(lot.values.containerMaterialId)));

      const shouldFixVacuumBag =
        lot.values.productId &&
        (
          (
            (!lot.values.vacuumBagMaterialId || lot.values.vacuumBagMaterialId === '') &&
            preferredVacuumBagId
          ) ||
          (
            lot.values.vacuumBagMaterialId &&
            !allowedSet.has(lot.values.vacuumBagMaterialId) &&
            preferredVacuumBagId
          ) ||
          (
            lot.values.vacuumBagMaterialId &&
            !allowedSet.has(lot.values.vacuumBagMaterialId) &&
            !preferredVacuumBagId
          )
        );

      if (shouldFixContainer || shouldFixVacuumBag) {
        hasChanges = true;
      }

      if (hasChanges) {
        scenario.updateLotValues(lot.id, (current) => ({
          ...current,
          containerMaterialId:
            shouldFixContainer
              ? preferredContainerId || ''
              : current.containerMaterialId,
          vacuumBagMaterialId:
            shouldFixVacuumBag
              ? preferredVacuumBagId || null
              : current.vacuumBagMaterialId,
          palletLines: nextPalletLines,
        }));
      }
    });
  }, [allRules, materials, scenario]);

  const activeLot = useMemo(
    () => scenario.values.lots.find((lot) => lot.id === activeLotId) ?? null,
    [activeLotId, scenario.values.lots],
  );

  const activeLotIndex = useMemo(
    () => scenario.values.lots.findIndex((lot) => lot.id === activeLotId),
    [activeLotId, scenario.values.lots],
  );

  const activeLotResult = useMemo(() => {
    if (!activeLot) {
      return null;
    }

    return scenario.getLotResult(activeLot.id);
  }, [activeLot, scenario]);

  const activeLotRules = useMemo(() => {
    if (!activeLot) {
      return [];
    }

    return allRules.filter((rule) => rule.productId === activeLot.values.productId);
  }, [activeLot, allRules]);

  const activeAllowedMaterialIds = useMemo(
    () => activeLotRules.map((rule) => rule.materialId),
    [activeLotRules],
  );

  const activeAllowedSet = useMemo(
    () => new Set(activeAllowedMaterialIds),
    [activeAllowedMaterialIds],
  );

  const activeAllowedMaterials = useMemo(() => {
    return activeAllowedSet.size > 0
      ? materials.filter((item) => activeAllowedSet.has(item.id))
      : materials;
  }, [activeAllowedSet, materials]);

  const activeAllowedPallets = useMemo(
    () => activeAllowedMaterials.filter((item) => item.materialType === 'PALLET'),
    [activeAllowedMaterials],
  );

  const activePreferredPalletId = useMemo(
    () => pickPreferredMaterial(activeAllowedPallets, activeLotRules),
    [activeAllowedPallets, activeLotRules],
  );

  const handleSaveScenario = async () => {
    const lotStatuses = scenario.values.lots.map((lot) => ({
      lotId: lot.id,
      status: scenario.getLotResult(lot.id).validationStatus,
      values: lot.values,
    }));

    const duplicateLotNumber = (() => {
      const normalized = lotStatuses
        .map((item) => item.values.lotNumber.trim())
        .filter(Boolean)
        .map((value) => value.toLocaleLowerCase('tr'));

      const seen = new Set();

      for (const value of normalized) {
        if (seen.has(value)) {
          return value;
        }
        seen.add(value);
      }

      return null;
    })();

    if (duplicateLotNumber) {
      toast.error('Aynı lot numarası birden fazla kez kullanılamaz.');
      return;
    }

    const firstInvalidLot = lotStatuses.find((item) => item.status === 'INVALID');

    if (firstInvalidLot) {
      setFocusedProblemLotId(firstInvalidLot.lotId);
      setActiveLotId(firstInvalidLot.lotId);

      requestAnimationFrame(() => {
        const element = document.getElementById(
          `lp-scenario-lot-tab-${firstInvalidLot.lotId}`,
        );

        element?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
        });
      });

      window.setTimeout(() => {
        setFocusedProblemLotId((current) =>
          current === firstInvalidLot.lotId ? null : current,
        );
      }, 2200);

      toast.error('Kaydetmeden önce hatalı lotu düzeltin.');
      return;
    }

    try {
      if (scenario.editingScenarioId) {
        await updateScenarioMutation.mutateAsync({
          scenarioId: scenario.editingScenarioId,
          values: scenario.values,
        });

        scenario.markSaved(scenario.editingScenarioId);
        toast.success('Senaryo güncellendi.');
      } else {
        const created = await createScenarioMutation.mutateAsync({
          values: scenario.values,
        });

        scenario.markSaved(created?.scenario?.id ?? null);
        toast.success('Paketleme senaryosu kaydedildi.');
      }

      setFocusedProblemLotId(null);
    } catch (error) {
      toast.error(error?.message || 'Kayıt sırasında hata oluştu.');
    }
  };

  const handleLoadScenario = (historyItem) => {
    const canContinue = confirmDiscardChanges(
      scenario.isDirty,
      'Kaydedilmemiş değişiklikler var. Yine de devam etmek istiyor musunuz?',
    );

    if (!canContinue) {
      return;
    }

    const nextValues = mapScenarioHistoryItemToFormValues(historyItem);
    scenario.loadScenario(historyItem.scenario.id, nextValues);
    setActiveLotId(nextValues.lots[0]?.id ?? null);
    setActiveBottomTab('stack');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setFocusedProblemLotId(null);
    toast.success('Senaryo forma yüklendi.');
  };

  const handleDuplicateScenario = (historyItem) => {
    const canContinue = confirmDiscardChanges(
      scenario.isDirty,
      'Kaydedilmemiş değişiklikler var. Yine de devam etmek istiyor musunuz?',
    );

    if (!canContinue) {
      return;
    }

    const nextValues = mapScenarioHistoryItemToDuplicatedFormValues(historyItem);
    scenario.duplicateScenario(nextValues);
    setActiveLotId(nextValues.lots[0]?.id ?? null);
    setActiveBottomTab('stack');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setFocusedProblemLotId(null);
    toast.success('Senaryo kopyalanıp forma yüklendi.');
  };

  const handleDeleteScenario = async (historyItem) => {
    const scenarioName = historyItem.scenario.name || 'İsimsiz Senaryo';
    const isConfirmed = window.confirm(
      `"${scenarioName}" senaryosunu silmek istediğinize emin misiniz?`,
    );

    if (!isConfirmed) {
      return;
    }

    try {
      await deleteScenarioMutation.mutateAsync(historyItem.scenario.id);
      toast.success('Senaryo silindi.');

      if (scenario.editingScenarioId === historyItem.scenario.id) {
        scenario.startCreateMode();
        setActiveLotId(null);
        setActiveBottomTab('stack');
      }
    } catch (error) {
      toast.error(
        error?.message ||
          'Silme sırasında hata oluştu. DELETE policy eksik olabilir.',
      );
    }
  };

  const handleStartNewScenario = () => {
    const canContinue = confirmDiscardChanges(
      scenario.isDirty,
      'Kaydedilmemiş değişiklikler var. Yeni senaryoya geçmek istiyor musunuz?',
    );

    if (!canContinue) {
      return;
    }

    scenario.startCreateMode();
    setActiveLotId(null);
    setFocusedProblemLotId(null);
    setActiveBottomTab('stack');
  };

  const handleClearScenario = () => {
    const canContinue = confirmDiscardChanges(
      scenario.isDirty,
      'Ekrandaki tüm lot ve alanlar temizlenecek. Devam etmek istiyor musunuz?',
    );

    if (!canContinue) {
      return;
    }

    scenario.startCreateMode();
    setActiveLotId(null);
    setFocusedProblemLotId(null);
    toast.success('Senaryo ekranı temizlendi.');
  };

  const handleAddLot = () => {
    scenario.addLot();
  };

  const handleSelectLot = (lotId) => {
    setActiveLotId(lotId);
    setFocusedProblemLotId(null);
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
      subtitle="Aynı sevkiyat içinde birden fazla lotu hesaplayın, lot bazlı planı yönetin ve toplam durumu üstte görün."
      actions={
        <div className="lp-header-actions">
          <Button
            type="button"
            variant="ghost"
            className="lp-button lp-button--ghost lp-button--iconic lp-button--sweep lp-button--tooltip"
            onClick={() => runHeaderAction('clear', handleClearScenario)}
            data-tooltip="Formu ve lotları temizle"
          >
            {headerActionLoading === 'clear' ? (
              <Loader2 size={18} className="lp-button__icon lp-button__icon--spin" />
            ) : (
              <BrushCleaning size={18} className="lp-button__icon" />
            )}
            <span>Temizle</span>
            <kbd className="lp-shortcut-badge">Alt+C</kbd>
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="lp-button lp-button--ghost lp-button--iconic lp-button--new lp-button--tooltip"
            onClick={() => runHeaderAction('new', handleStartNewScenario)}
            data-tooltip="Yeni boş senaryo başlat"
          >
            {headerActionLoading === 'new' ? (
              <Loader2 size={18} className="lp-button__icon lp-button__icon--spin" />
            ) : (
              <FilePlus2 size={18} className="lp-button__icon" />
            )}
            <span>Yeni Senaryo</span>
            <kbd className="lp-shortcut-badge">Alt+N</kbd>
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="lp-button lp-button--iconic lp-button--primary-glow lp-button--tooltip"
            onClick={() => runHeaderAction('add', handleAddLot)}
            data-tooltip="Yeni lot ekle"
          >
            {headerActionLoading === 'add' ? (
              <Loader2 size={18} className="lp-button__icon lp-button__icon--spin" />
            ) : (
              <Plus size={18} className="lp-button__icon" />
            )}
            <span>Lot Ekle</span>
            <kbd className="lp-shortcut-badge">Alt+L</kbd>
          </Button>
        </div>
      }
    >
      <div className="lp-page-stack">
        <div className="lp-panel">
          <div className="lp-section-heading">
            <div>
              <h3 className="lp-section-heading__title">Senaryo Bilgisi</h3>
              <p className="lp-section-heading__description">
                Aynı sevkiyat içinde yer alan lotları tek senaryo altında yönetin.
              </p>
            </div>
          </div>

          <div className="lp-form-grid lp-form-grid--4">
            <label className="lp-field">
              <span className="lp-field__label">Senaryo Adı</span>
              <Input
                className="lp-input"
                type="text"
                value={scenario.values.name}
                onChange={(event) => scenario.setScenarioName(event.target.value)}
                placeholder="Örn: Müşteri X / 14 Nisan Sevkiyatı"
              />
            </label>

            <div className="lp-field">
              <span className="lp-field__label">Mod</span>
              <div className="lp-input">
                {scenario.editingScenarioId ? 'Düzenleme' : 'Yeni kayıt'}
              </div>
            </div>

            <div className="lp-field">
              <span className="lp-field__label">Lot Sayısı</span>
              <div className="lp-input">{scenario.values.lots.length}</div>
            </div>

            <div className="lp-field">
              <span className="lp-field__label">Durum</span>
              <div className="lp-input">
                {translateValidationStatus(scenario.aggregateResult.validationStatus)}
                {scenario.isDirty ? ' · Kaydedilmemiş değişiklik var' : ''}
              </div>
            </div>
          </div>
        </div>

        <AggregateBar
          aggregate={scenario.aggregateResult}
          lots={scenario.values.lots}
        />

        <div className="lp-panel lp-lot-tabs-panel">
          <div className="lp-section-heading">
            <div>
              <h3 className="lp-section-heading__title">Lotlar</h3>
              <p className="lp-section-heading__description">
                Yeni lotlar sağa doğru eklenir, alan biterse alt satıra geçer. Düzenlemek için bir lot seçin.
              </p>
            </div>
          </div>

          <div className="lp-lot-tabs-grid">
            {scenario.values.lots.map((lot, index) => {
              const lotRules = allRules.filter(
                (rule) => rule.productId === lot.values.productId,
              );

              const allowedMaterialIds = lotRules.map((rule) => rule.materialId);
              const allowedSet = new Set(allowedMaterialIds);

              const allowedMaterials =
                allowedSet.size > 0
                  ? materials.filter((item) => allowedSet.has(item.id))
                  : materials;

              const allowedPallets = allowedMaterials.filter(
                (item) => item.materialType === 'PALLET',
              );

              const preferredPalletId = pickPreferredMaterial(allowedPallets, lotRules);
              const lotResult = scenario.getLotResult(lot.id);
              const isActive = lot.id === activeLotId;
              const product = productMap.get(lot.values.productId);

              return (
                <div
                  key={lot.id}
                  id={`lp-scenario-lot-tab-${lot.id}`}
                  className={`lp-panel lp-scenario-lot-tab ${getStatusClass(
                    lotResult.validationStatus,
                  )} ${focusedProblemLotId === lot.id ? 'is-focused' : ''} ${
                    isActive ? 'is-active' : ''
                  }`}
                  onClick={() => handleSelectLot(lot.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleSelectLot(lot.id);
                    }
                  }}
                >
                  <div className="lp-scenario-lot-tab__header">
                    <div className="lp-scenario-lot-tab__meta">
                      <h3 className="lp-scenario-lot-tab__title">
                        {lot.values.lotNumber?.trim() || `Lot ${index + 1}`}
                      </h3>
                      <p className="lp-scenario-lot-tab__description">
                        {product
                          ? `${product.code} - ${product.name}`
                          : 'Ürün seçilmedi'}
                      </p>
                    </div>

                    <div className="lp-lot-card-actions">
                      <Button
                        type="button"
            variant="ghost"
                        className="lp-button lp-button--ghost lp-button--iconic-sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          scenario.moveLotUp(lot.id);
                        }}
                        disabled={index === 0}
                        title="Sola taşı"
                      >
                        <ChevronLeft size={16} className="lp-button__icon" />
                      </Button>

                      <Button
                        type="button"
            variant="ghost"
                        className="lp-button lp-button--ghost lp-button--iconic-sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          scenario.moveLotDown(lot.id);
                        }}
                        disabled={index === scenario.values.lots.length - 1}
                        title="Sağa taşı"
                      >
                        <ChevronRight size={16} className="lp-button__icon" />
                      </Button>

                      <Button
                        type="button"
            variant="ghost"
                        className="lp-button lp-button--ghost lp-button--iconic-sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          scenario.removeLot(lot.id);
                        }}
                        disabled={scenario.values.lots.length === 1}
                        title="Lotu sil"
                      >
                        <Trash2 size={16} className="lp-button__icon" />
                        <span>Sil</span>
                      </Button>
                    </div>
                  </div>

                  {lotResult.stackSummaries?.length ? (
                    <div className="lp-scenario-lot-tab__stack-chips">
                      {lotResult.stackSummaries.slice(0, 3).map((stack) => (
                        <span
                          key={stack.stackGroup}
                          className={`lp-scenario-lot-tab__stack-chip ${
                            stack.exceedsStackHeightLimit ? 'is-warning' : 'is-valid'
                          }`}
                        >
                          {stack.stackGroup} · {Number(stack.totalHeightCm ?? 0).toFixed(0)} cm
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="lp-scenario-lot-tab__stats">
                    <div className="lp-scenario-lot-tab__stat">
                      <span>Durum</span>
                      <strong>{translateValidationStatus(lotResult.validationStatus)}</strong>
                    </div>
                    <div className="lp-scenario-lot-tab__stat">
                      <span>Brüt</span>
                      <strong>{lotResult.totalGrossWeightKg.toFixed(3)} kg</strong>
                    </div>
                    <div className="lp-scenario-lot-tab__stat">
                      <span>Palet</span>
                      <strong>{lotResult.totalPalletCount}</strong>
                    </div>
                  </div>

                  <div className="lp-scenario-lot-tab__footer">
                    <Button
                      type="button"
            variant="ghost"
                      className="lp-button lp-button--ghost lp-button--iconic"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleSelectLot(lot.id);
                      }}
                    >
                      <Sparkles size={16} className="lp-button__icon" />
                      <span>Düzenle</span>
                    </Button>

                    <Button
                      type="button"
            variant="ghost"
                      className="lp-button lp-button--iconic"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleSelectLot(lot.id);
                        scenario.addPalletLine(lot.id, preferredPalletId);
                      }}
                    >
                      <Plus size={16} className="lp-button__icon" />
                      <span>Palet Satırı Ekle</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {activeLot && activeLotResult ? (
          <div className="lp-editor-layout lp-editor-layout--single">
            <div className="lp-editor-layout__main">
              <div className="lp-panel lp-scenario-lot-card">
                <div className="lp-scenario-lot-card__header">
                  <div className="lp-scenario-lot-card__meta">
                    <h3 className="lp-scenario-lot-card__title">
                      Seçili Lot · {activeLot.values.lotNumber?.trim() || `Lot ${activeLotIndex + 1}`}
                    </h3>
                    <p className="lp-scenario-lot-card__description">
                      Seçili lotun detaylarını düzenleyin. Diğer lotlar üst kartlarda kalır.
                    </p>
                  </div>

                  <div className="lp-scenario-lot-card__active-badge">
                    {translateValidationStatus(activeLotResult.validationStatus)}
                  </div>
                </div>

                <LotSummary
                  values={activeLot.values}
                  result={activeLotResult}
                  products={products}
                />

                <CalculatorForm
                  values={activeLot.values}
                  result={activeLotResult}
                  products={products}
                  materials={materials}
                  allowedMaterialIds={activeAllowedMaterialIds}
                  sharedStackGroupOptions={sharedStackGroupOptions}
                  onChangeValues={(updater) => scenario.updateLotValues(activeLot.id, updater)}
                  onAddPalletLine={() =>
                    scenario.addPalletLine(activeLot.id, activePreferredPalletId)
                  }
                  onRemovePalletLine={(lineId) =>
                    scenario.removePalletLine(activeLot.id, lineId)
                  }
                  onSubmit={handleSaveScenario}
                  isSaving={isSaving}
                  hideSubmit
                />
              </div>
            </div>
          </div>
        ) : null}

        <div className="lp-panel lp-bottom-tabs-panel">
          <div className="lp-bottom-tabs">
            <Button
              type="button"
            variant="ghost"
              className={`lp-bottom-tabs__button ${activeBottomTab === 'stack' ? 'is-active' : ''}`}
              onClick={() => setActiveBottomTab('stack')}
            >
              <Grid2X2 size={16} className="lp-tab-icon" />
              <span>Genel İstif Özeti</span>
            </Button>

            <Button
              type="button"
            variant="ghost"
              className={`lp-bottom-tabs__button ${activeBottomTab === 'loadPlan' ? 'is-active' : ''}`}
              onClick={() => setActiveBottomTab('loadPlan')}
            >
              <Package2 size={16} className="lp-tab-icon" />
              <span>3D Konteyner Planı</span>
            </Button>

            <Button
              type="button"
            variant="ghost"
              className={`lp-bottom-tabs__button ${activeBottomTab === 'history' ? 'is-active' : ''}`}
              onClick={() => setActiveBottomTab('history')}
            >
              <History size={16} className="lp-tab-icon" />
              <span>Geçmiş Senaryolar</span>
            </Button>
          </div>

          <div className="lp-bottom-tabs__content">
            {activeBottomTab === 'stack' ? (
              <div className="lp-bottom-tabs__pane">
                <div className="lp-section-heading">
                  <div>
                    <h3 className="lp-section-heading__title">Genel İstif Özeti</h3>
                    <p className="lp-section-heading__description">
                      Tüm lotların ortak istif çıktıları.
                    </p>
                  </div>
                </div>

                <StackSummary stacks={scenario.aggregateResult.stackSummaries} />
              </div>
            ) : null}

            {activeBottomTab === 'loadPlan' ? (
              <div className="lp-bottom-tabs__pane">
                <ContainerLoadPlan
                  scenario={scenario}
                  products={products}
                  materials={materials}
                />
              </div>
            ) : null}

            {activeBottomTab === 'history' ? (
              <div className="lp-bottom-tabs__pane">
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
            ) : null}
          </div>
        </div>

        <div className="lp-form-actions lp-form-actions--safe">
          <Button
            type="button"
            variant="ghost"
            className="lp-button lp-button--iconic lp-button--primary-glow"
            disabled={isSaving}
            onClick={handleSaveScenario}
          >
            {isSaving ? (
              <Loader2 size={18} className="lp-button__icon lp-button__icon--spin" />
            ) : (
              <Save size={18} className="lp-button__icon" />
            )}
            <span>
              {isSaving
                ? 'Kaydediliyor...'
                : scenario.editingScenarioId
                  ? 'Senaryoyu Güncelle'
                  : 'Senaryoyu Kaydet'}
            </span>
          </Button>
        </div>
      </div>
    </LogisticsPackagingLayout>
  );
}