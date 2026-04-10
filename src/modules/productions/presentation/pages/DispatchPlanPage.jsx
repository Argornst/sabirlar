import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ListBullets, Plus, Printer } from "@phosphor-icons/react";

import AnimatedPage from "../../../../shared/components/ui/AnimatedPage";
import Card from "../../../../shared/components/ui/Card";
import PageHeader from "../../../../shared/components/ui/PageHeader";
import Button from "../../../../shared/components/ui/Button";
import ErrorState from "../../../../shared/components/ui/ErrorState";
import LoadingState from "../../../../shared/components/ui/LoadingState";
import { ROUTES } from "../../../../shared/constants/routes";

import "../productions.css";
import "../../../../shared/styles/print.css";

import { DispatchPlanList } from "../components/DispatchPlanList";
import { DispatchCalendar } from "../components/DispatchCalendar";
import { DispatchWeekBoard } from "../components/DispatchWeekBoard";
import DispatchPrintDocument from "../components/DispatchPrintDocument";
import { DispatchPrintPreviewModal } from "../components/DispatchPrintPreviewModal";
import { buildDispatchPrintModel } from "../utils/buildDispatchPrintModel";
import { openDispatchPrintWindow } from "../utils/openDispatchPrintWindow";
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
      key: filterKey,
      label: "Bu Hafta",
      query: {
        dateFrom: formatDateInput(today),
        dateTo: formatDateInput(getEndOfWeek()),
      },
    };
  }

  if (filterKey === DISPATCH_FILTERS.month) {
    return {
      key: filterKey,
      label: "Bu Ay",
      query: {
        dateFrom: formatDateInput(today),
        dateTo: formatDateInput(getEndOfMonth()),
      },
    };
  }

  return {
    key: filterKey,
    label: "Tümü",
    query: {},
  };
}

export default function DispatchPlanPage() {
  const [activeFilter, setActiveFilter] = useState(DISPATCH_FILTERS.all);
  const [activeView, setActiveView] = useState(DISPATCH_VIEWS.calendar);
  const [printOpen, setPrintOpen] = useState(false);
  const [printOrientation, setPrintOrientation] = useState("landscape");

  const printDocumentRef = useRef(null);

  const filterMeta = useMemo(() => getFilterMeta(activeFilter), [activeFilter]);
  const dispatchPlanQuery = useDispatchPlanQuery(filterMeta.query);

  const dispatchItems = dispatchPlanQuery.data || [];

  const printModel = useMemo(() => {
    return buildDispatchPrintModel(dispatchItems);
  }, [dispatchItems]);

  const canOpenPrint =
    !dispatchPlanQuery.isLoading &&
    !dispatchPlanQuery.isError &&
    dispatchItems.length > 0;

  function handleOpenPrintPreview() {
    setPrintOpen(true);
  }

  function handleClosePrintPreview() {
    setPrintOpen(false);
  }

  function handlePrint() {
    if (!printDocumentRef.current) return;

    openDispatchPrintWindow({
      contentElement: printDocumentRef.current,
      orientation: printOrientation,
    });
  }

  return (
    <>
      <AnimatedPage>
        <Card>
          <PageHeader
            title="Sevkiyat Planı"
            description="Çıkış tarihi atanmış üretimleri takvim, liste ve haftalık board görünümünde takip et."
            badge="Sevkiyat Yönetimi"
            actions={
              <div className="production-header-actions">
                <Button
                  type="button"
                  variant="secondary"
                  className="btn-premium"
                  onClick={handleOpenPrintPreview}
                  disabled={!canOpenPrint}
                >
                  <Printer size={18} />
                  Yazdır / PDF
                </Button>

                <Link to={ROUTES.PRODUCTIONS}>
                  <Button variant="secondary" className="btn-premium">
                    <ListBullets size={18} />
                    Üretim Listesi
                  </Button>
                </Link>

                <Link to={ROUTES.NEW_PRODUCTION}>
                  <Button className="btn-premium">
                    <Plus size={18} />
                    Yeni Kayıt
                  </Button>
                </Link>
              </div>
            }
          />

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
                    activeFilter === DISPATCH_FILTERS.all
                      ? " dispatch-filter-tab--active"
                      : ""
                  }`}
                  onClick={() => setActiveFilter(DISPATCH_FILTERS.all)}
                >
                  Tümü
                </button>

                <button
                  type="button"
                  className={`dispatch-filter-tab${
                    activeFilter === DISPATCH_FILTERS.week
                      ? " dispatch-filter-tab--active"
                      : ""
                  }`}
                  onClick={() => setActiveFilter(DISPATCH_FILTERS.week)}
                >
                  Bu Hafta
                </button>

                <button
                  type="button"
                  className={`dispatch-filter-tab${
                    activeFilter === DISPATCH_FILTERS.month
                      ? " dispatch-filter-tab--active"
                      : ""
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
                    activeView === DISPATCH_VIEWS.calendar
                      ? " dispatch-view-tab--active"
                      : ""
                  }`}
                  onClick={() => setActiveView(DISPATCH_VIEWS.calendar)}
                >
                  Takvim
                </button>

                <button
                  type="button"
                  className={`dispatch-view-tab${
                    activeView === DISPATCH_VIEWS.week
                      ? " dispatch-view-tab--active"
                      : ""
                  }`}
                  onClick={() => setActiveView(DISPATCH_VIEWS.week)}
                >
                  Haftalık Board
                </button>

                <button
                  type="button"
                  className={`dispatch-view-tab${
                    activeView === DISPATCH_VIEWS.list
                      ? " dispatch-view-tab--active"
                      : ""
                  }`}
                  onClick={() => setActiveView(DISPATCH_VIEWS.list)}
                >
                  Liste
                </button>
              </div>
            </div>
          </div>

          {dispatchPlanQuery.isLoading ? (
            <LoadingState
              title="Sevkiyat planı yükleniyor"
              description="Plan verileri hazırlanıyor."
            />
          ) : null}

          {dispatchPlanQuery.isError ? (
            <ErrorState
              title="Sevkiyat planı alınamadı"
              description={
                dispatchPlanQuery.error?.message ||
                dispatchPlanQuery.error?.details ||
                "Bir hata oluştu."
              }
            />
          ) : null}

          {!dispatchPlanQuery.isLoading && !dispatchPlanQuery.isError ? (
            activeView === DISPATCH_VIEWS.calendar ? (
              <DispatchCalendar items={dispatchItems} />
            ) : activeView === DISPATCH_VIEWS.week ? (
              <DispatchWeekBoard items={dispatchItems} />
            ) : (
              <DispatchPlanList items={dispatchItems} />
            )
          ) : null}
        </Card>
      </AnimatedPage>

      <DispatchPrintPreviewModal
        open={printOpen}
        onClose={handleClosePrintPreview}
        onPrint={handlePrint}
        orientation={printOrientation}
        onOrientationChange={setPrintOrientation}
      >
        <DispatchPrintDocument ref={printDocumentRef} model={printModel} />
      </DispatchPrintPreviewModal>
    </>
  );
}