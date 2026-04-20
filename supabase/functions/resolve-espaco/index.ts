// Edge Function: resolve-espaco
// Recebe { telefone } e retorna dados públicos do Espaco para a 1ª etapa do login.
// PÚBLICA (verify_jwt = false). Retorna apenas dados de branding, nada sensível.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function normalizeTelefone(input: string): string {
  return (input || "").replace(/\D/g, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { telefone } = await req.json();
    const tel = normalizeTelefone(String(telefone ?? ""));

    if (tel.length < 10 || tel.length > 15) {
      return new Response(
        JSON.stringify({
          success: false,
          data: null,
          error: { code: "TELEFONE_INVALIDO", message: "Telefone inválido" },
          meta: { request_id: crypto.randomUUID() },
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Tenta com o telefone exato e variações comuns (com/sem 55)
    const candidatos = Array.from(new Set([tel, tel.startsWith("55") ? tel.slice(2) : `55${tel}`]));

    const { data, error } = await supabase
      .from("espacos")
      .select("id, nome, logo_url, cor_primaria, ativo")
      .in("telefone", candidatos)
      .limit(1)
      .maybeSingle();

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          data: null,
          error: { code: "DB_ERROR", message: error.message },
          meta: { request_id: crypto.randomUUID() },
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({
          success: false,
          data: null,
          error: { code: "ESPACO_NAO_ENCONTRADO", message: "Nenhum Espaco encontrado para esse telefone" },
          meta: { request_id: crypto.randomUUID() },
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!data.ativo) {
      return new Response(
        JSON.stringify({
          success: false,
          data: null,
          error: { code: "ESPACO_INATIVO", message: "Este Espaco está inativo" },
          meta: { request_id: crypto.randomUUID() },
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: data.id,
          nome: data.nome,
          logo_url: data.logo_url,
          cor_primaria: data.cor_primaria,
        },
        error: null,
        meta: { request_id: crypto.randomUUID() },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({
        success: false,
        data: null,
        error: { code: "INTERNAL_ERROR", message: (e as Error).message },
        meta: { request_id: crypto.randomUUID() },
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
