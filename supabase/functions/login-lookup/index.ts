import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

function normalizeUsername(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: "Environment variables eksik." }, 500);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const username = normalizeUsername(body?.username);

    if (!username) {
      return jsonResponse({ error: "Kullanıcı adı gerekli." }, 400);
    }

    const { data, error } = await adminClient
      .from("users")
      .select("id, username, email, is_active")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      return jsonResponse({ error: error.message }, 500);
    }

    if (!data) {
      return jsonResponse({ error: "Kullanıcı bulunamadı." }, 404);
    }

    return jsonResponse({
      id: data.id,
      username: data.username,
      email: data.email,
      is_active: data.is_active,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Beklenmeyen hata";

    return jsonResponse({ error: message }, 500);
  }
});