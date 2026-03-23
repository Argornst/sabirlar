import { useMemo, useState } from "react";

export function useSalesFilters(sales = []) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const filteredSales = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return sales.filter((sale) => {
      const matchesSearch =
        !normalizedSearch ||
        String(sale.customerName || "").toLowerCase().includes(normalizedSearch) ||
        String(sale.productName || "").toLowerCase().includes(normalizedSearch);

      const matchesStatus = !status || sale.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [sales, search, status]);

  return {
    search,
    setSearch,
    status,
    setStatus,
    filteredSales,
  };
}