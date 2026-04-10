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
import DatePicker from "../../../../shared/components/ui/DatePicker";
import { createDispatchLogs } from "../../application/use-cases/createDispatchLogs";
import { dispatchLogKeys } from "../hooks/useDispatchLogsQuery";

const GROUP_BY = {
  customer: "customer",
  vehicle: "vehicle",
};

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStartOfWeek(date = new Date()) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);

  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  value.setDate(value.getDate() + diff);
  return value;
}

function addDays(date, days) {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

function getWeekDays(baseDate) {
  const start = getStartOfWeek(baseDate);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

function getGroupKey(item, mode) {
  if (mode === GROUP_BY.vehicle) {
    return item.vehicle_info?.trim() || "Araç Atanmadı";
  }

  return item.customer_name?.trim() || "Müşteri Yok";
}

function getDensityLevel(count) {
  if (count >= 8) return "high";
  if (count >= 4) return "medium";
  if (count >= 1) return "low";
  return "none";
}

function formatShortDay(date) {
  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function formatItemCountLabel(count) {
  return count === 1 ? "1 kayıt taşındı" : `${count} kayıt taşındı`;
}

export function DispatchWeekBoard({ items }) {
  const queryClient = useQueryClient();
  const updateMutation = useUpdateProductionMutation();
  const { toasts, pushToast, dismissToast } = useDispatchFeedback();

  const navigationTimerRef = useRef(null);

  const [groupMode, setGroupMode] = useState(GROUP_BY.customer);
  const [weekOffset, setWeekOffset] = useState(0);
  const [draggingItemIds, setDraggingItemIds] = useState([]);
  const [dragTargetKey, setDragTargetKey] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkMoveDate, setBulkMoveDate] = useState("");
  const [dragNavDirection, setDragNavDirection] = useState("");

  const baseDate = useMemo(() => {
    const today = new Date();
    return addDays(today, weekOffset * 7);
  }, [weekOffset]);

  const weekDays = useMemo(() => getWeekDays(baseDate), [baseDate]);

  const filteredItems = useMemo(() => {
    const weekStart = weekDays[0];
    const weekEnd = weekDays[6];

    return items.filter((item) => {
      if (!item.dispatch_date) return false;
      const itemDate = new Date(item.dispatch_date);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate >= weekStart && itemDate <= weekEnd;
    });
  }, [items, weekDays]);

  const groupedRows = useMemo(() => {
    const map = new Map();

    filteredItems.forEach((item) => {
      const rowKey = getGroupKey(item, groupMode);
      if (!map.has(rowKey)) {
        map.set(rowKey, {
          key: rowKey,
          label: rowKey,
          itemsByDate: {},
          total: 0,
        });
      }

      const row = map.get(rowKey);
      const dateKey = item.dispatch_date;

      if (!row.itemsByDate[dateKey]) {
        row.itemsByDate[dateKey] = [];
      }

      row.itemsByDate[dateKey].push(item);
      row.total += 1;
    });

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [filteredItems, groupMode]);

  const weekTotal = filteredItems.length;
  const maxDayCount = Math.max(
    1,
    ...weekDays.map((day) => {
      const key = formatDateKey(day);
      return filteredItems.filter((item) => item.dispatch_date === key).length;
    })
  );

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

      await createDispatchLogs({
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
    setDragTargetKey("");
    setDragNavDirection("");

    if (navigationTimerRef.current) {
      window.clearTimeout(navigationTimerRef.current);
      navigationTimerRef.current = null;
    }
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

  const handleDrop = async (event, dateKey) => {
    event.preventDefault();

    const draggedItems = parseDraggedItems(event);

    setDragTargetKey("");

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
      setWeekOffset((prev) => (direction === "prev" ? prev - 1 : prev + 1));
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
      <div className="dispatch-week-board">
        <div className="production-card">
          <div className="dispatch-week-board__top">
            <div>
              <h3 className="production-card__title">Haftalık Operasyon Görünümü</h3>
              <p className="production-card__subtitle">
                Haftalık sevkiyatları sütun bazlı takip et, kartları sürükleyerek günü değiştir.
              </p>
            </div>

            <div className="dispatch-week-board__actions dispatch-week-board__nav">
              <button
                type="button"
                className={[
                  "dispatch-week-nav-button",
                  "dispatch-week-nav-button--ghost",
                  dragNavDirection === "prev"
                    ? "dispatch-week-nav-button--drag-active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setWeekOffset((prev) => prev - 1)}
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
                Önceki Hafta
              </button>

              <button
                type="button"
                className={`dispatch-week-nav-button ${
                  weekOffset === 0
                    ? "dispatch-week-nav-button--primary"
                    : "dispatch-week-nav-button--ghost"
                }`}
                onClick={() => setWeekOffset(0)}
              >
                Bu Hafta
              </button>

              <button
                type="button"
                className={[
                  "dispatch-week-nav-button",
                  "dispatch-week-nav-button--ghost",
                  dragNavDirection === "next"
                    ? "dispatch-week-nav-button--drag-active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setWeekOffset((prev) => prev + 1)}
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
                Sonraki Hafta
              </button>
            </div>
          </div>

          <div className="dispatch-week-board__toolbar">
            <div className="dispatch-view-tabs">
              <button
                type="button"
                className={`dispatch-view-tab${
                  groupMode === GROUP_BY.customer ? " dispatch-view-tab--active" : ""
                }`}
                onClick={() => setGroupMode(GROUP_BY.customer)}
              >
                Müşteri Bazlı
              </button>

              <button
                type="button"
                className={`dispatch-view-tab${
                  groupMode === GROUP_BY.vehicle ? " dispatch-view-tab--active" : ""
                }`}
                onClick={() => setGroupMode(GROUP_BY.vehicle)}
              >
                Araç Bazlı
              </button>
            </div>

            <div className="dispatch-week-board__summary">
              <span>Toplam Sevkiyat: {weekTotal}</span>
              <span>En Yoğun Gün: {maxDayCount} kayıt</span>
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

              <button
                type="button"
                className="dispatch-chip-button dispatch-chip-button--primary"
                disabled={
                  !selectedIds.length || !bulkMoveDate || updateMutation.isPending
                }
                onClick={handleBulkMove}
              >
                Seçilenleri Taşı
              </button>

              <button
                type="button"
                className="dispatch-chip-button dispatch-chip-button--ghost"
                disabled={!selectedIds.length}
                onClick={clearSelection}
              >
                Seçimi Temizle
              </button>
            </div>
          </div>

          <div className="dispatch-density-grid">
            {weekDays.map((day) => {
              const dateKey = formatDateKey(day);
              const count = filteredItems.filter(
                (item) => item.dispatch_date === dateKey
              ).length;
              const density = getDensityLevel(count);

              return (
                <div key={dateKey} className="dispatch-density-card">
                  <div className="dispatch-density-card__header">
                    <strong>{formatShortDay(day)}</strong>
                    <span>{count} kayıt</span>
                  </div>

                  <div className="dispatch-density-bar">
                    <div
                      className={`dispatch-density-bar__fill dispatch-density-bar__fill--${density}`}
                      style={{ width: `${Math.min(100, (count / maxDayCount) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="production-card">
          <div className="dispatch-week-grid">
            <div className="dispatch-week-grid__header dispatch-week-grid__header--label">
              {groupMode === GROUP_BY.customer ? "Müşteri" : "Araç"}
            </div>

            {weekDays.map((day) => (
              <div key={formatDateKey(day)} className="dispatch-week-grid__header">
                <strong>{formatShortDay(day)}</strong>
                <span>{formatDispatchDateLabel(formatDateKey(day))}</span>
              </div>
            ))}

            {groupedRows.length === 0 ? (
              <div className="dispatch-week-grid__empty">
                Bu görünüm için haftalık sevkiyat bulunmuyor.
              </div>
            ) : (
              groupedRows.map((row) => (
                <div key={row.key} className="dispatch-week-grid__row">
                  <div className="dispatch-week-grid__group-cell">
                    <strong>{row.label}</strong>
                    <span>{row.total} kayıt</span>
                  </div>

                  {weekDays.map((day) => {
                    const dateKey = formatDateKey(day);
                    const dayItems = row.itemsByDate[dateKey] || [];
                    const cellKey = `${row.key}-${dateKey}`;
                    const isDropTarget = dragTargetKey === cellKey;

                    return (
                      <div
                        key={cellKey}
                        className={[
                          "dispatch-week-grid__cell",
                          isDropTarget ? "dispatch-week-grid__cell--drop-target" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onDragOver={(event) => {
                          event.preventDefault();
                          setDragTargetKey(cellKey);
                        }}
                        onDragLeave={() => {
                          if (dragTargetKey === cellKey) {
                            setDragTargetKey("");
                          }
                        }}
                        onDrop={(event) => handleDrop(event, dateKey)}
                      >
                        {dayItems.length ? (
                          dayItems.map((item) => {
                            const isSelectedItem = selectedIds.includes(item.id);
                            const isDragging = draggingItemIds.includes(item.id);

                            return (
                              <div
                                key={item.id}
                                className={[
                                  "dispatch-week-card",
                                  `dispatch-week-card--${item.status}`,
                                  isDragging ? "dispatch-week-card--dragging" : "",
                                  isSelectedItem ? "dispatch-week-card--selected" : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                                draggable
                                onDragStart={(event) => handleDragStart(event, item)}
                                onDragEnd={handleDragEnd}
                              >
                                <div className="dispatch-week-card__top">
                                  <div className="dispatch-week-card__top-row">
                                    <strong>{item.customer_name}</strong>

                                    <button
                                      type="button"
                                      className={[
                                        "dispatch-card-select",
                                        isSelectedItem
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
                                      {isSelectedItem ? "✓" : ""}
                                    </button>
                                  </div>

                                  <ProductionStatusBadge status={item.status} />
                                </div>

                                <p>{item.product_name}</p>

                                <div className="dispatch-week-card__meta">
                                  <span>Lot: {item.lot_no}</span>
                                  <span>
                                    Miktar: {formatQuantityLabel(
                                      item.quantity,
                                      item.quantity_unit
                                    )}
                                  </span>
                                  <span>Araç: {item.vehicle_info || "Atanmadı"}</span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="dispatch-week-grid__placeholder">Boş</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <DispatchToastViewport toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}