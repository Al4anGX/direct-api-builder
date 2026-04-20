import { ok, delay, fail } from "./http";
import { mockInstancia, mockConversas } from "@/mocks/fixtures";
import type { InstanciaWhatsApp, ConversaWhatsApp, StatusInstanciaWA, StatusIAConversa } from "@/types/domain";
import type { ApiResponse } from "@/types/api";

let instancia: InstanciaWhatsApp = { ...mockInstancia };
let conversas: ConversaWhatsApp[] = [...mockConversas];

// Endpoints mapeados (referência):
// GET    /integracoes/whatsapp/instancias
// POST   /integracoes/whatsapp/instancias
// POST   /integracoes/whatsapp/instancias/{id}/conectar
// GET    /integracoes/whatsapp/instancias/{id}/status
// POST   /integracoes/whatsapp/instancias/{id}/desconectar
// POST   /integracoes/whatsapp/instancias/{id}/reconectar
export const whatsappService = {
  async obterInstancia(): Promise<ApiResponse<InstanciaWhatsApp>> {
    return delay(ok(instancia));
  },
  async status(_id: string): Promise<ApiResponse<{ status: StatusInstanciaWA }>> {
    return delay(ok({ status: instancia.status }));
  },
  async conectar(_id: string): Promise<ApiResponse<InstanciaWhatsApp>> {
    instancia = { ...instancia, status: "connecting" };
    setTimeout(() => { instancia = { ...instancia, status: "connected", ultima_conexao: new Date().toISOString() }; }, 1500);
    return delay(ok(instancia));
  },
  async desconectar(_id: string): Promise<ApiResponse<InstanciaWhatsApp>> {
    instancia = { ...instancia, status: "disconnected" };
    return delay(ok(instancia));
  },
  async reconectar(_id: string): Promise<ApiResponse<InstanciaWhatsApp>> {
    instancia = { ...instancia, status: "connecting" };
    setTimeout(() => { instancia = { ...instancia, status: "connected", ultima_conexao: new Date().toISOString() }; }, 1500);
    return delay(ok(instancia));
  },
  async listarConversas(): Promise<ApiResponse<ConversaWhatsApp[]>> {
    return delay(ok(conversas));
  },
  async toggleIA(conversaId: string, novoStatus: StatusIAConversa, motivo?: string): Promise<ApiResponse<ConversaWhatsApp>> {
    conversas = conversas.map((c) =>
      c.id === conversaId
        ? { ...c, ia_status: novoStatus, pausada_motivo: novoStatus === "pausada" ? (motivo ?? "Pausa manual") : undefined }
        : c
    );
    const c = conversas.find((x) => x.id === conversaId);
    return delay(c ? ok(c) : fail("CONVERSA_NAO_ENCONTRADA", "Conversa não encontrada"));
  },
};
