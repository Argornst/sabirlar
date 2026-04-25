import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  formatDispatchDateLabel,
  formatQuantityLabel,
} from "../../domain/entities/production.entity";
import { ProductionStatusBadge } from "./ProductionStatusBadge";
import { useUpdateProductionMutation } from "../hooks/useUpdateProductionMutation";
import { useDispatchFeedback } from "../hooks/useDispatchFeedback";
import { DispatchToastViewport } from "./DispatchToastViewport";
import Button from "../../../../shared/components/ui/Button";
import DatePicker from "../../../../shared/components/ui/DatePicker";
import Input from "../../../../shared/components/ui/Input";
import Modal from "../../../../shared/components/ui/Modal";
import Pressable from "../../../../shared/components/ui/Pressable";
import Select from "../../../../shared/components/ui/Select";
import Textarea from "../../../../shared/components/ui/Textarea";
import { createProductionDispatchLogs } from "../../runtime/productions.runtime";
import { dispatchLogKeys } from "../hooks/useDispatchLogsQuery";

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthMatrix(baseDate) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const firstGridDate = new Date(firstDayOfMonth);
  const dayOfWeek = firstDayOfMonth.getDay();
  const diffToMondayBasedStart = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  firstGridDate.setDate(firstDayOfMonth.getDate() + diffToMondayBasedStart);

  const weeks = [];
  const cursor = new Date(firstGridDate);

  for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
    const week = [];

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    weeks.push(week);
  }

  return weeks;
}

function getGroupedByDate(items) {
  return items.reduce((acc, item) => {
    if (!item.dispatch_date) return acc;
    if (!acc[item.dispatch_date]) acc[item.dispatch_date] = [];
    acc[item.dispatch_date].push(item);
    return acc;
  }, {});
}

function getMonthTitle(date) {
  return new Intl.DateTimeFormat("tr-TR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function isSameDay(dateA, dateB) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function createEditState(item) {
  if (!item) {
    return {
      status: "hazirlaniyor",
      dispatch_date: "",
      notes: "",
      packaging_info: "",
      pallet_info: "",
      vehicle_info: "",
    };
  }

  return {
    status: item.status || "hazirlaniyor",
    dispatch_date: item.dispatch_date || "",
    notes: item.notes || "",
    packaging_info: item.packaging_info || "",
    pallet_info: item.pallet_info || "",
    vehicle_info: item.vehicle_info || "",
  };
}

function formatItemCountLabel(count) {
  return count === 1 ? "1 kayıt taşındı" : `${count} kayıt taşındı`;
}

const WEEKDAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

const STATUS_OPTIONS = [
  { value: "hazirlaniyor", label: "Hazırlanıyor" },
  { value: "hazir", label: "Hazır" },
  { value: "sevk_planlandi", label: "Sevk Planlandı" },
  { value: "sevk_edildi", label: "Sevk Edildi" },
];

function DispatchEventModal({
  item,
  open,
  formState,
  onChange,
  onClose,
  onSave,
  isSaving,
}) {
  if (!open || !item) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="dispatch-modal-backdrop"
      panelClassName="dispatch-modal dispatch-modal--premium"
      bodyClassName="dispatch-modal__body"
      size="lg"
    >
      <div className="dispatch-modal__header">
        <div className="dispatch-modal__header-main">
          <div className="dispatch-modal__title-group">
            <h3 className="dispatch-modal__title">{item.customer_name}</h3>
            <p className="dispatch-modal__subtitle">{item.product_name}</p>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="dispatch-modal__close"
            onClick={onClose}
            aria-label="Kapat"
          >
            ×
          </Button>
        </div>
      </div>

      <div className="dispatch-modal__summary-grid">
        <div className="dispatch-modal__summary-card">
          <span>Lot</span>
          <strong>{item.lot_no}</strong>
        </div>

        <div className="dispatch-modal__summary-card">
          <span>Miktar</span>
          <strong>{formatQuantityLabel(item.quantity, item.quantity_unit)}</strong>
        </div>

        <div className="dispatch-modal__summary-card">
          <span>Durum</span>
          <ProductionStatusBadge status={formState.status} />
        </div>
      </div>

      <div className="dispatch-modal__form-grid">
        <div className="dispatch-modal__field">
          <label className="dispatch-modal__label">Durum</label>
          <Select
            className="dispatch-modal__input dispatch-modal__input--select"
            value={formState.status}
            onChange={(event) => onChange("status", event.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="dispatch-modal__field">
          <label className="dispatch-modal__label">Çıkış Tarihi</label>
          <DatePicker
            value={formState.dispatch_date}
            onChange={(event) => onChange("dispatch_date", event.target.value)}
            placeholder="gg.aa.yyyy"
          />
        </div>

        <div className="dispatch-modal__field">
          <label className="dispatch-modal__label">Paketleme Bilgisi</label>
          <Input
            className="dispatch-modal__input"
            type="text"
            value={formState.packaging_info}
            onChange={(event) => onChange("packaging_info", event.target.value)}
            placeholder="Örn: 1000 KUTU"
          />
        </div>

        <div className="dispatch-modal__field">
          <label className="dispatch-modal__label">Palet Bilgisi</label>
          <Input
            className="dispatch-modal__input"
            type="text"
            value={formState.pallet_info}
            onChange={(event) => onChange("pallet_info", event.target.value)}
            placeholder="Örn: 25"
          />
        </div>

        <div className="dispatch-modal__field dispatch-modal__field--full">
          <label className="dispatch-modal__label">Araç Bilgisi</label>
          <Input
            className="dispatch-modal__input"
            type="text"
            value={formState.vehicle_info}
            onChange={(event) => onChange("vehicle_info", event.target.value)}
            placeholder="Örn: TIR 1"
          />
        </div>

        <div className="dispatch-modal__field dispatch-modal__field--full">
          <label className="dispatch-modal__label">Not</label>
          <Textarea
            className="dispatch-modal__textarea"
            rows={4}
            value={formState.notes}
            onChange={(event) => onChange("notes", event.target.value)}
            placeholder="Operasyon notları..."
          />
        </div>
      </div>

      <div className="dispatch-modal__footer">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={isSaving}
        >
          İptal
        </Button>

        <Button
          type="submit"
          variant="primary"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>
    </Modal>
  );
}

export function DispatchCalendar({ items }) {
  const today = new Date();
  const queryClient = useQueryClient();
  const updateMutation = useUpdateProductionMutation();
  const { toasts, pushToast, dismissToast } = useDispatchFeedback();

  const navigationTimerRef = useRef(null);

  const initialCalendarDate = useMemo(() => {
    if (items.length && items[0]?.dispatch_date) {
      const firstDispatchDate = new Date(items[0].dispatch_date);
      if (!Number.isNaN(firstDispatchDate.getTime())) {
        return new Date(
          firstDispatchDate.getFullYear(),
          firstDispatchDate.getMonth(),
          1
        );
      }
    }

    return new Date(today.getFullYear(), today.getMonth(), 1);
  }, [items, today]);

  const [currentMonth, setCurrentMonth] = useState(initialCalendarDate);
  const [selectedDateKey, setSelectedDateKey] = useState(formatDateKey(today));
  const [selectedItem, setSelectedItem] = useState(null);
  const [editState, setEditState] = useState(createEditState(null));
  const [draggingItemIds, setDraggingItemIds] = useState([]);
  const [dragTargetDate, setDragTargetDate] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkMoveDate, setBulkMoveDate] = useState("");
  const [dragNavDirection, setDragNavDirection] = useState("");

  const groupedItems = useMemo(() => getGroupedByDate(items), [items]);
  const monthMatrix = useMemo(() => getMonthMatrix(currentMonth), [currentMonth]);
  const selectedItems = groupedItems[selectedDateKey] || [];

  useEffect(() => {
    if (!selectedItem) return;

    const refreshedSelectedItem =
      items.find((entry) => entry.id === selectedItem.id) || null;

    setSelectedItem(refreshedSelectedItem);
    setEditState(createEditState(refreshedSelectedItem));
  }, [items, selectedItem?.id]);

  useEffect(() => {
    setSelectedIds((prev) =>
      prev.filter((id) => items.some((item) => item.id === id))
    );
  }, [items]);

  useEffect(() => {
    return () => {
      if (navigationTimerRef.current) {
        window.clearTimeout(navigationTimerRef.current);
      }
    };
  }, []);

  const goToPreviousMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDateKey(formatDateKey(now));
  };

  const openDetailModal = (item) => {
    setSelectedItem(item);
    setEditState(createEditState(item));
  };

  const closeDetailModal = () => {
    setSelectedItem(null);
    setEditState(createEditState(null));
  };

  const handleFieldChange = (name, value) => {
    setEditState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const toggleSelection = (itemId) => {
    setSelectedIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const performMove = async ({ moveItems, targetDate }) => {
    const safeItems = moveItems.filter(Boolean);

    if (!safeItems.length) return;
    if (!targetDate) return;

    const changedItems = safeItems.filter(
      (item) => item.dispatch_date !== targetDate
    );

    if (!changedItems.length) return;

    const fromDateMap = {};

    changedItems.forEach((item) => {
      fromDateMap[item.id] = item.dispatch_date;
    });

    try {
      if (changedItems.length === 1) {
        const item = changedItems[0];

        await updateMutation.moveOneOptimistic({
          id: item.id,
          values: {
            ...item,
            dispatch_date: targetDate,
          },
        });
      } else {
        await updateMutation.moveManyOptimistic({
          items: changedItems.map((item) => ({
            id: item.id,
            values: {
              ...item,
              dispatch_date: targetDate,
            },
          })),
        });
      }

      await createProductionDispatchLogs({
        items: changedItems,
        fromDateMap,
        toDate: targetDate,
      });

      await queryClient.invalidateQueries({
        queryKey: dispatchLogKeys.all,
      });

      pushToast({
        type: "success",
        title: "Sevkiyat tarihi güncellendi",
        message: `${formatItemCountLabel(changedItems.length)} • ${formatDispatchDateLabel(
          targetDate
        )}`,
      });

      setSelectedDateKey(targetDate);
      setBulkMoveDate("");
      setSelectedIds([]);
    } catch (error) {
      pushToast({
        type: "error",
        title: "Taşıma başarısız",
        message:
          error?.message ||
          error?.details ||
          "Tarih güncellenirken hata oluştu.",
      });
    }
  };

  const handleSaveModal = async () => {
    if (!selectedItem) return;

    try {
      await updateMutation.moveOneOptimistic({
        id: selectedItem.id,
        values: {
          ...selectedItem,
          status: editState.status,
          dispatch_date: editState.dispatch_date || null,
          notes: editState.notes,
          packaging_info: editState.packaging_info,
          pallet_info: editState.pallet_info,
          vehicle_info: editState.vehicle_info || null,
        },
      });

      pushToast({
        type: "success",
        title: "Kayıt güncellendi",
        message: `${selectedItem.customer_name} kaydı başarıyla güncellendi.`,
      });

      closeDetailModal();
    } catch (error) {
      pushToast({
        type: "error",
        title: "Güncelleme başarısız",
        message:
          error?.message ||
          error?.details ||
          "Kayıt güncellenirken hata oluştu.",
      });
    }
  };

  const handleDragStart = (event, item) => {
    const activeIds =
      selectedIds.includes(item.id) && selectedIds.length > 1
        ? selectedIds
        : [item.id];

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(item.id));
    event.dataTransfer.setData(
      "application/productions-ids",
      JSON.stringify(activeIds)
    );

    setDraggingItemIds(activeIds);
  };

  const handleDragEnd = () => {
    setDraggingItemIds([]);
    setDragTargetDate("");
    setDragNavDirection("");

    if (navigationTimerRef.current) {
      window.clearTimeout(navigationTimerRef.current);
      navigationTimerRef.current = null;
    }
  };

  const handleDragOverCell = (event, dateKey) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragTargetDate(dateKey);
  };

  const parseDraggedItems = (event) => {
    const rawIds =
      event.dataTransfer.getData("application/productions-ids") ||
      event.dataTransfer.getData("text/plain");

    let ids = [];

    try {
      if (rawIds.startsWith("[")) {
        ids = JSON.parse(rawIds);
      } else if (rawIds) {
        ids = [rawIds];
      }
    } catch (error) {
      ids = rawIds ? [rawIds] : [];
    }

    return items.filter(
      (entry) => ids.includes(String(entry.id)) || ids.includes(entry.id)
    );
  };

  const handleDropOnCell = async (event, dateKey) => {
    event.preventDefault();

    const draggedItems = parseDraggedItems(event);

    setDragTargetDate("");

    await performMove({
      moveItems: draggedItems,
      targetDate: dateKey,
    });

    setDraggingItemIds([]);
  };

  const selectedEntries = items.filter((item) => selectedIds.includes(item.id));

  const handleBulkMove = async () => {
    await performMove({
      moveItems: selectedEntries,
      targetDate: bulkMoveDate,
    });
  };

  const scheduleNavigationWhileDragging = (direction) => {
    if (!draggingItemIds.length) return;
    if (dragNavDirection === direction) return;

    setDragNavDirection(direction);

    if (navigationTimerRef.current) {
      window.clearTimeout(navigationTimerRef.current);
    }

    navigationTimerRef.current = window.setTimeout(() => {
      if (direction === "prev") {
        goToPreviousMonth();
      } else {
        goToNextMonth();
      }
    }, 550);
  };

  const clearScheduledNavigation = () => {
    setDragNavDirection("");

    if (navigationTimerRef.current) {
      window.clearTimeout(navigationTimerRef.current);
      navigationTimerRef.current = null;
    }
  };

  return (
    <>
      <div className="dispatch-calendar-layout">
        <div className="production-card">
          <div className="dispatch-calendar-toolbar">
            <div>
              <h3 className="production-card__title">{getMonthTitle(currentMonth)}</h3>
              <p className="production-card__subtitle">
                Event kartlarını sürükleyerek sevkiyat tarihini değiştir.
              </p>
            </div>

            <div className="dispatch-calendar-toolbar__actions">
              <Button
                type="button"
                variant="ghost"
                onClick={goToPreviousMonth}
                onDragOver={(event) => {
                  event.preventDefault();
                  scheduleNavigationWhileDragging("prev");
                }}
                onDragLeave={clearScheduledNavigation}
                onDrop={(event) => {
                  event.preventDefault();
                  clearScheduledNavigation();
                }}
              >
                Önceki Ay
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={goToToday}
              >
                Bugün
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={goToNextMonth}
                onDragOver={(event) => {
                  event.preventDefault();
                  scheduleNavigationWhileDragging("next");
                }}
                onDragLeave={clearScheduledNavigation}
                onDrop={(event) => {
                  event.preventDefault();
                  clearScheduledNavigation();
                }}
              >
                Sonraki Ay
              </Button>
            </div>
          </div>

          <div className="dispatch-bulk-toolbar">
            <div>
              <strong>Toplu Taşıma</strong>
              <p>
                {selectedIds.length
                  ? `${selectedIds.length} kayıt seçildi`
                  : "Kart seçip toplu taşıma yapabilirsin."}
              </p>
            </div>

            <div className="dispatch-bulk-toolbar__actions">
              <DatePicker
                value={bulkMoveDate}
                onChange={(event) => setBulkMoveDate(event.target.value)}
                placeholder="Hedef tarih"
                size="sm"
                presets={[
                  { label: "Temizle", action: "clear", variant: "ghost" },
                  { label: "Bugün", value: "today", variant: "primary" },
                ]}
              />

              <Button
                type="button"
                variant="secondary"
                disabled={
                  !selectedIds.length || !bulkMoveDate || updateMutation.isPending
                }
                onClick={handleBulkMove}
              >
                Seçilenleri Taşı
              </Button>

              <Button
                type="button"
                variant="ghost"
                disabled={!selectedIds.length}
                onClick={clearSelection}
              >
                Seçimi Temizle
              </Button>
            </div>
          </div>

          <div className="dispatch-calendar">
            <div className="dispatch-calendar__weekdays">
              {WEEKDAY_LABELS.map((label) => (
                <div key={label} className="dispatch-calendar__weekday">
                  {label}
                </div>
              ))}
            </div>

            <div className="dispatch-calendar__grid">
              {monthMatrix.flat().map((date) => {
                const dateKey = formatDateKey(date);
                const dayItems = groupedItems[dateKey] || [];
                const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                const isToday = isSameDay(date, today);
                const isSelected = selectedDateKey === dateKey;
                const isDropTarget = dragTargetDate === dateKey;

                return (
                  <div
                    key={dateKey}
                    className={[
                      "dispatch-calendar__cell",
                      isCurrentMonth ? "" : "dispatch-calendar__cell--muted",
                      isToday ? "dispatch-calendar__cell--today" : "",
                      isSelected ? "dispatch-calendar__cell--selected" : "",
                      isDropTarget ? "dispatch-calendar__cell--drop-target" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedDateKey(dateKey)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedDateKey(dateKey);
                      }
                    }}
                    onDragOver={(event) => handleDragOverCell(event, dateKey)}
                    onDragLeave={() => {
                      if (dragTargetDate === dateKey) setDragTargetDate("");
                    }}
                    onDrop={(event) => handleDropOnCell(event, dateKey)}
                  >
                    <div className="dispatch-calendar__cell-header">
                      <span className="dispatch-calendar__day-number">
                        {date.getDate()}
                      </span>

                      {dayItems.length ? (
                        <span className="dispatch-calendar__count">
                          {dayItems.length}
                        </span>
                      ) : null}
                    </div>

                    <div className="dispatch-calendar__events">
                      {dayItems.slice(0, 3).map((item) => {
                        const isSelectedItem = selectedIds.includes(item.id);
                        const isDragging = draggingItemIds.includes(item.id);

                        return (
                          <div
                            key={item.id}
                            className={[
                              "dispatch-calendar__event",
                              `dispatch-calendar__event--${item.status}`,
                              isDragging ? "dispatch-calendar__event--dragging" : "",
                              isSelectedItem
                                ? "dispatch-calendar__event--selected"
                                : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                            draggable
                            onDragStart={(event) => handleDragStart(event, item)}
                            onDragEnd={handleDragEnd}
                            onClick={(event) => {
                              event.stopPropagation();
                              openDetailModal(item);
                            }}
                          >
                            <Pressable
                              type="button"
                              className="dispatch-card-select"
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleSelection(item.id);
                              }}
                              aria-label="Kaydı seç"
                            >
                              {isSelectedItem ? "✓" : ""}
                            </Pressable>

                            <strong>{item.customer_name}</strong>
                            <span>{item.lot_no}</span>
                          </div>
                        );
                      })}

                      {dayItems.length > 3 ? (
                        <div className="dispatch-calendar__more">
                          +{dayItems.length - 3} daha
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="production-card">
          <div className="production-card__header">
            <div>
              <h3 className="production-card__title">
                {formatDispatchDateLabel(selectedDateKey)}
              </h3>
              <p className="production-card__subtitle">
                Seçili güne ait sevkiyat detayları
              </p>
            </div>
          </div>

          {!selectedItems.length ? (
            <div className="production-empty-state">
              <h3>Kayıt yok</h3>
              <p>Bu tarih için planlanmış sevkiyat bulunmuyor.</p>
            </div>
          ) : (
            <div className="dispatch-plan-items">
              {selectedItems.map((item) => (
                <article
                  key={item.id}
                  className="dispatch-plan-item dispatch-plan-item--interactive"
                  onClick={() => openDetailModal(item)}
                >
                  <div className="dispatch-plan-item__main">
                    <div className="dispatch-plan-item__top">
                      <strong>{item.customer_name}</strong>
                      <div className="dispatch-plan-item__top-right">
                        <Pressable
                          type="button"
                          className={[
                            "dispatch-card-select",
                            selectedIds.includes(item.id)
                              ? "dispatch-card-select--active"
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleSelection(item.id);
                          }}
                        >
                          {selectedIds.includes(item.id) ? "✓" : ""}
                        </Pressable>
                        <ProductionStatusBadge status={item.status} />
                      </div>
                    </div>

                    <p className="dispatch-plan-item__product">{item.product_name}</p>

                    <div className="dispatch-plan-item__meta">
                      <span>Lot: {item.lot_no}</span>
                      <span>
                        Miktar: {formatQuantityLabel(item.quantity, item.quantity_unit)}
                      </span>
                      <span>Paketleme: {item.packaging_info}</span>
                      <span>Palet: {item.pallet_info}</span>
                      <span>Araç: {item.vehicle_info || "Atanmadı"}</span>
                    </div>

                    {item.notes ? (
                      <p className="dispatch-plan-item__notes">{item.notes}</p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <DispatchEventModal
        item={selectedItem}
        open={Boolean(selectedItem)}
        formState={editState}
        onChange={handleFieldChange}
        onClose={closeDetailModal}
        onSave={handleSaveModal}
        isSaving={updateMutation.isPending}
      />

      <DispatchToastViewport toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}