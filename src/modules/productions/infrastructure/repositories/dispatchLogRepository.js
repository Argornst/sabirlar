import { supabase } from "../../../../shared/lib/supabaseClient";
import { mapDispatchLog } from "../../domain/entities/dispatch-log.entity";

function applySearchFilter(query, search) {
  if (!search?.trim()) return query;

  const safeSearch = search.trim();

  return query.or(
    [
      `meta->>customer_name.ilike.%${safeSearch}%`,
      `meta->>product_name.ilike.%${safeSearch}%`,
      `meta->>lot_no.ilike.%${safeSearch}%`,
      `meta->>actor_name.ilike.%${safeSearch}%`,
    ].join(",")
  );
}

export async function insertDispatchLogs(logs) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  const actorName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "Bilinmeyen kullanıcı";

  const payload = logs.map((log) => ({
    ...log,
    user_id: user?.id || null,
    meta: {
      ...(log.meta || {}),
      actor_name: actorName,
    },
  }));

  const { data, error } = await supabase
    .from("production_dispatch_logs")
    .insert(payload)
    .select();

  if (error) throw error;

  return data.map(mapDispatchLog);
}

export async function fetchDispatchLogs({
  page = 1,
  pageSize = 10,
  search = "",
  actionType = "",
  fromDate = "",
  toDate = "",
} = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.max(1, Math.min(100, Number(pageSize) || 10));
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  let query = supabase
    .from("production_dispatch_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (actionType) {
    query = query.eq("action_type", actionType);
  }

  if (fromDate) {
    query = query.gte("created_at", `${fromDate}T00:00:00`);
  }

  if (toDate) {
    query = query.lte("created_at", `${toDate}T23:59:59`);
  }

  query = applySearchFilter(query, search);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    rows: (data || []).map(mapDispatchLog),
    total: Number(count || 0),
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.max(1, Math.ceil(Number(count || 0) / safePageSize)),
  };
}

export const dispatchLogRepository = {
  insert: insertDispatchLogs,
  getList: fetchDispatchLogs,
};
