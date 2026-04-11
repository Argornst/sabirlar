import { supabase } from "../../../../shared/lib/supabaseClient";

const TABLE_NAME = "productions";

async function getActiveOrganizationId() {
  const { data, error } = await supabase.rpc("current_user_organization_id");

  if (error) {
    throw error;
  }

  if (data == null) {
    throw new Error("Aktif organizasyon bulunamadı.");
  }

  return data;
}

function sanitizeCreatePayload(payload, organizationId) {
  return {
    ...payload,
    organization_id: organizationId,
  };
}

function sanitizeUpdatePayload(payload) {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  const nextPayload = { ...payload };
  delete nextPayload.organization_id;

  return nextPayload;
}

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
    const organizationId = await getActiveOrganizationId();
    const safePayload = sanitizeCreatePayload(payload, organizationId);

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(safePayload)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, payload) {
    const safePayload = sanitizeUpdatePayload(payload);

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(safePayload)
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
      throw error;
    }

    return data || [];
  },
};