import { supabase } from "../../../shared/lib/supabaseClient";
import { EDGE_FUNCTIONS } from "../../../shared/constants/database";

export const authRepository = {
  async signInWithPassword({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message || "Giriş işlemi başarısız.");
    }

    return data;
  },

  async resolveLogin(login) {
    const normalizedLogin = String(login || "").trim().toLowerCase();

    if (!normalizedLogin) {
      throw new Error("Kullanıcı adı veya e-posta zorunludur.");
    }

    if (normalizedLogin.includes("@")) {
      return {
        found: true,
        email: normalizedLogin,
        is_active: true,
      };
    }

    const { data, error } = await supabase.functions.invoke(
      EDGE_FUNCTIONS.RESOLVE_LOGIN,
      {
        body: { login: normalizedLogin },
      }
    );

    if (error) {
      throw new Error(error.message || "Kullanıcı lookup başarısız.");
    }

    if (!data?.found || !data?.email) {
      throw new Error("Kullanıcı bulunamadı.");
    }

    if (data?.is_active === false) {
      throw new Error("Bu hesap pasif durumda.");
    }

    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message || "Çıkış işlemi başarısız.");
    }

    return true;
  },

  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw new Error(error.message || "Oturum bilgisi alınamadı.");
    }

    return session ?? null;
  },

  async getUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      throw new Error(error.message || "Kullanıcı bilgisi alınamadı.");
    }

    return user ?? null;
  },
};