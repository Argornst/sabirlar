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

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse(
        {
          error:
            "Environment variables eksik. SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY gerekli.",
        },
        500
      );
    }

    const body = await req.json().catch(() => ({}));
    const loginValue = String(body?.login || "").trim().toLowerCase();

    if (!loginValue) {
      return jsonResponse({ error: "Login değeri gerekli." }, 400);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const isEmail = loginValue.includes("@");

    let query = adminClient
      .from("users")
      .select(`
        id,
        email,
        username,
        full_name,
        is_active
      `)
      .limit(1);

    if (isEmail) {
      query = query.ilike("email", loginValue);
    } else {
      query = query.ilike("username", loginValue);
    }

    const { data, error } = await query.maybeSingle();

    console.log("RESOLVE LOGIN INPUT:", loginValue);
    console.log("RESOLVE LOGIN RESULT:", data);
    console.log("RESOLVE LOGIN ERROR:", error);

    if (error) {
      return jsonResponse(
        {
          error: error.message || "Kullanıcı lookup başarısız.",
        },
        500
      );
    }

    if (!data) {
      return jsonResponse(
        {
          found: false,
          email: null,
          is_active: null,
        },
        200
      );
    }

    return jsonResponse(
      {
        found: true,
        id: data.id,
        email: data.email,
        username: data.username,
        full_name: data.full_name,
        is_active: data.is_active,
      },
      200
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Beklenmeyen hata";

    console.log("RESOLVE LOGIN FUNCTION ERROR:", error);

    return jsonResponse({ error: message }, 500);
  }
});