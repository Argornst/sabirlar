import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Environment variables eksik." }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();

    const {
      email,
      password,
      username,
      full_name,
      role_id,
      is_active = true,
      page_permissions = {},
    } = body || {};

    if (!email || !password || !username || !full_name || !role_id) {
      return new Response(
        JSON.stringify({ error: "Eksik alanlar var." }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedUsername = String(username).trim().toLowerCase();

    const { data: existingUser, error: existingUserError } = await adminClient
      .from("users")
      .select("id")
      .ilike("username", normalizedUsername)
      .maybeSingle();

    if (existingUserError) {
      throw existingUserError;
    }

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "Bu kullanıcı adı zaten kullanılıyor." }),
        {
          status: 409,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { data: createdAuthUser, error: authError } =
      await adminClient.auth.admin.createUser({
        email: normalizedEmail,
        password: String(password),
        email_confirm: true,
        user_metadata: {
          full_name,
          username: normalizedUsername,
        },
      });

    if (authError) {
      throw authError;
    }

    const authUserId = createdAuthUser.user?.id;

    if (!authUserId) {
      throw new Error("Auth kullanıcı oluşturulamadı.");
    }

    const { error: profileError } = await adminClient.from("users").insert({
      id: authUserId,
      email: normalizedEmail,
      username: normalizedUsername,
      full_name,
      role_id,
      is_active,
      page_permissions,
    });

    if (profileError) {
      await adminClient.auth.admin.deleteUser(authUserId);
      throw profileError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: authUserId,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Beklenmeyen hata";

    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});