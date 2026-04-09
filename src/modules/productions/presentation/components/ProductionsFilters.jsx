import FilterBar from "../../../../shared/components/ui/FilterBar";
import DatePicker from "../../../../shared/components/ui/DatePicker";
import { PRODUCTION_STATUSES } from "../../domain/entities/production.entity";

const STATUS_LABELS = {
  hazirlaniyor: "Hazırlanıyor",
  hazir: "Hazır",
  sevk_planlandi: "Sevk Planlandı",
  sevk_edildi: "Sevk Edildi",
};

const FILTER_DATE_PRESETS = [
  { label: "Temizle", action: "clear", variant: "ghost" },
  { label: "Bugün", value: "today", variant: "primary" },
];

export function ProductionsFilters({
  filters,
  onChange,
  onReset,
  actions = null,
}) {
  return (
    <FilterBar>
      <div className="productions-filters">
        <div className="productions-filters__fields">
          <div className="filter-field">
            <label htmlFor="productions-search">Ara</label>
            <input
              id="productions-search"
              type="text"
              placeholder="Lot, müşteri, ürün ara"
              value={filters.search}
              onChange={(event) => onChange("search", event.target.value)}
            />
          </div>

          <div className="filter-field">
            <label htmlFor="productions-status">Durum</label>
            <select
              id="productions-status"
              className="form-select"
              value={filters.status}
              onChange={(event) => onChange("status", event.target.value)}
            >
              <option value="">Tümü</option>
              {PRODUCTION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status] || status}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label htmlFor="productions-date-from">Başlangıç Tarihi</label>
            <DatePicker
              name="productions-date-from"
              value={filters.dateFrom}
              onChange={(event) => onChange("dateFrom", event.target.value)}
              placeholder="gg.aa.yyyy"
              size="sm"
              placement="auto"
              presets={FILTER_DATE_PRESETS}
            />
          </div>

          <div className="filter-field">
            <label htmlFor="productions-date-to">Bitiş Tarihi</label>
            <DatePicker
              name="productions-date-to"
              value={filters.dateTo}
              onChange={(event) => onChange("dateTo", event.target.value)}
              placeholder="gg.aa.yyyy"
              size="sm"
              placement="auto"
              presets={FILTER_DATE_PRESETS}
            />
          </div>
        </div>

        <div className="productions-filters__actions">
          <label className="productions-filters__checkbox">
            <input
              type="checkbox"
              checked={filters.hasDispatchDate}
              onChange={(event) =>
                onChange("hasDispatchDate", event.target.checked)
              }
            />
            <span>Sadece çıkış tarihi olanlar</span>
          </label>

          <div className="productions-filters__buttons">
            {actions}
            <button
              type="button"
              className="ui-button ui-button--ghost productions-filters__reset"
              onClick={onReset}
            >
              Filtreleri Temizle
            </button>
          </div>
        </div>
      </div>
    </FilterBar>
  );
}