import { supabase } from "../supabase/client";

export const adminUsersRepository = {
  async createUser(payload) {
    const { data, error } = await supabase.functions.invoke("create-user", {
      body: payload,
    });

    if (error) {
      throw error;
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return data;
  },

  async lookupLoginUsername(username) {
    const { data, error } = await supabase.functions.invoke("login-lookup", {
      body: { username },
    });

    if (error) {
      throw error;
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return data;
  },
};