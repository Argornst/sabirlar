import { useMemo, useState } from "react";
import {
  formatDispatchDateLabel,
  formatQuantityLabel,
} from "../../domain/entities/production.entity";
import { ProductionStatusBadge } from "./ProductionStatusBadge";
import { useUpdateProductionMutation } from "../hooks/useUpdateProductionMutation";

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

function createUpdatePayload(item, dispatchDate) {
  return {
    ...item,
    dispatch_date: dispatchDate,
  };
}

export function DispatchWeekBoard({ items }) {
  const updateMutation = useUpdateProductionMutation();
  const [groupMode, setGroupMode] = useState(GROUP_BY.customer);
  const [weekOffset, setWeekOffset] = useState(0);
  const [draggingItemId, setDraggingItemId] = useState(null);
  const [dragTargetKey, setDragTargetKey] = useState("");

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

  const handleDragStart = (event, item) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(item.id));
    setDraggingItemId(item.id);
  };

  const handleDragEnd = () => {
    setDraggingItemId(null);
    setDragTargetKey("");
  };

  const handleDrop = async (event, dateKey) => {
    event.preventDefault();

    const rawId = event.dataTransfer.getData("text/plain");
    const draggedItem = items.find((entry) => String(entry.id) === rawId);

    setDragTargetKey("");

    if (!draggedItem) return;
    if (draggedItem.dispatch_date === dateKey) return;

    try {
      await updateMutation.mutateAsync({
        id: draggedItem.id,
        values: createUpdatePayload(draggedItem, dateKey),
      });
    } catch (error) {
      window.alert(
        error?.message || error?.details || "Tarih güncellenirken hata oluştu."
      );
    } finally {
      setDraggingItemId(null);
    }
  };

  return (
    <div className="dispatch-week-board">
      <div className="production-card">
        <div className="dispatch-week-board__top">
          <div>
            <h3 className="production-card__title">Haftalık Operasyon Görünümü</h3>
            <p className="production-card__subtitle">
              Haftalık sevkiyatları sütun bazlı takip et, kartları sürükleyerek günü değiştir.
            </p>
          </div>

          <div className="dispatch-week-board__actions">
            <button
              type="button"
              className="production-button production-button--ghost"
              onClick={() => setWeekOffset((prev) => prev - 1)}
            >
              Önceki Hafta
            </button>

            <button
              type="button"
              className="production-button production-button--ghost"
              onClick={() => setWeekOffset(0)}
            >
              Bu Hafta
            </button>

            <button
              type="button"
              className="production-button production-button--ghost"
              onClick={() => setWeekOffset((prev) => prev + 1)}
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

        <div className="dispatch-density-grid">
          {weekDays.map((day) => {
            const dateKey = formatDateKey(day);
            const count = filteredItems.filter((item) => item.dispatch_date === dateKey).length;
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
                  const isDropTarget = dragTargetKey === `${row.key}-${dateKey}`;

                  return (
                    <div
                      key={`${row.key}-${dateKey}`}
                      className={[
                        "dispatch-week-grid__cell",
                        isDropTarget ? "dispatch-week-grid__cell--drop-target" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragTargetKey(`${row.key}-${dateKey}`);
                      }}
                      onDragLeave={() => {
                        if (dragTargetKey === `${row.key}-${dateKey}`) {
                          setDragTargetKey("");
                        }
                      }}
                      onDrop={(event) => handleDrop(event, dateKey)}
                    >
                      {dayItems.length ? (
                        dayItems.map((item) => (
                          <div
                            key={item.id}
                            className={[
                              "dispatch-week-card",
                              `dispatch-week-card--${item.status}`,
                              draggingItemId === item.id ? "dispatch-week-card--dragging" : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                            draggable
                            onDragStart={(event) => handleDragStart(event, item)}
                            onDragEnd={handleDragEnd}
                          >
                            <div className="dispatch-week-card__top">
                              <strong>{item.customer_name}</strong>
                              <ProductionStatusBadge status={item.status} />
                            </div>

                            <p>{item.product_name}</p>

                            <div className="dispatch-week-card__meta">
                              <span>Lot: {item.lot_no}</span>
                              <span>
                                Miktar: {formatQuantityLabel(item.quantity, item.quantity_unit)}
                              </span>
                              <span>Araç: {item.vehicle_info || "Atanmadı"}</span>
                            </div>
                          </div>
                        ))
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
  );
}