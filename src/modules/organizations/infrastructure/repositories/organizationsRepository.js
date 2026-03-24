import { supabase } from "../../../../shared/lib/supabaseClient";
import { DB_TABLES } from "../../../../shared/constants/database";
import { normalizeOrganization } from "../../domain/entities/organization.entity";

export const organizationsRepository = {
  async getAll() {
    const { data, error } = await supabase
      .from(DB_TABLES.ORGANIZATIONS)
      .select("id, name, slug, is_active, created_at")
      .order("id", { ascending: true });

    if (error) {
      throw new Error(error.message || "Organizasyonlar alınamadı.");
    }

    return Array.isArray(data) ? data.map(normalizeOrganization) : [];
  },
};