// Supabase Edge Function: lookup-product
// Consults product data by GTIN through OSCBR API. OSCBR credentials stay server-side.
// Keep Supabase JWT verification enabled for this user-facing function.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type OscbrToken = { token?: string; access_token?: string; expires_in?: number };
let tokenCache: { value: string; expiresAt: number } | null = null;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}

function validGtinCheckDigit(gtin: string): boolean {
  if (!/^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(gtin)) return false;
  let sum = 0;
  let weight = 3;
  for (let i = gtin.length - 2; i >= 0; i--) {
    sum += Number(gtin[i]) * weight;
    weight = weight === 3 ? 1 : 3;
  }
  return (10 - (sum % 10)) % 10 === Number(gtin.at(-1));
}

function base64Utf8(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function getAccessToken(username: string, password: string): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) return tokenCache.value;

  const response = await fetch("https://gtin.rscsistemas.com.br/api/v3/oauth/token", {
    method: "POST",
    headers: {
      "Authorization": "Basic " + base64Utf8(username + ":" + password),
      "Accept": "application/json",
      "User-Agent": "SuperList/1.0 (consulta de produtos)",
    },
    body: "",
    signal: AbortSignal.timeout(12000),
  });
  const data = await response.json().catch(() => ({})) as OscbrToken & Record<string, unknown>;
  const accessToken = data.token || data.access_token;
  if (!response.ok || typeof accessToken !== "string" || !accessToken) {
    console.error("OSCBR token request failed:", response.status, data.mensagem || data.message || data.erro || "unknown error");
    throw new Error(response.status === 401 ? "Credenciais da API GTIN inválidas." : "Não foi possível autenticar na API GTIN.");
  }

  const expiresIn = Number(data.expires_in) > 0 ? Number(data.expires_in) : 3600;
  tokenCache = { value: accessToken, expiresAt: Date.now() + Math.max(60, expiresIn - 60) * 1000 };
  return accessToken;
}

function normalizeV4(data: Record<string, any>, gtin: string) {
  const item = data.produto || data.product || {};
  const images = Array.isArray(item.imagens) ? item.imagens : [];
  const mainImage = images.find((image: any) => image?.principal) || images[0];
  const imageUrl = item.link_foto || mainImage?.tamanhos?.["250"] || mainImage?.tamanhos?.["500"] || mainImage?.url || "";
  const content = item.conteudo || {};
  return {
    gtin: String(item.gtin || data.gtin_consultado || gtin),
    name: String(item.nome || item.descricao || ""),
    brand: String(item.marca || ""),
    category: String(item.categoria || ""),
    unit: String(item.unidade_comercial?.descricao || content.unidade || ""),
    packageQuantity: content.quantidade ?? null,
    packageUnit: String(content.unidade || ""),
    imageUrl: String(imageUrl || ""),
    confidence: String(data.qualidade_dados?.confianca || ""),
    source: "OSCBR",
  };
}

function normalizeV3(data: Record<string, any>, gtin: string) {
  return {
    gtin: String(data.ean || gtin),
    name: String(data.nome_acento || data.nome || ""),
    brand: String(data.marca || ""),
    category: String(data.categoria || ""),
    unit: String(data.unid_abr || data.unid_desc || ""),
    packageQuantity: null,
    packageUnit: "",
    imageUrl: String(data.link_foto || ""),
    confidence: "",
    source: "OSCBR",
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido." }, 405);

  const username = Deno.env.get("OSCBR_USERNAME") || "";
  const password = Deno.env.get("OSCBR_PASSWORD") || "";
  if (!username || !password) {
    return json({ error: "A integração da API GTIN ainda não está configurada no Supabase." }, 503);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Envie um JSON válido com o campo gtin." }, 400);
  }

  const gtin = String(body.gtin || "").replace(/\D/g, "");
  if (!validGtinCheckDigit(gtin)) {
    return json({ error: "O código de barras não é um GTIN válido. Confira os dígitos e tente novamente.", code: "INVALID_GTIN" }, 400);
  }

  try {
    const accessToken = await getAccessToken(username, password);
    const headers = {
      "Authorization": "Bearer " + accessToken,
      "Accept": "application/json",
      "User-Agent": "SuperList/1.0 (consulta de produtos)",
    };

    // Try the richer V4 record first; a 403 can mean this account plan only includes V3.
    let response = await fetch("https://gtin.rscsistemas.com.br/api/v4/gtin/" + encodeURIComponent(gtin), {
      headers,
      signal: AbortSignal.timeout(15000),
    });
    let apiVersion: "v3" | "v4" = "v4";
    if (response.status === 403) {
      response = await fetch("https://gtin.rscsistemas.com.br/api/v3/gtin/" + encodeURIComponent(gtin), {
        headers,
        signal: AbortSignal.timeout(15000),
      });
      apiVersion = "v3";
    }

    const data = await response.json().catch(() => ({})) as Record<string, any>;
    if (response.status === 404) {
      return json({ found: false, gtin, source: "OSCBR", message: "Produto não encontrado na base consultada." });
    }
    if (!response.ok) {
      const status = response.status === 401 ? 502 : response.status === 403 ? 503 : response.status === 429 ? 429 : 502;
      console.error("OSCBR product lookup failed:", response.status, data.mensagem || data.message || data.erro || "unknown error");
      return json({
        error: response.status === 403
          ? "A consulta de produtos não está disponível no plano da API."
          : response.status === 429
            ? "Limite de consultas da API GTIN atingido. Tente novamente mais tarde."
            : response.status === 401
              ? "A sessão da API GTIN expirou. Tente novamente."
              : "Não foi possível consultar o produto agora.",
        code: "GTIN_LOOKUP_FAILED",
      }, status);
    }

    const product = apiVersion === "v4" ? normalizeV4(data, gtin) : normalizeV3(data, gtin);
    if (!product.name) {
      return json({ found: false, gtin, source: "OSCBR", message: "A API não retornou uma descrição para esse código." });
    }
    return json({ found: true, gtin, apiVersion, product });
  } catch (error) {
    console.error("lookup-product failure:", error instanceof Error ? error.message : error);
    return json({ error: error instanceof Error ? error.message : "Erro ao consultar o produto." }, 502);
  }
});
