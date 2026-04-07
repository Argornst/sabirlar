import { supabase } from "../../../../shared/lib/supabaseClient";

const TABLE_NAME = "productions";

const buildListQuery = (filters = {}) => {
  let query = supabase
    .from(TABLE_NAME)
    .select("*")
    .order("dispatch_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (filters.search) {
    const term = filters.search.trim();
    query = query.or(
      [
        `lot_no.ilike.%${term}%`,
        `customer_name.ilike.%${term}%`,
        `product_name.ilike.%${term}%`,
        `packaging_info.ilike.%${term}%`,
        `pallet_info.ilike.%${term}%`,
      ].join(",")
    );
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.hasDispatchDate === true) {
    query = query.not("dispatch_date", "is", null);
  }

  if (filters.dateFrom) {
    query = query.gte("dispatch_date", filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte("dispatch_date", filters.dateTo);
  }

  return query;
};

export const productionsRepository = {
  async getList(filters = {}) {
    const { data, error } = await buildListQuery(filters);

    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(payload) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(payload)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  async remove(id) {
    const { error } = await supabase.from(TABLE_NAME).delete().eq("id", id);

    if (error) throw error;
    return true;
  },

  async getDispatchPlan(filters = {}) {
  let query = supabase
    .from(TABLE_NAME)
    .select("*")
    .not("dispatch_date", "is", null)
    .order("dispatch_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (filters.dateFrom) {
    query = query.gte("dispatch_date", filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte("dispatch_date", filters.dateTo);
  }

  if (filters.search) {
    const term = filters.search.trim();
    query = query.or(
      [
        `lot_no.ilike.%${term}%`,
        `customer_name.ilike.%${term}%`,
        `product_name.ilike.%${term}%`,
      ].join(",")
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Productions getDispatchPlan error:", error);
    throw createSupabaseError(error, "Sevkiyat planı alınamadı.");
  }

  return data || [];
},
};