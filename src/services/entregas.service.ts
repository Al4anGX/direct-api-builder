import { ok, delay } from "./http";
import { mockEntregas, mockEntregadores } from "@/mocks/fixtures";
import type { Entrega, Entregador, StatusEntrega } from "@/types/domain";
import type { ApiResponse } from "@/types/api";

let store: Entrega[] = [...mockEntregas];

export const entregasService = {
  async listar(): Promise<ApiResponse<Entrega[]>> {
    return delay(ok(store));
  },
  async listarEntregadores(): Promise<ApiResponse<Entregador[]>> {
    return delay(ok(mockEntregadores));
  },
  async atribuir(entregaId: string, entregadorId: string): Promise<ApiResponse<Entrega>> {
    const ent = mockEntregadores.find((e) => e.id === entregadorId);
    store = store.map((e) =>
      e.id === entregaId
        ? { ...e, entregador_id: entregadorId, entregador_nome: ent?.nome ?? null, status: "atribuida" as StatusEntrega, atribuida_em: new Date().toISOString() }
        : e
    );
    return delay(ok(store.find((x) => x.id === entregaId)!));
  },
  async alterarStatus(entregaId: string, status: StatusEntrega): Promise<ApiResponse<Entrega>> {
    store = store.map((e) => (e.id === entregaId ? { ...e, status, ...(status === "entregue" ? { entregue_em: new Date().toISOString() } : {}) } : e));
    return delay(ok(store.find((x) => x.id === entregaId)!));
  },
};
