// SuperList — leitura visual de código de barras e pesquisa na web com Gemini.
// Deploy: supabase functions deploy barcode-assistant
// Secret necessário: GEMINI_API_KEY (o mesmo usado pela função analyze-receipt).
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function extractJson(text: string) {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first < 0 || last <= first) throw new Error("A IA não retornou dados estruturados.");
  return JSON.parse(cleaned.slice(first, last + 1));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido." }, 405);

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) return json({ error: "Configure o secret GEMINI_API_KEY nas funções do Supabase." }, 500);

    const body = await req.json();
    const code = String(body.code || "").replace(/\D/g, "");
    const imageBase64 = typeof body.image_base64 === "string" ? body.image_base64 : "";
    const mimeType = String(body.mime_type || "image/jpeg");
    if (!code && !imageBase64) return json({ error: "Envie uma foto do código de barras ou digite os números." }, 400);
    if (imageBase64 && imageBase64.length > 8_000_000) return json({ error: "Imagem muito grande. Tente uma foto menor." }, 413);
    if (imageBase64 && !["image/jpeg", "image/png", "image/webp"].includes(mimeType)) return json({ error: "Formato de imagem não suportado." }, 400);
    if (code && ![8, 12, 13, 14].includes(code.length)) return json({ error: "O código deve ter 8, 12, 13 ou 14 dígitos." }, 400);

    const instructions = `Você é o assistente de identificação de produtos do SuperList, no Brasil.
Sua tarefa é identificar o código de barras e pesquisar o produto na WEB usando Google Search.
Se houver imagem, leia somente os dígitos impressos junto às barras; não invente dígitos. Se não conseguir ler com segurança, retorne barcode vazio e needs_confirmation=true.
Se houver código digitado, trate-o como código fornecido pelo usuário e pesquise exatamente esse código.
Pesquise o GTIN/EAN/UPC em páginas confiáveis: fabricante, varejistas e bases de produtos. Não conclua que um produto corresponde apenas porque os dígitos aparecem em uma página sem contexto.
Retorne APENAS JSON válido, sem markdown, com esta estrutura:
{"barcode":"somente dígitos ou vazio","barcode_confidence":"high|medium|low","needs_confirmation":false,"product_found":true,"name":"nome comercial do produto ou vazio","brand":"marca ou vazio","quantity":"conteúdo/volume ou vazio","category":"Hortifruti|Açougue e aves|Mercearia|Laticínios e frios|Padaria|Bebidas|Limpeza|Higiene pessoal|Congelados|Pet shop|Papelaria|Casa e utilidades|Eletrônicos|Automotivo|Outros","description":"breve descrição ou vazio","search_summary":"resumo curto do que foi encontrado","sources":[{"title":"título","url":"https://..."}]}.
Não invente nome, marca, quantidade ou fonte. Se não encontrar correspondência confiável, product_found=false e explique em search_summary. Se fontes discordarem, indique isso e não escolha arbitrariamente.
Código informado: ${code || "nenhum; identificar na imagem"}.`;

    const parts: any[] = [{ text: instructions }];
    if (imageBase64) parts.push({ inline_data: { mime_type: mimeType, data: imageBase64 } });

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          tools: [{ google_search: {} }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 1200 },
        }),
      },
    );

    const payload = await response.json();
    if (!response.ok) {
      console.error("Gemini barcode error:", payload);
      return json({ error: payload?.error?.message || "A IA não conseguiu analisar o código agora." }, response.status >= 500 ? 502 : response.status);
    }

    const candidate = payload?.candidates?.[0];
    const text = (candidate?.content?.parts || []).map((part: any) => part.text || "").join("\n");
    if (!text) return json({ error: "A IA não retornou uma identificação. Tente aproximar a câmera do código." }, 502);

    const result = extractJson(text);
    const grounding = candidate?.groundingMetadata?.groundingChunks || [];
    const groundedSources = grounding
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web?.uri)
      .map((web: any) => ({ title: web.title || web.uri, url: web.uri }));
    const sources = [...(Array.isArray(result.sources) ? result.sources : []), ...groundedSources];
    const uniqueSources = sources.filter((source: any, index: number, all: any[]) =>
      source?.url && /^https?:\/\//i.test(source.url) &&
      all.findIndex((item: any) => item.url === source.url) === index
    ).slice(0, 6);

    return json({
      ...result,
      barcode: String(result.barcode || "").replace(/\D/g, ""),
      sources: uniqueSources,
      searchQueries: candidate?.groundingMetadata?.webSearchQueries || [],
    });
  } catch (error) {
    console.error("barcode-assistant:", error);
    return json({ error: error instanceof Error ? error.message : "Erro inesperado ao analisar o código." }, 500);
  }
});
