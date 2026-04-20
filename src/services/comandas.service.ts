import { ok, delay } from "./http";
import { mockComandas } from "@/mocks/fixtures";
import type { Comanda, PedidoItem } from "@/types/domain";
import type { ApiResponse } from "@/types/api";

let store: Comanda[] = [...mockComandas];

const recalc = (c: Comanda) => {
  c.total_atual = c.itens.reduce((s, i) => s + i.preco_unitario * i.quantidade, 0);
};

export const comandasService = {
  async listar(): Promise<ApiResponse<Comanda[]>> {
    return delay(ok(store));
  },
  async obter(id: string): Promise<ApiResponse<Comanda | null>> {
    return delay(ok(store.find((c) => c.id === id) ?? null));
  },
  async abrir(referencia: string): Promise<ApiResponse<Comanda>> {
    const nova: Comanda = {
      id: `com${Date.now()}`,
      espaco_id: "demo",
      referencia_mesa_livre: referencia,
      status: "aberta",
      total_atual: 0,
      itens: [],
      abertura_em: new Date().toISOString(),
    };
    store = [nova, ...store];
    return delay(ok(nova));
  },
  async adicionarItem(
    id: string,
    item: { produto_id: string; produto_nome: string; quantidade: number; preco_unitario: number },
  ): Promise<ApiResponse<Comanda>> {
    const c = store.find((x) => x.id === id);
    if (!c) return delay({ success: false, data: null, error: { code: "NOT_FOUND", message: "Comanda não encontrada" }, meta: { request_id: crypto.randomUUID() } });
    const novoItem: PedidoItem = {
      id: `ci${Date.now()}`,
      produto_id: item.produto_id,
      produto_nome: item.produto_nome,
      quantidade: item.quantidade,
      preco_unitario: item.preco_unitario,
    };
    c.itens = [...c.itens, novoItem];
    recalc(c);
    return delay(ok(c));
  },
  async removerItem(id: string, itemId: string): Promise<ApiResponse<Comanda>> {
    const c = store.find((x) => x.id === id);
    if (!c) return delay({ success: false, data: null, error: { code: "NOT_FOUND", message: "Comanda não encontrada" }, meta: { request_id: crypto.randomUUID() } });
    c.itens = c.itens.filter((i) => i.id !== itemId);
    recalc(c);
    return delay(ok(c));
  },
  async transferirItens(deId: string, paraId: string, itemIds: string[]): Promise<ApiResponse<{ ok: true }>> {
    const de = store.find((c) => c.id === deId);
    const para = store.find((c) => c.id === paraId);
    if (!de || !para) return delay({ success: false, data: null, error: { code: "NOT_FOUND", message: "Comanda não encontrada" }, meta: { request_id: crypto.randomUUID() } });
    const itens = de.itens.filter((i) => itemIds.includes(i.id));
    de.itens = de.itens.filter((i) => !itemIds.includes(i.id));
    para.itens = [...para.itens, ...itens];
    recalc(de);
    recalc(para);
    return delay(ok({ ok: true as const }));
  },
  async fechar(id: string): Promise<ApiResponse<{ ok: true }>> {
    store = store.map((c) => (c.id === id ? { ...c, status: "fechada", fechamento_em: new Date().toISOString() } : c));
    return delay(ok({ ok: true as const }));
  },
};
