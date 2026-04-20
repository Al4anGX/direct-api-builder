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
