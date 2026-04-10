function normalizeDateKey(dateValue) {
  if (!dateValue) return "";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getIsoWeekInfo(dateInput) {
  const date = new Date(dateInput);
  const utcDate = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );

  const dayNum = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((utcDate - yearStart) / 86400000) + 1) / 7);

  const monday = new Date(utcDate);
  monday.setUTCDate(utcDate.getUTCDate() - 3);

  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  return {
    week: weekNo,
    year: utcDate.getUTCFullYear(),
    startDate: new Date(monday),
    endDate: new Date(sunday),
  };
}

function formatShortDate(date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function countUniqueVehicleGroupsPerDay(items) {
  const keys = new Set(
    items.map(
      (item) =>
        `${normalizeDateKey(item.dispatch_date)}__${item.vehicle_info?.trim() || "Belirtilmemiş"}`
    )
  );

  return keys.size;
}

export function buildDispatchPrintModel(items) {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];

  const groupedByWeek = new Map();

  safeItems.forEach((item) => {
    if (!item?.dispatch_date) return;

    const dateKey = normalizeDateKey(item.dispatch_date);
    const weekInfo = getIsoWeekInfo(dateKey);
    const weekKey = `${weekInfo.year}-${String(weekInfo.week).padStart(2, "0")}`;

    if (!groupedByWeek.has(weekKey)) {
      groupedByWeek.set(weekKey, {
        week: weekInfo.week,
        year: weekInfo.year,
        startDate: weekInfo.startDate,
        endDate: weekInfo.endDate,
        daysMap: new Map(),
      });
    }

    const weekGroup = groupedByWeek.get(weekKey);

    if (!weekGroup.daysMap.has(dateKey)) {
      weekGroup.daysMap.set(dateKey, []);
    }

    weekGroup.daysMap.get(dateKey).push(item);
  });

  const weeks = Array.from(groupedByWeek.values())
    .sort((a, b) => a.startDate - b.startDate)
    .map((weekGroup) => {
      const days = Array.from(weekGroup.daysMap.entries())
        .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
        .map(([date, dayItems]) => {
          const groupedByVehicle = new Map();

          [...dayItems]
            .sort((a, b) => {
              const vehicleCompare = String(
                a.vehicle_info || "Belirtilmemiş"
              ).localeCompare(String(b.vehicle_info || "Belirtilmemiş"), "tr");

              if (vehicleCompare !== 0) return vehicleCompare;

              return String(a.customer_name || "").localeCompare(
                String(b.customer_name || ""),
                "tr"
              );
            })
            .forEach((item) => {
              const vehicleKey = item.vehicle_info?.trim() || "Belirtilmemiş";

              if (!groupedByVehicle.has(vehicleKey)) {
                groupedByVehicle.set(vehicleKey, []);
              }

              groupedByVehicle.get(vehicleKey).push(item);
            });

          const vehicles = Array.from(groupedByVehicle.entries()).map(
            ([vehicle, vehicleItems]) => ({
              vehicle,
              count: vehicleItems.length,
              items: vehicleItems,
            })
          );

          return {
            date,
            total: dayItems.length,
            vehicleCount: vehicles.length,
            vehicles,
          };
        });

      const total = days.reduce((sum, day) => sum + day.total, 0);

      return {
        week: weekGroup.week,
        year: weekGroup.year,
        startDate: weekGroup.startDate,
        endDate: weekGroup.endDate,
        total,
        totalDays: days.length,
        days,
      };
    });

  const firstWeek = weeks[0];

  return {
    headline: firstWeek
      ? `${firstWeek.week}. Hafta Planı`
      : "Haftalık Sevkiyat Planı",
    caption: firstWeek
      ? `${firstWeek.year} • ${formatShortDate(firstWeek.startDate)} - ${formatShortDate(
          firstWeek.endDate
        )}`
      : "Haftalık operasyon çıktısı",
    createdAt: new Date().toISOString(),
    summary: {
      totalItems: safeItems.length,
      totalDays: new Set(
        safeItems.map((item) => normalizeDateKey(item.dispatch_date))
      ).size,
      totalVehicles: countUniqueVehicleGroupsPerDay(safeItems),
      totalWeeks: weeks.length,
    },
    weeks,
  };
}