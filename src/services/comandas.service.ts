import { ok, delay } from "./http";
import { mockComandas } from "@/mocks/fixtures";
import type { Comanda } from "@/types/domain";
import type { ApiResponse } from "@/types/api";

let store: Comanda[] = [...mockComandas];

export const comandasService = {
  async listar(): Promise<ApiResponse<Comanda[]>> {
    return delay(ok(store));
  },
  async obter(id: string): Promise<ApiResponse<Comanda | null>> {
    return delay(ok(store.find((c) => c.id === id) ?? null));
  },
  async transferirItens(deId: string, paraId: string, itemIds: string[]): Promise<ApiResponse<{ ok: true }>> {
    const de = store.find((c) => c.id === deId);
    const para = store.find((c) => c.id === paraId);
    if (!de || !para) return delay({ success: false, data: null, error: { code: "NOT_FOUND", message: "Comanda não encontrada" }, meta: { request_id: crypto.randomUUID() } });
    const itens = de.itens.filter((i) => itemIds.includes(i.id));
    de.itens = de.itens.filter((i) => !itemIds.includes(i.id));
    para.itens = [...para.itens, ...itens];
    de.total_atual = de.itens.reduce((s, i) => s + i.preco_unitario * i.quantidade, 0);
    para.total_atual = para.itens.reduce((s, i) => s + i.preco_unitario * i.quantidade, 0);
    return delay(ok({ ok: true as const }));
  },
  async fechar(id: string): Promise<ApiResponse<{ ok: true }>> {
    store = store.map((c) => (c.id === id ? { ...c, status: "fechada", fechamento_em: new Date().toISOString() } : c));
    return delay(ok({ ok: true as const }));
  },
};
