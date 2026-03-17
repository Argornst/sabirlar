import { supabase } from "../supabase/client";

export const usersRepository = {
  async getProfileByUserId(userId) {
    const { data, error } = await supabase
      .from("users")
      .select(`
        id,
        full_name,
        email,
        is_active,
        role_id,
        roles ( name, description )
      `)
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  },
};