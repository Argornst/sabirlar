import { supabase } from "../../../../shared/lib/supabaseClient";
import {
  DB_TABLES,
  EDGE_FUNCTIONS,
  USERS_COLUMNS,
} from "../../../../shared/constants/database";
import { buildSelect, safeArray } from "../../../../shared/lib/queryHelpers";
import { normalizeUser } from "../../domain/entities/user.entity";

const USERS_SELECT = buildSelect([
  USERS_COLUMNS.ID,
  USERS_COLUMNS.USERNAME,
  USERS_COLUMNS.FULL_NAME,
  USERS_COLUMNS.EMAIL,
  USERS_COLUMNS.IS_ACTIVE,
  USERS_COLUMNS.ROLE_ID,
  USERS_COLUMNS.PAGE_PERMISSIONS,
  USERS_COLUMNS.ORGANIZATION_ID,
  USERS_COLUMNS.CREATED_AT,
  USERS_COLUMNS.UPDATED_AT,
  "roles ( id, name, description )",
  "organizations ( id, name, slug, is_active )",
]);

export const usersRepository = {
  async getProfileByUserId(userId) {
    const { data, error } = await supabase
      .from(DB_TABLES.USERS)
      .select(USERS_SELECT)
      .eq(USERS_COLUMNS.ID, userId)
      .single();

    if (error) {
      throw new Error(error.message || "Profil alınamadı.");
    }

    return normalizeUser(data);
  },

  async getAll() {
    console.log("[usersRepository.getAll] select:", USERS_SELECT);

    const { data, error } = await supabase
      .from(DB_TABLES.USERS)
      .select(USERS_SELECT)
      .order(USERS_COLUMNS.CREATED_AT, { ascending: false });

    console.log("[usersRepository.getAll] raw data:", data);
    console.log("[usersRepository.getAll] raw error:", error);

    if (error) {
      throw new Error(error.message || "Kullanıcılar alınamadı.");
    }

    const normalized = safeArray(data).map(normalizeUser);
    console.log("[usersRepository.getAll] normalized:", normalized);

    return normalized;
  },

  async listRoles() {
    const { data, error } = await supabase
      .from(DB_TABLES.ROLES)
      .select("id, name, description")
      .order("id", { ascending: true });

    if (error) {
      throw new Error(error.message || "Roller alınamadı.");
    }

    return safeArray(data);
  },

  async listOrganizations() {
    const { data, error } = await supabase
      .from(DB_TABLES.ORGANIZATIONS)
      .select("id, name, slug, is_active")
      .eq("is_active", true)
      .order("id", { ascending: true });

    if (error) {
      throw new Error(error.message || "Organizasyonlar alınamadı.");
    }

    return safeArray(data);
  },

  async create(payload) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { data, error } = await supabase.functions.invoke(
      EDGE_FUNCTIONS.CREATE_USER,
      {
        body: payload,
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {},
      }
    );

    if (error) {
      throw new Error(error.message || "Kullanıcı oluşturulamadı.");
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return data;
  },

  async updatePagePermissions(userId, pagePermissions) {
    const { data, error } = await supabase
      .from(DB_TABLES.USERS)
      .update({
        [USERS_COLUMNS.PAGE_PERMISSIONS]: pagePermissions,
      })
      .eq(USERS_COLUMNS.ID, userId)
      .select(USERS_SELECT)
      .single();

    if (error) {
      throw new Error(error.message || "Kullanıcı izinleri güncellenemedi.");
    }

    return normalizeUser(data);
  },

  async updateActiveStatus(userId, isActive) {
    const { data, error } = await supabase
      .from(DB_TABLES.USERS)
      .update({
        [USERS_COLUMNS.IS_ACTIVE]: isActive,
      })
      .eq(USERS_COLUMNS.ID, userId)
      .select(USERS_SELECT)
      .single();

    if (error) {
      throw new Error(error.message || "Kullanıcı durumu güncellenemedi.");
    }

    return normalizeUser(data);
  },

  async updateRole(userId, roleId) {
    const { data, error } = await supabase
      .from(DB_TABLES.USERS)
      .update({
        [USERS_COLUMNS.ROLE_ID]: roleId,
      })
      .eq(USERS_COLUMNS.ID, userId)
      .select(USERS_SELECT)
      .single();

    if (error) {
      throw new Error(error.message || "Kullanıcı rolü güncellenemedi.");
    }

    return normalizeUser(data);
  },

  async updateOrganization(userId, organizationId) {
    const { data, error } = await supabase
      .from(DB_TABLES.USERS)
      .update({
        [USERS_COLUMNS.ORGANIZATION_ID]: organizationId,
      })
      .eq(USERS_COLUMNS.ID, userId)
      .select(USERS_SELECT)
      .single();

    if (error) {
      throw new Error(error.message || "Kullanıcı organizasyonu güncellenemedi.");
    }

    return normalizeUser(data);
  },
};