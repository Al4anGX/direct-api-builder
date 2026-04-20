import { supabase } from "@/integrations/supabase/client";
import { ok, fail } from "./http";
import type { ApiResponse } from "@/types/api";

export type MetodoPagamento = "pix" | "dinheiro" | "credito" | "debito";
export type StatusPagamento = "pendente" | "aprovado" | "estornado";

export interface Pagamento {
  id: string;
  espaco_id: string;
  pedido_id: string;
  metodo: MetodoPagamento;
  valor: number;
  troco: number | null;
  status: StatusPagamento;
  conciliado: boolean;
  observacao: string | null;
  registrado_por: string | null;
  confirmado_por: string | null;
  confirmado_em: string | null;
  estornado_por: string | null;
  estornado_em: string | null;
  motivo_estorno: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface NovoPagamentoInput {
  espaco_id: string;
  pedido_id: string;
  metodo: MetodoPagamento;
  valor: number;
  troco?: number | null;
  observacao?: string | null;
}

export const pagamentosService = {
  async listarPorPedido(pedidoId: string): Promise<ApiResponse<Pagamento[]>> {
    const { data, error } = await supabase
      .from("pagamentos")
      .select("*")
      .eq("pedido_id", pedidoId)
      .order("criado_em", { ascending: true });
    if (error) return fail("PAG_LIST_ERR", error.message);
    return ok((data ?? []) as Pagamento[]);
  },

  async registrar(input: NovoPagamentoInput): Promise<ApiResponse<Pagamento>> {
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id ?? null;

    const payload = {
      espaco_id: input.espaco_id,
      pedido_id: input.pedido_id,
      metodo: input.metodo,
      valor: input.valor,
      troco: input.metodo === "dinheiro" ? input.troco ?? null : null,
      observacao: input.observacao ?? null,
      // PIX começa pendente (precisa conferir comprovante); demais já entram aprovados
      status: input.metodo === "pix" ? "pendente" : "aprovado",
      registrado_por: uid,
      confirmado_por: input.metodo !== "pix" ? uid : null,
      confirmado_em: input.metodo !== "pix" ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from("pagamentos")
      .insert(payload as never)
      .select()
      .single();
    if (error) return fail("PAG_INS_ERR", error.message);
    return ok(data as Pagamento);
  },

  async confirmarRecebimento(id: string): Promise<ApiResponse<Pagamento>> {
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id ?? null;
    const { data, error } = await supabase
      .from("pagamentos")
      .update({
        status: "aprovado",
        confirmado_por: uid,
        confirmado_em: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) return fail("PAG_CONF_ERR", error.message);
    return ok(data as Pagamento);
  },

  async estornar(id: string, motivo: string): Promise<ApiResponse<Pagamento>> {
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id ?? null;
    const { data, error } = await supabase
      .from("pagamentos")
      .update({
        status: "estornado",
        estornado_por: uid,
        estornado_em: new Date().toISOString(),
        motivo_estorno: motivo,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) return fail("PAG_EST_ERR", error.message);
    return ok(data as Pagamento);
  },

  async excluir(id: string): Promise<ApiResponse<{ ok: true }>> {
    const { error } = await supabase.from("pagamentos").delete().eq("id", id);
    if (error) return fail("PAG_DEL_ERR", error.message);
    return ok({ ok: true as const });
  },
};
