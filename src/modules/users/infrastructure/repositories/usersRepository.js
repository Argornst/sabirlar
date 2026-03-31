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
]);

async function fetchRolesMap() {
  const { data, error } = await supabase
    .from(DB_TABLES.ROLES)
    .select("id, name, description")
    .order("id", { ascending: true });

  if (error) {
    throw new Error(error.message || "Roller alınamadı.");
  }

  return safeArray(data).reduce((acc, role) => {
    acc[String(role.id)] = role;
    return acc;
  }, {});
}

async function fetchOrganizationsMap() {
  const { data, error } = await supabase
    .from(DB_TABLES.ORGANIZATIONS)
    .select("id, name, slug, is_active")
    .order("id", { ascending: true });

  if (error) {
    throw new Error(error.message || "Organizasyonlar alınamadı.");
  }

  return safeArray(data).reduce((acc, organization) => {
    acc[String(organization.id)] = organization;
    return acc;
  }, {});
}

function attachRelations(user, rolesMap, organizationsMap) {
  if (!user) return null;

  const role = rolesMap[String(user?.[USERS_COLUMNS.ROLE_ID])] ?? null;
  const organization =
    organizationsMap[String(user?.[USERS_COLUMNS.ORGANIZATION_ID])] ?? null;

  return {
    ...user,
    role_name: role?.name ?? "-",
    organization_name: organization?.name ?? "-",
    organization_slug: organization?.slug ?? null,
  };
}

export const usersRepository = {
  async getProfileByUserId(userId) {
    if (!userId) return null;

    const { data, error } = await supabase
      .from(DB_TABLES.USERS)
      .select(USERS_SELECT)
      .eq(USERS_COLUMNS.ID, userId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message || "Profil alınamadı.");
    }

    if (!data) {
      return null;
    }

    const [rolesMap, organizationsMap] = await Promise.all([
      fetchRolesMap(),
      fetchOrganizationsMap(),
    ]);

    return normalizeUser(attachRelations(data, rolesMap, organizationsMap));
  },

  async getAll() {
    const { data, error } = await supabase
      .from(DB_TABLES.USERS)
      .select(USERS_SELECT)
      .order(USERS_COLUMNS.CREATED_AT, { ascending: false });

    if (error) {
      throw new Error(error.message || "Kullanıcılar alınamadı.");
    }

    const [rolesMap, organizationsMap] = await Promise.all([
      fetchRolesMap(),
      fetchOrganizationsMap(),
    ]);

    return safeArray(data).map((user) =>
      normalizeUser(attachRelations(user, rolesMap, organizationsMap))
    );
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

    const [rolesMap, organizationsMap] = await Promise.all([
      fetchRolesMap(),
      fetchOrganizationsMap(),
    ]);

    return normalizeUser(attachRelations(data, rolesMap, organizationsMap));
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

    const [rolesMap, organizationsMap] = await Promise.all([
      fetchRolesMap(),
      fetchOrganizationsMap(),
    ]);

    return normalizeUser(attachRelations(data, rolesMap, organizationsMap));
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

    const [rolesMap, organizationsMap] = await Promise.all([
      fetchRolesMap(),
      fetchOrganizationsMap(),
    ]);

    return normalizeUser(attachRelations(data, rolesMap, organizationsMap));
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

    const [rolesMap, organizationsMap] = await Promise.all([
      fetchRolesMap(),
      fetchOrganizationsMap(),
    ]);

    return normalizeUser(attachRelations(data, rolesMap, organizationsMap));
  },
};