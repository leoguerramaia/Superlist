import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const allowedProviders = ["openai", "gemini", "groq"];
const defaultOrder = ["openai", "gemini", "groq"];

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "Método não permitido." }, 405);

  const projectUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const accessToken = req.headers.get("Authorization") || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || req.headers.get("apikey") || "";
  if (!projectUrl || !serviceKey || !accessToken || !anonKey) return json({ ok: false, error: "Configuração do Supabase incompleta." }, 503);

  try {
    const token = accessToken.replace(/^Bearer\s+/i, "");
    const authClient = createClient(projectUrl.replace(/\/+$/, ""), anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || claimsData?.claims?.aal !== "aal2") return json({ ok: false, error: "Confirme o código de dois fatores antes de usar a Administração." }, 403);

    const authResponse = await fetch(projectUrl.replace(/\/+$/, "") + "/auth/v1/user", {
      headers: { "apikey": anonKey, "Authorization": accessToken }
    });
    const user = await authResponse.json();
    if (!authResponse.ok || user?.app_metadata?.is_admin !== true) return json({ ok: false, error: "Acesso restrito a administradores." }, 403);

    const body = await req.json().catch(() => ({}));
    const apiUrl = projectUrl.replace(/\/+$/, "") + "/rest/v1/app_settings";
    const serviceHeaders = { "apikey": serviceKey, "Authorization": "Bearer " + serviceKey, "Content-Type": "application/json" };
    if (body.action === "get") {
      const response = await fetch(apiUrl + "?setting_key=eq.ai_provider_order&select=setting_value", { headers: serviceHeaders });
      const rows = await response.json();
      if (!response.ok) throw new Error(rows?.message || "Não foi possível carregar a prioridade das APIs.");
      const order = rows?.[0]?.setting_value;
      return json({ ok: true, order: Array.isArray(order) ? order : defaultOrder });
    }
    if (body.action === "set") {
      const order = body.order;
      if (!Array.isArray(order) || order.length !== allowedProviders.length || new Set(order).size !== allowedProviders.length || !order.every((name: string) => allowedProviders.includes(name))) {
        return json({ ok: false, error: "Selecione cada provedor uma única vez." }, 400);
      }
      const response = await fetch(apiUrl + "?on_conflict=setting_key", {
        method: "POST",
        headers: { ...serviceHeaders, "Prefer": "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify({ setting_key: "ai_provider_order", setting_value: order, updated_at: new Date().toISOString(), updated_by: user.id })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.message || "Não foi possível salvar a prioridade das APIs.");
      return json({ ok: true, order });
    }
    return json({ ok: false, error: "Ação desconhecida." }, 400);
  } catch (error) {
    console.error("provider settings error:", error);
    return json({ ok: false, error: error instanceof Error ? error.message : "Erro ao atualizar a configuração." }, 500);
  }
});
