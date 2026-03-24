import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type CreateUserPayload = {
  email?: string;
  username?: string;
  full_name?: string;
  password?: string;
  role_id?: number | string;
  organization_id?: number | string | null;
  is_active?: boolean;
  page_permissions?: Record<string, boolean>;
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

function normalizeEmail(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function normalizeUsername(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function toNumberOrNull(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return jsonResponse(
        { error: "Supabase environment variables are missing." },
        500
      );
    }

    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return jsonResponse({ error: "Authorization header is required." }, 401);
    }

    const requesterClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const {
      data: { user: requesterUser },
      error: requesterAuthError,
    } = await requesterClient.auth.getUser();

    if (requesterAuthError || !requesterUser) {
      return jsonResponse({ error: "Unauthorized request." }, 401);
    }

    const {
      data: requesterProfile,
      error: requesterProfileError,
    } = await adminClient
      .from("users")
      .select(
        `
          id,
          email,
          organization_id,
          role_id,
          roles (
            id,
            name
          )
        `
      )
      .eq("id", requesterUser.id)
      .single();

    if (requesterProfileError || !requesterProfile) {
      return jsonResponse(
        { error: "Requester profile could not be resolved." },
        403
      );
    }

    const requesterRoleName = String(
      requesterProfile.roles?.name ?? ""
    ).toLowerCase();
    const requesterOrganizationId = requesterProfile.organization_id ?? null;

    if (requesterRoleName !== "admin") {
      return jsonResponse(
        { error: "Only admin users can create new users." },
        403
      );
    }

    const payload = (await req.json()) as CreateUserPayload;

    const email = normalizeEmail(payload.email);
    const username = normalizeUsername(payload.username);
    const fullName = String(payload.full_name ?? "").trim();
    const password = String(payload.password ?? "");
    const roleId = toNumberOrNull(payload.role_id);
    const requestedOrganizationId = toNumberOrNull(payload.organization_id);
    const pagePermissions =
      payload.page_permissions && typeof payload.page_permissions === "object"
        ? payload.page_permissions
        : {};

    const organizationId =
      requestedOrganizationId ?? requesterOrganizationId ?? null;

    if (!email) {
      return jsonResponse({ error: "E-posta zorunludur." }, 400);
    }

    if (!username) {
      return jsonResponse({ error: "Kullanıcı adı zorunludur." }, 400);
    }

    if (!fullName) {
      return jsonResponse({ error: "Ad soyad zorunludur." }, 400);
    }

    if (!password || password.length < 6) {
      return jsonResponse(
        { error: "Şifre en az 6 karakter olmalıdır." },
        400
      );
    }

    if (!roleId) {
      return jsonResponse({ error: "Rol seçimi zorunludur." }, 400);
    }

    if (!organizationId) {
      return jsonResponse({ error: "Organizasyon seçimi zorunludur." }, 400);
    }

    if (
      requesterOrganizationId &&
      Number(organizationId) !== Number(requesterOrganizationId)
    ) {
      return jsonResponse(
        {
          error:
            "Admin yalnızca kendi organizasyonu içine kullanıcı oluşturabilir.",
        },
        403
      );
    }

    const { data: existingEmailUser } = await adminClient
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingEmailUser) {
      return jsonResponse(
        { error: "Bu e-posta ile kayıtlı kullanıcı zaten var." },
        409
      );
    }

    const { data: existingUsernameUser } = await adminClient
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existingUsernameUser) {
      return jsonResponse(
        { error: "Bu kullanıcı adı zaten kullanılıyor." },
        409
      );
    }

    const { data: roleRecord, error: roleError } = await adminClient
      .from("roles")
      .select("id, name")
      .eq("id", roleId)
      .single();

    if (roleError || !roleRecord) {
      return jsonResponse({ error: "Seçilen rol bulunamadı." }, 400);
    }

    const { data: organizationRecord, error: organizationError } =
      await adminClient
        .from("organizations")
        .select("id, name, is_active")
        .eq("id", organizationId)
        .single();

    if (organizationError || !organizationRecord) {
      return jsonResponse({ error: "Seçilen organizasyon bulunamadı." }, 400);
    }

    if (!organizationRecord.is_active) {
      return jsonResponse(
        { error: "Pasif organizasyona kullanıcı oluşturulamaz." },
        400
      );
    }

    const { data: authCreatedUser, error: authCreateError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          username,
          full_name: fullName,
          organization_id: organizationId,
        },
      });

    if (authCreateError || !authCreatedUser?.user) {
      return jsonResponse(
        { error: authCreateError?.message || "Auth user oluşturulamadı." },
        400
      );
    }

    const newUserId = authCreatedUser.user.id;

    const userInsertPayload = {
      id: newUserId,
      email,
      username,
      full_name: fullName,
      role_id: roleId,
      organization_id: organizationId,
      is_active: payload.is_active ?? true,
      page_permissions: pagePermissions,
    };

    const { data: insertedUser, error: insertUserError } = await adminClient
      .from("users")
      .insert(userInsertPayload)
      .select(
        `
          id,
          email,
          username,
          full_name,
          role_id,
          organization_id,
          is_active,
          page_permissions
        `
      )
      .single();

    if (insertUserError || !insertedUser) {
      await adminClient.auth.admin.deleteUser(newUserId);

      return jsonResponse(
        { error: insertUserError?.message || "User profili oluşturulamadı." },
        400
      );
    }

    const membershipPayload = {
      organization_id: organizationId,
      user_id: newUserId,
      role_id: roleId,
      is_active: true,
    };

    const { error: membershipError } = await adminClient
      .from("organization_memberships")
      .upsert(membershipPayload, {
        onConflict: "organization_id,user_id",
      });

    if (membershipError) {
      await adminClient.from("users").delete().eq("id", newUserId);
      await adminClient.auth.admin.deleteUser(newUserId);

      return jsonResponse(
        {
          error:
            membershipError.message ||
            "Organization membership kaydı oluşturulamadı.",
        },
        400
      );
    }

    return jsonResponse({
      success: true,
      user: insertedUser,
      organization: {
        id: organizationRecord.id,
        name: organizationRecord.name,
      },
      role: {
        id: roleRecord.id,
        name: roleRecord.name,
      },
    });
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Unexpected error",
      },
      500
    );
  }
});