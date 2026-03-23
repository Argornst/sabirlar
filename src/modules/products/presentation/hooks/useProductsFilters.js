import { useMemo, useState } from "react";

export function useProductsFilters(products = []) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        String(product.name || "").toLowerCase().includes(normalizedSearch) ||
        String(product.unit || "").toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        !status ||
        (status === "active" && product.isActive) ||
        (status === "inactive" && !product.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [products, search, status]);

  const summary = useMemo(() => {
    const total = products.length;
    const active = products.filter((item) => item.isActive).length;
    const inactive = products.filter((item) => !item.isActive).length;
    const averagePrice =
      total > 0
        ? products.reduce((sum, item) => sum + Number(item.unitPrice ?? 0), 0) / total
        : 0;

    return {
      total,
      active,
      inactive,
      averagePrice,
    };
  }, [products]);

  return {
    search,
    setSearch,
    status,
    setStatus,
    filteredProducts,
    summary,
  };
}