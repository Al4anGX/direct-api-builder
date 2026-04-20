import { ok, delay } from "./http";
import { mockPedidos } from "@/mocks/fixtures";
import type { Pedido, StatusPedido, CanalPedido } from "@/types/domain";
import type { ApiResponse } from "@/types/api";

let store: Pedido[] = [...mockPedidos];

export const pedidosService = {
  async listar(filtros?: {
    canal?: CanalPedido;
    status?: StatusPedido;
    busca?: string;
  }): Promise<ApiResponse<Pedido[]>> {
    let list = [...store];
    if (filtros?.canal) list = list.filter((p) => p.canal === filtros.canal);
    if (filtros?.status) list = list.filter((p) => p.status === filtros.status);
    if (filtros?.busca) {
      const q = filtros.busca.toLowerCase();
      list = list.filter(
        (p) =>
          p.cliente_nome.toLowerCase().includes(q) ||
          String(p.numero_pedido).includes(q) ||
          p.cliente_telefone.includes(q)
      );
    }
    list.sort((a, b) => {
      if (a.prioridade_manual !== b.prioridade_manual) return a.prioridade_manual ? -1 : 1;
      return new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime();
    });
    return delay(ok(list));
  },

  async criar(input: {
    canal: CanalPedido;
    cliente_id: string | null;
    cliente_nome: string;
    cliente_telefone: string;
    itens: Pedido["itens"];
    valor_entrega: number;
    endereco_entrega?: string;
    observacao_geral?: string;
    enviar_para_producao: boolean;
  }): Promise<ApiResponse<Pedido>> {
    const subtotal = input.itens.reduce(
      (sum, it) => sum + (it.preco_unitario * it.quantidade) +
        (it.adicionais?.reduce((a, ad) => a + ad.preco, 0) ?? 0) * it.quantidade,
      0
    );
    const proximoNumero = (Math.max(0, ...store.map(p => p.numero_pedido)) + 1) || 1001;
    const novo: Pedido = {
      id: `ped${Date.now()}`,
      numero_pedido: proximoNumero,
      espaco_id: "demo",
      cliente_id: input.cliente_id,
      cliente_nome: input.cliente_nome,
      cliente_telefone: input.cliente_telefone,
      canal: input.canal,
      status: input.enviar_para_producao ? "Em analise" : "Rascunho",
      prioridade_manual: false,
      itens: input.itens,
      valor_subtotal: subtotal,
      valor_entrega: input.valor_entrega,
      valor_total: subtotal + input.valor_entrega,
      observacao_geral: input.observacao_geral,
      endereco_entrega: input.endereco_entrega,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };
    store = [novo, ...store];
    return delay(ok(novo));
  },

  async obter(id: string): Promise<ApiResponse<Pedido | null>> {
    return delay(ok(store.find((p) => p.id === id) ?? null));
  },

  async alterarStatus(id: string, status: StatusPedido): Promise<ApiResponse<Pedido>> {
    store = store.map((p) => (p.id === id ? { ...p, status, atualizado_em: new Date().toISOString() } : p));
    const p = store.find((x) => x.id === id)!;
    return delay(ok(p));
  },

  async priorizar(id: string, prioridade: boolean): Promise<ApiResponse<Pedido>> {
    store = store.map((p) => (p.id === id ? { ...p, prioridade_manual: prioridade } : p));
    return delay(ok(store.find((x) => x.id === id)!));
  },

  async cancelar(id: string, motivo: string): Promise<ApiResponse<Pedido>> {
    store = store.map((p) => (p.id === id ? { ...p, status: "Cancelado" as StatusPedido, observacao_geral: motivo } : p));
    return delay(ok(store.find((x) => x.id === id)!));
  },

  async reimprimir(id: string): Promise<ApiResponse<{ ok: true }>> {
    return delay(ok({ ok: true as const }));
  },
};
