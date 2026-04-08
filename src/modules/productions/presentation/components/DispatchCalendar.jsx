import { useEffect, useMemo, useState } from "react";
import {
  formatDispatchDateLabel,
  formatQuantityLabel,
} from "../../domain/entities/production.entity";
import { ProductionStatusBadge } from "./ProductionStatusBadge";
import { useUpdateProductionMutation } from "../hooks/useUpdateProductionMutation";

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
    <div className="dispatch-modal-backdrop" onClick={onClose}>
      <div
        className="dispatch-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dispatch-modal__header">
          <div>
            <h3 className="dispatch-modal__title">{item.customer_name}</h3>
            <p className="dispatch-modal__subtitle">{item.product_name}</p>
          </div>

          <button
            type="button"
            className="dispatch-modal__close"
            onClick={onClose}
            aria-label="Kapat"
          >
            ×
          </button>
        </div>

        <div className="dispatch-modal__meta">
          <div className="dispatch-modal__meta-item">
            <span>Lot</span>
            <strong>{item.lot_no}</strong>
          </div>

          <div className="dispatch-modal__meta-item">
            <span>Miktar</span>
            <strong>{formatQuantityLabel(item.quantity, item.quantity_unit)}</strong>
          </div>

          <div className="dispatch-modal__meta-item">
            <span>Durum</span>
            <ProductionStatusBadge status={formState.status} />
          </div>
        </div>

        <div className="dispatch-modal__form">
          <div className="production-field">
            <label className="production-label">Durum</label>
            <select
              className="production-input"
              value={formState.status}
              onChange={(e) => onChange("status", e.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="production-field">
            <label className="production-label">Çıkış Tarihi</label>
            <input
              className="production-input"
              type="date"
              value={formState.dispatch_date}
              onChange={(e) => onChange("dispatch_date", e.target.value)}
            />
          </div>

          <div className="production-field">
            <label className="production-label">Paketleme Bilgisi</label>
            <input
              className="production-input"
              type="text"
              value={formState.packaging_info}
              onChange={(e) => onChange("packaging_info", e.target.value)}
            />
          </div>

          <div className="production-field">
            <label className="production-label">Palet Bilgisi</label>
            <input
              className="production-input"
              type="text"
              value={formState.pallet_info}
              onChange={(e) => onChange("pallet_info", e.target.value)}
            />
          </div>

          <div className="production-field">
            <label className="production-label">Araç Bilgisi</label>
            <input
              className="production-input"
              type="text"
              value={formState.vehicle_info}
              onChange={(e) => onChange("vehicle_info", e.target.value)}
            />
          </div>

          <div className="production-field production-field--full">
            <label className="production-label">Not</label>
            <textarea
              className="production-textarea"
              rows="4"
              value={formState.notes}
              onChange={(e) => onChange("notes", e.target.value)}
            />
          </div>
        </div>

        <div className="dispatch-modal__footer">
          <button
            type="button"
            className="production-button production-button--ghost"
            onClick={onClose}
            disabled={isSaving}
          >
            İptal
          </button>

          <button
            type="button"
            className="production-button production-button--primary"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DispatchCalendar({ items }) {
  const today = new Date();
  const updateMutation = useUpdateProductionMutation();

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
  }, [items]);

  const [currentMonth, setCurrentMonth] = useState(initialCalendarDate);
  const [selectedDateKey, setSelectedDateKey] = useState(formatDateKey(today));
  const [selectedItem, setSelectedItem] = useState(null);
  const [editState, setEditState] = useState(createEditState(null));
  const [draggingItemId, setDraggingItemId] = useState(null);
  const [dragTargetDate, setDragTargetDate] = useState("");

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

  const handleSaveModal = async () => {
    if (!selectedItem) return;

    try {
      await updateMutation.mutateAsync({
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

      closeDetailModal();
    } catch (error) {
      window.alert(
        error?.message || error?.details || "Kayıt güncellenirken hata oluştu."
      );
    }
  };

  const handleDragStart = (event, item) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(item.id));
    setDraggingItemId(item.id);
  };

  const handleDragEnd = () => {
    setDraggingItemId(null);
    setDragTargetDate("");
  };

  const handleDragOverCell = (event, dateKey) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragTargetDate(dateKey);
  };

  const handleDropOnCell = async (event, dateKey) => {
    event.preventDefault();

    const rawId = event.dataTransfer.getData("text/plain");
    const draggedItem = items.find((entry) => String(entry.id) === rawId);

    setDragTargetDate("");

    if (!draggedItem) return;
    if (draggedItem.dispatch_date === dateKey) return;

    try {
      await updateMutation.mutateAsync({
        id: draggedItem.id,
        values: {
          ...draggedItem,
          dispatch_date: dateKey,
        },
      });

      setSelectedDateKey(dateKey);

      if (selectedItem?.id === draggedItem.id) {
        setSelectedItem({
          ...draggedItem,
          dispatch_date: dateKey,
        });
        setEditState((prev) => ({
          ...prev,
          dispatch_date: dateKey,
        }));
      }
    } catch (error) {
      window.alert(
        error?.message || error?.details || "Tarih güncellenirken hata oluştu."
      );
    } finally {
      setDraggingItemId(null);
    }
  };

  return (
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
            <button
              type="button"
              className="dispatch-chip-button dispatch-chip-button--ghost"
              onClick={goToPreviousMonth}
            >
              Önceki Ay
            </button>

            <button
              type="button"
              className="dispatch-chip-button dispatch-chip-button--primary"
              onClick={goToToday}
            >
              Bugün
            </button>

            <button
              type="button"
              className="dispatch-chip-button dispatch-chip-button--ghost"
              onClick={goToNextMonth}
            >
              Sonraki Ay
            </button>
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
                <button
                  key={dateKey}
                  type="button"
                  className={[
                    "dispatch-calendar__cell",
                    isCurrentMonth ? "" : "dispatch-calendar__cell--muted",
                    isToday ? "dispatch-calendar__cell--today" : "",
                    isSelected ? "dispatch-calendar__cell--selected" : "",
                    isDropTarget ? "dispatch-calendar__cell--drop-target" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setSelectedDateKey(dateKey)}
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
                    {dayItems.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className={[
                          "dispatch-calendar__event",
                          `dispatch-calendar__event--${item.status}`,
                          draggingItemId === item.id
                            ? "dispatch-calendar__event--dragging"
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
                        <strong>{item.customer_name}</strong>
                        <span>{item.lot_no}</span>
                      </div>
                    ))}

                    {dayItems.length > 3 ? (
                      <div className="dispatch-calendar__more">
                        +{dayItems.length - 3} daha
                      </div>
                    ) : null}
                  </div>
                </button>
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
                    <ProductionStatusBadge status={item.status} />
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

      <DispatchEventModal
        item={selectedItem}
        open={Boolean(selectedItem)}
        formState={editState}
        onChange={handleFieldChange}
        onClose={closeDetailModal}
        onSave={handleSaveModal}
        isSaving={updateMutation.isPending}
      />
    </div>
  );
}