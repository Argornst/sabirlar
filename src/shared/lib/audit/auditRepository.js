import { supabase } from "../supabaseClient";

const TABLE_NAME = "audit_logs";

export const auditRepository = {
  async create(entry) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(entry)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || "Audit log kaydı oluşturulamadı.");
    }

    return data;
  },

  async getRecent(limit = 10) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message || "Audit log kayıtları alınamadı.");
    }

    return Array.isArray(data) ? data : [];
  },
};