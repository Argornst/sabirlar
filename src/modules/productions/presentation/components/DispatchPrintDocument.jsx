import { forwardRef } from "react";
import {
  formatDispatchDateLabel,
  formatQuantityLabel,
} from "../../domain/entities/production.entity";
import Table from "../../../../shared/components/ui/Table";

function formatCreatedAt(value) {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
}

function formatWeekRange(startDate, endDate) {
  try {
    const start = new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(startDate));

    const end = new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(endDate));

    return `${start} - ${end}`;
  } catch (error) {
    return "";
  }
}

function getStatusLabel(status) {
  switch (status) {
    case "hazirlaniyor":
      return "Hazırlanıyor";
    case "hazir":
      return "Hazır";
    case "sevk_planlandi":
      return "Sevk Planlandı";
    case "sevk_edildi":
      return "Sevk Edildi";
    default:
      return status || "-";
  }
}

const DispatchPrintDocument = forwardRef(function DispatchPrintDocument(
  { model },
  ref
) {
  if (!model) return null;

  const { createdAt, summary, weeks } = model;

  return (
    <div ref={ref} className="print-document">
      <div className="print-doc-brandbar" />

      <div className="print-header print-header--premium">
        <div className="print-header__topline">
          <div className="print-header__logo">
            <img
              src="/logo.svg"
              alt="Sabırlar Logo"
              className="print-header__logo-image"
            />

            <div className="print-header__logo-text">
              <strong>SABIRLAR</strong>
              <span>HAFTALIK SEVKİYAT PLANI</span>
            </div>
          </div>

          <div className="print-header__meta-row">
            <span>Oluşturulma: {formatCreatedAt(createdAt)}</span>
            <span>Hafta: {summary?.totalWeeks || 0}</span>
            <span>Gün: {summary?.totalDays || 0}</span>
            <span>Sevkiyat: {summary?.totalItems || 0}</span>
            <span>Araç Grupları: {summary?.totalVehicles || 0}</span>
          </div>
        </div>
      </div>

      {weeks?.length ? (
        <div className="print-weeks">
          {weeks.map((week) => (
            <section
              key={`${week.year}-${week.week}`}
              className="print-week-section"
            >
              <div className="print-week-accent" />

              <div className="print-week-header">
                <div className="print-week-header__left">
                  <h2>{week.week}. Hafta Planı</h2>
                </div>

                <div className="print-week-header__right">
                  <span className="print-week-header__range">
                    {formatWeekRange(week.startDate, week.endDate)}
                  </span>
                  <span>{week.total} sevkiyat</span>
                  <span>{week.totalDays} gün</span>
                </div>
              </div>

              <div className="print-days">
                {week.days.map((day) => (
                  <section key={day.date} className="print-day">
                    <div className="print-day-header">
                      <div className="print-day-header__left">
                        <h3>{formatDispatchDateLabel(day.date)}</h3>
                        <p>{day.total} sevkiyat kaydı</p>
                      </div>

                      <div className="print-day-header__right">
                        <div className="print-day-badge">
                          {day.vehicleCount} araç grubu
                        </div>
                      </div>
                    </div>

                    <div className="print-vehicle-groups">
                      {day.vehicles.map((vehicleGroup) => (
                        <div
                          key={`${day.date}-${vehicleGroup.vehicle}`}
                          className="print-vehicle-group"
                        >
                          <div className="print-vehicle-group__header">
                            <strong>{vehicleGroup.vehicle}</strong>
                            <span>{vehicleGroup.count} kayıt</span>
                          </div>

                          <div className="print-table-wrap">
                            <Table className="print-table">
                              <thead>
                                <tr>
                                  <th>Müşteri</th>
                                  <th>Ürün</th>
                                  <th>Lot</th>
                                  <th>Miktar</th>
                                  <th>Paketleme</th>
                                  <th>Palet</th>
                                  <th>Durum</th>
                                </tr>
                              </thead>

                              <tbody>
                                {vehicleGroup.items.map((item) => (
                                  <tr key={item.id}>
                                    <td>{item.customer_name || "-"}</td>
                                    <td>{item.product_name || "-"}</td>
                                    <td>{item.lot_no || "-"}</td>
                                    <td>
                                      {formatQuantityLabel(
                                        item.quantity,
                                        item.quantity_unit
                                      )}
                                    </td>
                                    <td>{item.packaging_info || "-"}</td>
                                    <td>{item.pallet_info || "-"}</td>
                                    <td>
                                      <span
                                        className={[
                                          "print-status-badge",
                                          `print-status-badge--${item.status || "default"}`,
                                        ].join(" ")}
                                      >
                                        {getStatusLabel(item.status)}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>

                          {vehicleGroup.items.some((item) => item.notes) ? (
                            <div className="print-notes">
                              <strong>Operasyon Notları</strong>
                              <ul>
                                {vehicleGroup.items
                                  .filter((item) => item.notes)
                                  .map((item) => (
                                    <li key={`note-${day.date}-${item.id}`}>
                                      <span>{item.customer_name}:</span> {item.notes}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="print-empty-state">
          Yazdırılacak sevkiyat planı bulunamadı.
        </div>
      )}

      <div className="print-footer">
        <div className="print-footer__inline-box">
          <span>Operasyon Sorumlusu</span>
          <div className="print-footer__line" />
        </div>

        <div className="print-footer__inline-box">
          <span>Kontrol</span>
          <div className="print-footer__line" />
        </div>
      </div>
    </div>
  );
});

export default DispatchPrintDocument;