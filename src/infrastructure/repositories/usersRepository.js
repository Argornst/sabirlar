import { supabase } from "../supabase/client";
import {
  DEFAULT_PAGE_PERMISSIONS,
  normalizePagePermissions,
} from "../../shared/constants/permissions";

function normalizeUsername(username) {
  return String(username || "")
    .trim()
    .toLowerCase();
}

export const usersRepository = {
  async getProfileByUserId(userId) {
    const { data, error } = await supabase
      .from("users")
      .select(`
        id,
        username,
        full_name,
        email,
        is_active,
        role_id,
        page_permissions,
        roles (
          id,
          name,
          description
        )
      `)
      .eq("id", userId)
      .single();

    if (error) throw error;

    return {
      ...data,
      username: normalizeUsername(data?.username),
      page_permissions: normalizePagePermissions(data?.page_permissions),
    };
  },

  async listUsers() {
    const { data, error } = await supabase
      .from("users")
      .select(`
        id,
        username,
        full_name,
        email,
        is_active,
        role_id,
        page_permissions,
        created_at,
        updated_at,
        roles (
          id,
          name,
          description
        )
      `)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return (data || []).map((user) => ({
      ...user,
      username: normalizeUsername(user?.username),
      page_permissions: normalizePagePermissions(user?.page_permissions),
    }));
  },

  async listRoles() {
    const { data, error } = await supabase
      .from("roles")
      .select("id, name, description")
      .order("id", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async updateUserAccess(userId, updates) {
    const payload = {};

    if (typeof updates.full_name === "string") {
      payload.full_name = updates.full_name.trim();
    }

    if (typeof updates.username === "string") {
      payload.username = normalizeUsername(updates.username);
    }

    if (typeof updates.email === "string") {
      payload.email = updates.email.trim().toLowerCase();
    }

    if (typeof updates.role_id === "number") {
      payload.role_id = updates.role_id;
    }

    if (typeof updates.is_active === "boolean") {
      payload.is_active = updates.is_active;
    }

    if (updates.page_permissions) {
      payload.page_permissions = {
        ...DEFAULT_PAGE_PERMISSIONS,
        ...updates.page_permissions,
      };
    }

    const { data, error } = await supabase
      .from("users")
      .update(payload)
      .eq("id", userId)
      .select(`
        id,
        username,
        full_name,
        email,
        is_active,
        role_id,
        page_permissions,
        created_at,
        updated_at,
        roles (
          id,
          name,
          description
        )
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      username: normalizeUsername(data?.username),
      page_permissions: normalizePagePermissions(data?.page_permissions),
    };
  },
};