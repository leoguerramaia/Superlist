// Supabase Edge Function: analyze-receipt
// Secrets: OPENAI_API_KEY (principal), GEMINI_API_KEY e GROQ_API_KEY (fallbacks)
// Supabase gateway JWT verification must remain enabled for this function.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}


// OpenAI é a primeira opção para todas as leituras. Gemini e Groq permanecem como alternativas gratuitas.
async function requestOpenAI(prompt: string, imageBase64: string, mimeType: string, maxTokens: number, apiKey: string) {
  const content: any[] = [{ type: "text", text: prompt }];
  if (imageBase64) content.push({ type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } });
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: Deno.env.get("OPENAI_MODEL") || "gpt-4.1",
      messages: [{ role: "user", content }],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_completion_tokens: maxTokens
    })
  });
  const data = await response.json();
  const output = data.choices?.[0]?.message?.content;
  if (!response.ok || typeof output !== "string" || !output.trim()) throw new Error(data?.error?.message || `OpenAI respondeu com status ${response.status}.`);
  JSON.parse(output);
  return output;
}

const DEFAULT_PROVIDER_ORDER = ["openai", "gemini", "groq"];
let providerOrderCache = { order: DEFAULT_PROVIDER_ORDER, expiresAt: 0 };

async function getProviderOrder() {
  if (Date.now() < providerOrderCache.expiresAt) return providerOrderCache.order;
  const projectUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!projectUrl || !serviceKey) return DEFAULT_PROVIDER_ORDER;
  try {
    const response = await fetch(projectUrl.replace(/\/+$/, "") + "/rest/v1/app_settings?setting_key=eq.ai_provider_order&select=setting_value", {
      headers: { "apikey": serviceKey, "Authorization": "Bearer " + serviceKey }
    });
    const rows = await response.json();
    const order = rows?.[0]?.setting_value;
    if (response.ok && Array.isArray(order) && order.length === 3 &&
        new Set(order).size === 3 && order.every((provider: string) => DEFAULT_PROVIDER_ORDER.includes(provider))) {
      providerOrderCache = { order, expiresAt: Date.now() + 30000 };
      return order;
    }
  } catch (error) {
    console.warn("Não foi possível ler a ordem de provedores; usando a ordem padrão.", error);
  }
  providerOrderCache = { order: DEFAULT_PROVIDER_ORDER, expiresAt: Date.now() + 10000 };
  return DEFAULT_PROVIDER_ORDER;
}

async function analyzeWithProviders(prompt: string, imageBase64: string, mimeType: string, maxTokens: number, openaiKey: string, geminiKey: string, groqKey: string) {
  const order = await getProviderOrder();
  for (const provider of order) {
    try {
      if (provider === "openai" && openaiKey) {
        const output = await requestOpenAI(prompt, imageBase64, mimeType, maxTokens, openaiKey);
        return { output, provider: "openai" };
      }
      if (provider === "gemini" && geminiKey) {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent", {
          method: "POST",
          headers: { "x-goog-api-key": geminiKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }, ...(imageBase64 ? [{ inline_data: { mime_type: mimeType, data: imageBase64 } }] : [])] }],
            generationConfig: { responseMimeType: "application/json", temperature: 0.1, maxOutputTokens: maxTokens }
          })
        });
        const data = await response.json();
        const output = data.candidates?.flatMap((candidate: any) => candidate.content?.parts || [])?.find((part: any) => typeof part.text === "string")?.text;
        if (response.ok && output) { JSON.parse(output); return { output, provider: "gemini" }; }
        console.warn("Gemini indisponível; tentando o próximo provedor:", data?.error?.message || response.status);
      }
      if (provider === "groq" && groqKey) {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": "Bearer " + groqKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "qwen/qwen3.8-27b",
            messages: [{ role: "user", content: [{ type: "text", text: prompt }, ...(imageBase64 ? [{ type: "image_url", image_url: { url: "data:" + mimeType + ";base64," + imageBase64 } }] : [])] }],
            response_format: { type: "json_object" }, temperature: 0.1, max_completion_tokens: maxTokens
          })
        });
        const data = await response.json();
        const output = data.choices?.[0]?.message?.content;
        if (response.ok && typeof output === "string" && output.trim()) { JSON.parse(output); return { output, provider: "groq" }; }
        console.warn("Groq indisponível; tentando o próximo provedor:", data?.error?.message || response.status);
      }
    } catch (error) {
      console.warn("Falha no provedor de IA configurado; tentando o próximo.", error instanceof Error ? error.message : error);
    }
  }
  throw new Error("Não foi possível analisar o conteúdo agora. Tente novamente ou continue adicionando os itens manualmente.");
}


async function validateNamesWithProviders(prompt: string, maxTokens: number, openaiKey: string, geminiKey: string, groqKey: string) {
  return analyzeWithProviders(prompt, "", "image/jpeg", maxTokens, openaiKey, geminiKey, groqKey);
}
// Transcreve os áudios seguindo a ordem configurada pelo administrador.
async function transcribeListAudio(audioBase64: string, mimeType: string, openaiKey: string, geminiKey: string, groqKey: string) {
  const order = await getProviderOrder();
  const bytes = Uint8Array.from(atob(audioBase64), (char) => char.charCodeAt(0));
  const extension = mimeType === "audio/mp4" || mimeType === "audio/x-m4a" ? "m4a" : mimeType === "audio/mpeg" ? "mp3" : mimeType === "audio/webm" ? "webm" : mimeType === "audio/wav" ? "wav" : mimeType === "audio/ogg" ? "ogg" : mimeType === "audio/flac" ? "flac" : "audio";
  const audioFile = new Blob([bytes], { type: mimeType });
  const transcriptionPrompt = "Transcreva fielmente este áudio em português brasileiro. A pessoa está ditando uma lista de compras. Não acrescente produtos. Retorne somente JSON válido neste formato: {\"text\":\"transcrição\"}.";
  for (const provider of order) {
    try {
      if (provider === "openai" && openaiKey) {
        const form = new FormData();
        form.append("file", audioFile, "lista." + extension);
        form.append("model", "gpt-transcribe");
        form.append("language", "pt");
        form.append("prompt", "Lista de compras em português brasileiro. Preserve nomes de produtos, marcas, quantidades e unidades.");
        const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
          method: "POST", headers: { "Authorization": "Bearer " + openaiKey }, body: form, signal: AbortSignal.timeout(25000)
        });
        const data = await response.json();
        if (response.ok && typeof data.text === "string" && data.text.trim()) return data.text.trim();
        console.warn("OpenAI transcription indisponível; tentando o próximo provedor:", data?.error?.message || response.status);
      }
      if (provider === "gemini" && geminiKey) {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent", {
          method: "POST", headers: { "x-goog-api-key": geminiKey, "Content-Type": "application/json" }, signal: AbortSignal.timeout(25000),
          body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: transcriptionPrompt }, { inline_data: { mime_type: mimeType, data: audioBase64 } }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.1, maxOutputTokens: 3000 } })
        });
        const data = await response.json();
        const output = data.candidates?.flatMap((candidate: any) => candidate.content?.parts || [])?.find((part: any) => typeof part.text === "string")?.text;
        if (response.ok && output) {
          const parsed = JSON.parse(output);
          if (typeof parsed.text === "string" && parsed.text.trim()) return parsed.text.trim();
        }
        console.warn("Gemini transcription indisponível; tentando o próximo provedor:", data?.error?.message || response.status);
      }
      if (provider === "groq" && groqKey) {
        const form = new FormData();
        form.append("file", audioFile, "lista." + extension);
        form.append("model", "whisper-large-v3");
        form.append("language", "pt");
        form.append("response_format", "json");
        const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
          method: "POST", headers: { "Authorization": "Bearer " + groqKey }, body: form, signal: AbortSignal.timeout(25000)
        });
        const data = await response.json();
        if (response.ok && typeof data.text === "string" && data.text.trim()) return data.text.trim();
        console.warn("Groq transcription indisponível:", data?.error?.message || response.status);
      }
    } catch (error) {
      console.warn("Falha na transcrição; tentando o próximo provedor.", error instanceof Error ? error.message : error);
    }
  }
  throw new Error("Não foi possível transcrever o áudio agora. Tente novamente ou cole o texto da lista.");
}

function formatDisplayName(value: unknown): string {
  const minorWords = new Set(["de", "da", "do", "das", "dos", "e", "em", "no", "na", "nos", "nas", "por", "para", "com"]);
  return String(value || "").trim().replace(/\s+/g, " ").split(" ").map((word, index) =>
    word.split("-").map((part, subIndex) => {
      const lower = part.toLocaleLowerCase("pt-BR");
      if (index > 0 || subIndex > 0) {
        if (minorWords.has(lower)) return lower;
      }
      return lower.charAt(0).toLocaleUpperCase("pt-BR") + lower.slice(1);
    }).join("-")
  ).join(" ");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido." }, 405);

  const openaiKey = Deno.env.get("OPENAI_API_KEY") || "";
  const geminiKey = Deno.env.get("GEMINI_API_KEY") || "";
  const groqKey = Deno.env.get("GROQ_API_KEY") || "";

  try {
    const body = await req.json();
    const imageBase64 = String(body.image_base64 || "");
    const mimeType = String(body.mime_type || "");
    const products = Array.isArray(body.products) ? body.products.slice(0, 500) : [];
    const mode = String(body.mode || "receipt");
    if (!openaiKey && !geminiKey && !groqKey) return json({ error: "Configure OPENAI_API_KEY, GEMINI_API_KEY ou GROQ_API_KEY nas secrets da função." }, 503);

    if (mode === "validate-list") {
      const inputItems = Array.isArray(body.items) ? body.items.slice(0, 200) : [];
      if (!inputItems.length) return json({ error: "Informe ao menos um produto para revisar." }, 400);
      const safeItems = inputItems.map((item: any, index: number) => ({
        index,
        name: String(item.name || "").trim().slice(0, 140),
        quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
        unit: String(item.unit || "un").slice(0, 12)
      })).filter((item: any) => item.name);
      if (!safeItems.length) return json({ error: "Não há nomes de produtos válidos para revisar." }, 400);
      const spellPrompt = `Você revisa a grafia de nomes de produtos de uma lista de compras em português brasileiro. Corrija somente erros ortográficos claros, acentuação, letras trocadas ou palavras reconhecíveis pelo contexto. Não altere marca, variedade, tamanho, quantidade ou significado. Não transforme nomes específicos em nomes genéricos. Se houver dúvida, mantenha o nome original e indique needs_review=true. Preserve a quantidade e unidade fornecidas. Formate a sugestão com iniciais maiúsculas por palavra e conectores como de, da, do, das, dos, e, em, no, na, nos, nas, por, para e com em minúsculas, exceto no início. Nunca invente produtos.

Itens: ${JSON.stringify(safeItems)}

Responda somente JSON válido no formato: ${JSON.stringify({ items: [{ index: 0, original_name: "", suggested_name: "", has_correction: false, needs_review: false, reason: "" }] })}`;
      const checked = await validateNamesWithProviders(spellPrompt, 5000, openaiKey, geminiKey, groqKey);
      const parsed = JSON.parse(checked.output);
      const byIndex = new Map((Array.isArray(parsed.items) ? parsed.items : []).map((item: any) => [Number(item.index), item]));
      const resultItems = safeItems.map((item: any) => {
        const suggestion: any = byIndex.get(item.index);
        const suggested = suggestion ? formatDisplayName(suggestion.suggested_name || item.name) : item.name;
        const original = formatDisplayName(item.name);
        return {
          ...item,
          original_name: original,
          suggested_name: suggested,
          has_correction: !!suggestion && suggested.toLocaleLowerCase("pt-BR") !== original.toLocaleLowerCase("pt-BR"),
          needs_review: !!suggestion?.needs_review,
          reason: String(suggestion?.reason || "").slice(0, 180)
        };
      });
      return json({ mode: "validate-list", items: resultItems });
    }

    if (mode === "audio-list") {
      const audioBase64 = String(body.audio_base64 || "");
      const allowedAudio = ["audio/mpeg", "audio/mp4", "audio/mpga", "audio/m4a", "audio/x-m4a", "audio/wav", "audio/webm", "audio/ogg", "audio/flac"];
      if (!audioBase64 || !allowedAudio.includes(mimeType)) return json({ error: "Envie um áudio MP3, MP4/M4A, WAV, WEBM, OGG ou FLAC válido." }, 400);
      if (audioBase64.length > 16_000_000) return json({ error: "Áudio muito grande. O limite é 12 MB." }, 413);
      const transcript = await transcribeListAudio(audioBase64, mimeType, openaiKey, geminiKey, groqKey);
      const audioListPrompt = `Você organiza uma lista de compras ditada em português brasileiro. Extraia somente os produtos que a pessoa quer comprar. Preserve marcas, quantidades e unidades faladas; se a quantidade não for informada, use quantity=1 e unit="un". Unidades permitidas: un, kg, g, l, ml, cx, pct. Não invente itens. Retorne apenas JSON válido neste formato: ${JSON.stringify({ raw_text: "", items: [{ name: "", brand: "", quantity: 1, unit: "un" }] })}\\n\\nTranscrição: ${transcript}`;
      const parsedResult = await analyzeWithProviders(audioListPrompt, "", "audio/mpeg", 6000, openaiKey, geminiKey, groqKey);
      const parsedAudio = JSON.parse(parsedResult.output);
      const allowedUnits = ["un", "kg", "g", "l", "ml", "cx", "pct"];
      const audioItems = (Array.isArray(parsedAudio.items) ? parsedAudio.items : []).map((item: any) => {
        const quantity = Number(item.quantity), unit = String(item.unit || "un").toLowerCase();
        return { name: formatDisplayName(item.name).slice(0, 140), brand: formatDisplayName(item.brand).slice(0, 80), quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1, unit: allowedUnits.includes(unit) ? unit : "un" };
      }).filter((item: any) => item.name);
      return json({ mode: "audio-list", transcript, items: audioItems });
    }
    if (!imageBase64 || !["image/jpeg", "image/png", "image/webp"].includes(mimeType)) {
      return json({ error: "Envie uma imagem JPG, PNG ou WEBP válida." }, 400);
    }
    if (imageBase64.length > 16_000_000) {
      return json({ error: "Imagem muito grande. Limite aproximado: 12 MB." }, 413);
    }

    if (mode === "list") {
      const listPrompt = `
Você é um assistente que transcreve listas de compras manuscritas em português brasileiro.
Leia a imagem inteira e extraia somente os produtos que a pessoa pretende comprar.
Não inclua títulos, observações gerais, preços ou itens riscados/cancelados.
Preserve o nome do produto e identifique a marca somente quando estiver escrita de forma legível. Formate nomes de produtos e marcas com a primeira letra de cada palavra maiúscula, mantendo conectores como “de”, “da”, “do”, “das”, “dos” e “e” em minúsculas, exceto quando forem a primeira palavra.
A marca é opcional; não invente marcas. Extraia quantidade e unidade quando aparecerem; se não aparecerem, use quantity=1 e unit="un".
Unidades permitidas: un, kg, g, l, ml, cx, pct. Normalize sinônimos para essas unidades.
Se houver dúvida sobre a escrita, mantenha a melhor leitura possível e explique em review_reason.
Retorne todos os itens legíveis, sem inventar conteúdo.
`;
      const listPromptWithFormat = `${listPrompt}\n\nResponda exclusivamente com JSON válido, sem markdown, nesta estrutura: ${JSON.stringify({ raw_text: "", items: [{ name: "", brand: "", quantity: 1, unit: "un", confidence: "medium", review_reason: "" }] })}`;
      const listResult = await analyzeWithProviders(listPromptWithFormat, imageBase64, mimeType, 6000, openaiKey, geminiKey, groqKey);
      const listText = listResult.output;
      const listParsed = JSON.parse(listText);
      const allowedUnits = ["un", "kg", "g", "l", "ml", "cx", "pct"];
      const listItems = (Array.isArray(listParsed.items) ? listParsed.items : []).map((item: any) => {
        const quantity = Number(item.quantity);
        const unit = String(item.unit || "un").toLowerCase();
        return {
          name: formatDisplayName(item.name).slice(0, 140),
          brand: formatDisplayName(item.brand).slice(0, 80),
          quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
          unit: allowedUnits.includes(unit) ? unit : "un",
          confidence: ["high", "medium", "low"].includes(item.confidence) ? item.confidence : "medium",
          review_reason: String(item.review_reason || "").slice(0, 240)
        };
      }).filter((item: any) => item.name);
      return json({ mode: "list", raw_text: String(listParsed.raw_text || ""), items: listItems });
    }

    if (mode === "barcode") {
      if (!imageBase64) return json({ error: "Envie uma imagem do código de barras." }, 400);
      const barcodePrompt = "Analise a imagem e leia somente o código EAN/GTIN impresso junto ao código de barras. Não pesquise nem tente identificar o produto. Não invente dígitos. Se não for possível ler com segurança, retorne ean vazio e confidence low. Retorne exclusivamente JSON: {\\"ean\\":\\"somente dígitos ou vazio\\",\\"confidence\\":\\"high|medium|low\\"}.";
      const result = await analyzeWithProviders(barcodePrompt, imageBase64, mimeType, 300, openaiKey, geminiKey, groqKey);
      const parsed = JSON.parse(result.output);
      const ean = String(parsed.ean || "").replace(/\D/g, "");
      const validLength = [8, 12, 13, 14].includes(ean.length);
      return json({ ean: validLength ? ean : "", confidence: String(parsed.confidence || "low") });
    }

    if (mode !== "receipt") return json({ error: "Tipo de análise inválido." }, 400);

    const safeCatalog = products.map((p: any) => ({
      id: String(p.id || ""),
      name: String(p.name || "").slice(0, 140),
      category: String(p.category || "Outros").slice(0, 80),
      unit: String(p.unit || "un").slice(0, 12),
      netAmount: Number(p.netAmount || 1),
      netUnit: String(p.netUnit || p.unit || "un").slice(0, 12),
      barcode: String(p.barcode || "").slice(0, 32)
    })).filter((p: any) => p.id && p.name);

    const prompt = `
Você é um extrator cuidadoso de notas fiscais brasileiras NFC-e de supermercados.
Analise visualmente a imagem inteira. Não invente produtos, quantidades ou preços.
Muitas notas imprimem cada produto em duas ou três linhas: uma linha com número/código/descrição,
outra com quantidade, unidade, preço unitário e total, e uma terceira com desconto.
Agrupe corretamente essas linhas no mesmo item. Ignore cabeçalho, CNPJ, chave de acesso,
QR Code, pagamentos e rodapé. Não leia o QR Code como texto de produto.
Use números decimais em formato JSON (ex.: 0.870), valores em reais como números.
Para cada produto, informe o nome e a marca no formato Título: primeira letra de cada palavra maiúscula, mantendo conectores como “de”, “da”, “do”, “das”, “dos” e “e” em minúsculas, exceto no início. Para cada produto, informe line_total antes do desconto, discount e paid_total após desconto.
Se não houver desconto, discount=0 e paid_total=line_total.
Não confunda quantidade em kg com unidades. Não some produtos repetidos: mantenha cada linha da nota.
A soma de paid_total deve ser comparada com o valor final a pagar; não force ajustes artificiais.
Se algo estiver ilegível, use o melhor valor legível e explique em review_reason; se não for possível,
não invente e marque confiança baixa.

Catálogo existente do usuário (use apenas os IDs listados abaixo):
${JSON.stringify(safeCatalog)}

Associe um item a um produto do catálogo somente quando descrição, marca, embalagem e/ou código
forem compatíveis. Se o código de barras/código impresso corresponder exatamente ao barcode do catálogo,
isso é evidência forte. Não associe itens diferentes apenas por pertencerem à mesma categoria.
Se não houver correspondência segura, catalog_match_id e catalog_match_name devem ser null.
Use high apenas para correspondência muito clara, medium para provável que exige conferência, low para
sem correspondência ou leitura duvidosa. Nunca invente IDs. Retorne todos os itens visíveis.
`;

    const receiptPrompt = `${prompt}\n\nResponda exclusivamente com um objeto JSON válido, sem markdown, usando exatamente esta estrutura:\n${JSON.stringify({store_name:null,invoice_date:null,raw_text:"",subtotal:null,discount_total:null,invoice_total:null,items:[{receipt_code:null,name:"",brand:"",quantity:1,unit:"un",unit_price:null,line_total:0,discount:0,paid_total:0,catalog_match_id:null,catalog_match_name:null,match_confidence:"low",review_reason:""}]})}`;
    const receiptResult = await analyzeWithProviders(receiptPrompt, imageBase64, mimeType, 12000, openaiKey, geminiKey, groqKey);
    const outputText = receiptResult.output;

    const parsed = JSON.parse(outputText);
    const allowed = new Map(safeCatalog.map((p: any) => [p.id, p]));
    const items = (Array.isArray(parsed.items) ? parsed.items : []).map((item: any) => {
      const match = item.catalog_match_id ? allowed.get(String(item.catalog_match_id)) : null;
      const qty = Number(item.quantity);
      const total = Number(item.line_total);
      const discount = Number(item.discount);
      const paid = Number(item.paid_total);

      return {
        ...item,
        name: formatDisplayName(item.name),
        brand: formatDisplayName(item.brand),
        quantity: Number.isFinite(qty) && qty > 0 ? qty : 1,
        line_total: Number.isFinite(total) && total >= 0 ? total : 0,
        discount: Number.isFinite(discount) && discount >= 0 ? discount : 0,
        paid_total: Number.isFinite(paid) && paid >= 0 ? paid : Math.max(0, total - discount),
        catalog_match_id: match ? match.id : null,
        catalog_match_name: match ? match.name : null,
        match_confidence: match ? item.match_confidence : "low"
      };
    });

    return json({ ...parsed, items });
  } catch (error) {
    console.error("analyze-receipt failure:", error);
    return json({ error: error instanceof Error ? error.message : "Erro inesperado ao analisar a nota." }, 500);
  }
});

