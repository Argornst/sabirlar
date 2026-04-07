import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../productions.css";

import { DispatchPlanList } from "../components/DispatchPlanList";
import { DispatchCalendar } from "../components/DispatchCalendar";
import { DispatchWeekBoard } from "../components/DispatchWeekBoard";
import { useDispatchPlanQuery } from "../hooks/useDispatchPlanQuery";

const DISPATCH_FILTERS = {
  all: "all",
  week: "week",
  month: "month",
};

const DISPATCH_VIEWS = {
  calendar: "calendar",
  list: "list",
  week: "week",
};

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStartOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function getEndOfWeek() {
  const today = getStartOfToday();
  const day = today.getDay();
  const diffToSunday = day === 0 ? 0 : 7 - day;
  const end = new Date(today);
  end.setDate(today.getDate() + diffToSunday);
  return end;
}

function getEndOfMonth() {
  const today = getStartOfToday();
  return new Date(today.getFullYear(), today.getMonth() + 1, 0);
}

function getFilterMeta(filterKey) {
  const today = getStartOfToday();

  if (filterKey === DISPATCH_FILTERS.week) {
    return {
      label: "Bu Hafta",
      query: {
        dateFrom: formatDateInput(today),
        dateTo: formatDateInput(getEndOfWeek()),
      },
    };
  }

  if (filterKey === DISPATCH_FILTERS.month) {
    return {
      label: "Bu Ay",
      query: {
        dateFrom: formatDateInput(today),
        dateTo: formatDateInput(getEndOfMonth()),
      },
    };
  }

  return {
    label: "Tümü",
    query: {},
  };
}

export default function DispatchPlanPage() {
  const [activeFilter, setActiveFilter] = useState(DISPATCH_FILTERS.all);
  const [activeView, setActiveView] = useState(DISPATCH_VIEWS.calendar);

  const filterMeta = useMemo(() => getFilterMeta(activeFilter), [activeFilter]);
  const dispatchPlanQuery = useDispatchPlanQuery(filterMeta.query);

  return (
    <div className="production-page">
      <div className="production-page__header">
        <div>
          <h1 className="production-page__title">Sevkiyat Planı</h1>
          <p className="production-page__subtitle">
            Çıkış tarihi atanmış üretimleri takvim, liste ve haftalık board görünümünde takip et.
          </p>
        </div>

        <div className="production-page__actions">
          <Link to="/productions" className="production-button production-button--ghost production-button--with-icon">
            <ListIcon />
            <span>Üretim Listesi</span>
          </Link>

          <Link to="/productions/new" className="production-button production-button--primary production-button--with-icon">
            <PlusIcon />
            <span>Yeni Kayıt</span>
          </Link>
        </div>
      </div>

      <div className="production-card">
        <div className="production-card__header">
          <div>
            <h3 className="production-card__title">Görünüm ve Tarih Filtresi</h3>
            <p className="production-card__subtitle">
              Aktif filtre: {filterMeta.label}
            </p>
          </div>
        </div>

        <div className="dispatch-controls">
          <div className="dispatch-filter-tabs">
            <button
              type="button"
              className={`dispatch-filter-tab${
                activeFilter === DISPATCH_FILTERS.all ? " dispatch-filter-tab--active" : ""
              }`}
              onClick={() => setActiveFilter(DISPATCH_FILTERS.all)}
            >
              Tümü
            </button>

            <button
              type="button"
              className={`dispatch-filter-tab${
                activeFilter === DISPATCH_FILTERS.week ? " dispatch-filter-tab--active" : ""
              }`}
              onClick={() => setActiveFilter(DISPATCH_FILTERS.week)}
            >
              Bu Hafta
            </button>

            <button
              type="button"
              className={`dispatch-filter-tab${
                activeFilter === DISPATCH_FILTERS.month ? " dispatch-filter-tab--active" : ""
              }`}
              onClick={() => setActiveFilter(DISPATCH_FILTERS.month)}
            >
              Bu Ay
            </button>
          </div>

          <div className="dispatch-view-tabs">
            <button
              type="button"
              className={`dispatch-view-tab${
                activeView === DISPATCH_VIEWS.calendar ? " dispatch-view-tab--active" : ""
              }`}
              onClick={() => setActiveView(DISPATCH_VIEWS.calendar)}
            >
              Takvim
            </button>

            <button
              type="button"
              className={`dispatch-view-tab${
                activeView === DISPATCH_VIEWS.week ? " dispatch-view-tab--active" : ""
              }`}
              onClick={() => setActiveView(DISPATCH_VIEWS.week)}
            >
              Haftalık Board
            </button>

            <button
              type="button"
              className={`dispatch-view-tab${
                activeView === DISPATCH_VIEWS.list ? " dispatch-view-tab--active" : ""
              }`}
              onClick={() => setActiveView(DISPATCH_VIEWS.list)}
            >
              Liste
            </button>
          </div>
        </div>
      </div>

      {dispatchPlanQuery.isLoading ? (
        <div className="production-card">
          <div className="production-loading">Sevkiyat planı yükleniyor...</div>
        </div>
      ) : dispatchPlanQuery.isError ? (
        <div className="production-card">
          <div className="production-alert">
            {dispatchPlanQuery.error?.message ||
              dispatchPlanQuery.error?.details ||
              "Sevkiyat planı alınırken hata oluştu."}
          </div>
        </div>
      ) : activeView === DISPATCH_VIEWS.calendar ? (
        <DispatchCalendar items={dispatchPlanQuery.data || []} />
      ) : activeView === DISPATCH_VIEWS.week ? (
        <DispatchWeekBoard items={dispatchPlanQuery.data || []} />
      ) : (
        <DispatchPlanList items={dispatchPlanQuery.data || []} />
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 7.5h10" />
      <path d="M8 12h10" />
      <path d="M8 16.5h10" />
      <circle cx="5" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="5" cy="16.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}