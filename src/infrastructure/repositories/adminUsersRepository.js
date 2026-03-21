import { supabase } from "../supabase/client";

export const adminUsersRepository = {
  async createUser(payload) {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    console.log("SESSION EXISTS:", !!session);
    console.log("ACCESS TOKEN:", session?.access_token);
    console.log("SESSION ERROR:", sessionError);

    const { data, error } = await supabase.functions.invoke("create-user", {
      body: payload,
      headers: session?.access_token
        ? {
            Authorization: `Bearer ${session.access_token}`,
          }
        : {},
    });

    console.log("FUNCTION DATA:", data);
    console.log("FUNCTION ERROR:", error);

    if (error) {
      if (typeof error.context?.json === "function") {
        try {
          const body = await error.context.json();
          console.log("FUNCTION ERROR BODY(JSON):", body);

          throw new Error(
            body?.error || body?.message || "Kullanıcı oluşturulamadı."
          );
        } catch (parseError) {
          console.log("FUNCTION ERROR JSON PARSE ERROR:", parseError);
          throw new Error("Kullanıcı oluşturulamadı.");
        }
      }

      throw new Error("Kullanıcı oluşturulamadı.");
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return data;
  },

  async listUsers() {
    const { data, error } = await supabase
      .from("users")
      .select(`
        id,
        email,
        username,
        full_name,
        role_id,
        is_active,
        created_at,
        updated_at,
        page_permissions,
        roles (
          id,
          name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message || "Kullanıcılar alınamadı.");
    }

    return data || [];
  },

  async listRoles() {
    const { data, error } = await supabase
      .from("roles")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      throw new Error(error.message || "Roller alınamadı.");
    }

    return data || [];
  },

  async updateUser(userId, updates) {
    const { data, error } = await supabase
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select(`
        id,
        email,
        username,
        full_name,
        role_id,
        is_active,
        created_at,
        updated_at,
        page_permissions,
        roles (
          id,
          name
        )
      `)
      .single();

    if (error) {
      throw new Error(error.message || "Kullanıcı güncellenemedi.");
    }

    return data;
  },

  async updateUserAccess(userId, updates) {
    const { data, error } = await supabase
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select(`
        id,
        email,
        username,
        full_name,
        role_id,
        is_active,
        created_at,
        updated_at,
        page_permissions,
        roles (
          id,
          name
        )
      `)
      .single();

    if (error) {
      throw new Error(error.message || "Kullanıcı erişimi güncellenemedi.");
    }

    return data;
  },

  async toggleUserActive(userId, isActive) {
    const { data, error } = await supabase
      .from("users")
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select(`
        id,
        email,
        username,
        full_name,
        role_id,
        is_active,
        created_at,
        updated_at,
        page_permissions,
        roles (
          id,
          name
        )
      `)
      .single();

    if (error) {
      throw new Error(error.message || "Kullanıcı durumu güncellenemedi.");
    }

    return data;
  },

  async lookupLoginUsername(loginValue) {
    const normalized = String(loginValue || "").trim().toLowerCase();

    if (!normalized) {
      return null;
    }

    const { data, error } = await supabase.functions.invoke("resolve-login", {
      body: {
        login: normalized,
      },
    });

    console.log("LOOKUP LOGIN INPUT:", normalized);
    console.log("LOOKUP LOGIN RESULT:", data);
    console.log("LOOKUP LOGIN ERROR:", error);

    if (error) {
      if (typeof error.context?.json === "function") {
        try {
          const body = await error.context.json();
          throw new Error(
            body?.error || body?.message || "Giriş kullanıcı bilgisi alınamadı."
          );
        } catch {
          throw new Error("Giriş kullanıcı bilgisi alınamadı.");
        }
      }

      throw new Error("Giriş kullanıcı bilgisi alınamadı.");
    }

    if (!data?.found) {
      return null;
    }

    return data;
  },
};