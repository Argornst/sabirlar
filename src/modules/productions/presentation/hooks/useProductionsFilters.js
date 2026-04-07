import { useMemo, useState } from 'react';

export const useProductionsFilters = () => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    hasDispatchDate: false,
    dateFrom: '',
    dateTo: '',
  });

  const updateFilter = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: '',
      hasDispatchDate: false,
      dateFrom: '',
      dateTo: '',
    });
  };

  const queryFilters = useMemo(
    () => ({
      search: filters.search || undefined,
      status: filters.status || undefined,
      hasDispatchDate: filters.hasDispatchDate || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
    }),
    [filters]
  );

  return {
    filters,
    queryFilters,
    updateFilter,
    resetFilters,
  };
};