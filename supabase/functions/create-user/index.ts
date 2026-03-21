import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return jsonResponse(
        {
          error:
            "Environment variables eksik. SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY gerekli.",
        },
        500
      );
    }

    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return jsonResponse({ error: "Authorization header yok." }, 401);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const {
      data: { user: requestingUser },
      error: requestingUserError,
    } = await userClient.auth.getUser();

    console.log("DEBUG requesting user:", requestingUser?.email ?? null);
    console.log(
      "DEBUG requesting user error:",
      requestingUserError?.message ?? null
    );

    if (requestingUserError || !requestingUser) {
      return jsonResponse(
        {
          error: "Geçersiz kullanıcı tokenı.",
          details: requestingUserError?.message ?? null,
        },
        401
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: requesterProfile, error: requesterProfileError } =
      await adminClient
        .from("users")
        .select(`
          id,
          email,
          username,
          full_name,
          role_id,
          is_active,
          page_permissions,
          roles (
            id,
            name
          )
        `)
        .eq("id", requestingUser.id)
        .maybeSingle();

    console.log("DEBUG requester profile:", requesterProfile);
    console.log(
      "DEBUG requester profile error:",
      requesterProfileError?.message ?? null
    );

    if (requesterProfileError) {
      return jsonResponse(
        {
          error: "İstek yapan kullanıcının profili okunamadı.",
          details: requesterProfileError.message,
        },
        500
      );
    }

    if (!requesterProfile) {
      return jsonResponse(
        { error: "İstek yapan kullanıcı profili bulunamadı." },
        403
      );
    }

    const requesterRoleName = String(
      requesterProfile?.roles?.name || ""
    ).toLowerCase();

    const requesterHasUsersPermission =
      requesterProfile?.page_permissions?.users === true;

    const requesterIsAdmin =
      requesterRoleName.includes("admin") ||
      requesterRoleName.includes("yönetici") ||
      requesterRoleName.includes("yonetici") ||
      requesterHasUsersPermission;

    if (!requesterIsAdmin) {
      return jsonResponse(
        { error: "Bu işlem için admin yetkisi gerekli." },
        403
      );
    }

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

    console.log("DEBUG request body:", {
      email,
      username,
      full_name,
      role_id,
      is_active,
      page_permissions,
      hasPassword: Boolean(password),
    });

    if (!email || !password || !username || !full_name || !role_id) {
      return jsonResponse({ error: "Eksik alanlar var." }, 400);
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedUsername = String(username).trim().toLowerCase();

    const { data: existingUser, error: existingUserError } = await adminClient
      .from("users")
      .select("id")
      .ilike("username", normalizedUsername)
      .maybeSingle();

    console.log("DEBUG existing user:", existingUser);
    console.log(
      "DEBUG existing user error:",
      existingUserError?.message ?? null
    );

    if (existingUserError) {
      throw existingUserError;
    }

    if (existingUser) {
      return jsonResponse(
        { error: "Bu kullanıcı adı zaten kullanılıyor." },
        409
      );
    }

    console.log("DEBUG creating auth user...");

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

    console.log("DEBUG auth create result:", createdAuthUser);
    console.log("DEBUG auth create error:", authError);

    if (authError) {
      return jsonResponse(
        {
          error: authError.message || "Auth kullanıcı oluşturulamadı.",
          details: authError,
          step: "auth.admin.createUser",
        },
        500
      );
    }

    const authUserId = createdAuthUser.user?.id;

    if (!authUserId) {
      return jsonResponse(
        {
          error: "Auth kullanıcı ID alınamadı.",
          step: "auth.admin.createUser",
        },
        500
      );
    }

    const { error: profileUpdateError } = await adminClient
      .from("users")
      .update({
        email: normalizedEmail,
        username: normalizedUsername,
        full_name,
        role_id,
        is_active,
        page_permissions,
        updated_at: new Date().toISOString(),
      })
      .eq("id", authUserId);

    console.log("DEBUG public.users update error:", profileUpdateError);

    if (profileUpdateError) {
      await adminClient.auth.admin.deleteUser(authUserId);

      return jsonResponse(
        {
          error: profileUpdateError.message || "Profil kaydı güncellenemedi.",
          details: profileUpdateError,
          step: "public.users.update",
        },
        500
      );
    }

    return jsonResponse(
      {
        success: true,
        user_id: authUserId,
      },
      200
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Beklenmeyen hata";

    console.log("DEBUG FUNCTION CATCH ERROR:", error);

    return jsonResponse({ error: message }, 500);
  }
});