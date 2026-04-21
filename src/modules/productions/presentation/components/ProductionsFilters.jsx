import Button from "../../../../shared/components/ui/Button";
import Checkbox from "../../../../shared/components/ui/Checkbox";
import DatePicker from "../../../../shared/components/ui/DatePicker";
import Field from "../../../../shared/components/ui/Field";
import FilterBar from "../../../../shared/components/ui/FilterBar";
import Input from "../../../../shared/components/ui/Input";
import Select from "../../../../shared/components/ui/Select";
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
          <Field label="Ara" htmlFor="productions-search" className="filter-field">
            <Input
              id="productions-search"
              type="text"
              placeholder="Lot, müşteri, ürün ara"
              value={filters.search}
              onChange={(event) => onChange("search", event.target.value)}
            />
          </Field>

          <Field label="Durum" htmlFor="productions-status" className="filter-field">
            <Select
              id="productions-status"
              value={filters.status}
              onChange={(event) => onChange("status", event.target.value)}
            >
              <option value="">Tümü</option>
              {PRODUCTION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status] || status}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Başlangıç Tarihi" htmlFor="productions-date-from" className="filter-field">
            <DatePicker
              name="productions-date-from"
              value={filters.dateFrom}
              onChange={(event) => onChange("dateFrom", event.target.value)}
              placeholder="gg.aa.yyyy"
              size="sm"
              placement="auto"
              presets={FILTER_DATE_PRESETS}
            />
          </Field>

          <Field label="Bitiş Tarihi" htmlFor="productions-date-to" className="filter-field">
            <DatePicker
              name="productions-date-to"
              value={filters.dateTo}
              onChange={(event) => onChange("dateTo", event.target.value)}
              placeholder="gg.aa.yyyy"
              size="sm"
              placement="auto"
              presets={FILTER_DATE_PRESETS}
            />
          </Field>
        </div>

        <div className="productions-filters__actions">
          <Checkbox
            checked={filters.hasDispatchDate}
            onChange={(event) => onChange("hasDispatchDate", event.target.checked)}
            label="Sadece çıkış tarihi olanlar"
            className="productions-filters__checkbox"
          />

          <div className="productions-filters__buttons">
            {actions}
            <Button
              type="button"
              variant="ghost"
              className="productions-filters__reset"
              onClick={onReset}
            >
              Filtreleri Temizle
            </Button>
          </div>
        </div>
      </div>
    </FilterBar>
  );
}
