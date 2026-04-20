import { supabase } from "@/integrations/supabase/client";
import { ok, fail } from "./http";
import type { ApiResponse } from "@/types/api";

export type TipoChavePix = "cpf" | "cnpj" | "telefone" | "email" | "aleatoria";

export interface ChavePix {
  id: string;
  espaco_id: string;
  chave: string;
  tipo: TipoChavePix;
  banco: string;
  nome_recebedor: string;
  criado_em: string;
  atualizado_em: string;
}

export interface ChavePixInput {
  chave: string;
  tipo: TipoChavePix;
  banco: string;
  nome_recebedor: string;
}

export const chavePixService = {
  async obter(espacoId: string): Promise<ApiResponse<ChavePix | null>> {
    const { data, error } = await supabase
      .from("chaves_pix")
      .select("*")
      .eq("espaco_id", espacoId)
      .maybeSingle();
    if (error) return fail("PIX_GET_ERR", error.message);
    return ok((data as ChavePix) ?? null);
  },

  async salvar(espacoId: string, input: ChavePixInput): Promise<ApiResponse<ChavePix>> {
    // upsert pela uniqueness em espaco_id
    const { data, error } = await supabase
      .from("chaves_pix")
      .upsert(
        { espaco_id: espacoId, ...input },
        { onConflict: "espaco_id" }
      )
      .select()
      .single();
    if (error) return fail("PIX_SAVE_ERR", error.message);
    return ok(data as ChavePix);
  },

  async excluir(espacoId: string): Promise<ApiResponse<{ ok: true }>> {
    const { error } = await supabase.from("chaves_pix").delete().eq("espaco_id", espacoId);
    if (error) return fail("PIX_DEL_ERR", error.message);
    return ok({ ok: true as const });
  },
};
