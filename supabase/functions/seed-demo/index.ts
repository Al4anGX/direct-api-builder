// Edge Function: seed-demo
// Cria (idempotente) 1 Espaco demo + 4 usuários (superadmin/admin/caixa/entregador).
// Pode ser chamada a qualquer momento — garante existência sem duplicar.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ESPACO_TELEFONE = "5511999990000";
const ESPACO_NOME = "Lanchonete Exemplo";
const SENHA_DEMO = "demo1234";

const USUARIOS = [
  { email: "super@demo.com", nome: "Super Admin", role: "superadmin", noEspaco: true },
  { email: "admin@demo.com", nome: "Admin Demo", role: "admin", noEspaco: false },
  { email: "caixa@demo.com", nome: "Caixa Demo", role: "caixa", noEspaco: false },
  { email: "entregador@demo.com", nome: "Entregador Demo", role: "entregador", noEspaco: false },
] as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const log: string[] = [];

  try {
    // 1. Espaco
    let { data: espaco } = await supabase
      .from("espacos")
      .select("*")
      .eq("telefone", ESPACO_TELEFONE)
      .maybeSingle();

    if (!espaco) {
      const { data: novo, error } = await supabase
        .from("espacos")
        .insert({
          nome: ESPACO_NOME,
          telefone: ESPACO_TELEFONE,
          slug: "lanchonete-exemplo",
          cor_primaria: "24 95% 53%",
          ativo: true,
        })
        .select()
        .single();
      if (error) throw error;
      espaco = novo;
      log.push(`Espaco criado: ${espaco.id}`);
    } else {
      log.push(`Espaco já existia: ${espaco.id}`);
    }

    // 2. Usuários
    for (const u of USUARIOS) {
      // procura usuário existente
      const { data: list } = await supabase.auth.admin.listUsers();
      let user = list?.users?.find((x: any) => x.email === u.email);

      if (!user) {
        const { data: created, error } = await supabase.auth.admin.createUser({
          email: u.email,
          password: SENHA_DEMO,
          email_confirm: true,
          user_metadata: {
            nome: u.nome,
            espaco_id: u.noEspaco ? "" : espaco.id,
          },
        });
        if (error) throw new Error(`Criar ${u.email}: ${error.message}`);
        user = created.user!;
        log.push(`Usuário criado: ${u.email}`);
      } else {
        log.push(`Usuário já existia: ${u.email}`);
      }

      // garante profile com espaco correto (trigger pode ter rodado sem metadata em casos antigos)
      await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: u.email,
            nome: u.nome,
            espaco_id: u.noEspaco ? null : espaco.id,
          },
          { onConflict: "id" }
        );

      // garante role
      await supabase
        .from("user_roles")
        .upsert(
          {
            user_id: user.id,
            espaco_id: u.noEspaco ? null : espaco.id,
            role: u.role,
          },
          { onConflict: "user_id,espaco_id,role", ignoreDuplicates: true }
        );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          espaco_id: espaco.id,
          espaco_telefone: ESPACO_TELEFONE,
          senha_padrao: SENHA_DEMO,
          usuarios: USUARIOS.map((u) => ({ email: u.email, role: u.role })),
          log,
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
        error: { code: "SEED_FAILED", message: (e as Error).message, log },
        meta: { request_id: crypto.randomUUID() },
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
