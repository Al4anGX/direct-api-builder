// Camada de tools do agente IA (n8n) — apenas mocks tipados para Fase A.
// Endpoints reais (Edge Functions) entram na Fase B.
import { ok, delay } from "./http";
import type { ApiResponse } from "@/types/api";
import type {
  CriarClienteRequest, CriarClienteResponse,
  EditarClienteRequest,
  GerarLinkEnderecoRequest, GerarLinkEnderecoResponse,
  ResolverIdRequest, ResolverIdResponse,
  CriarPedidoRequest, CriarPedidoResponse,
  AtualizarPedidoRequest, FecharPedidoRequest, CancelarPedidoRequest,
  ListarCardapioRequest,
} from "@/types/agent";

export const agentToolsService = {
  async criarCliente(req: CriarClienteRequest): Promise<ApiResponse<CriarClienteResponse>> {
    return delay(ok({ cliente_id: `cli_${Date.now()}`, criado: true }));
  },
  async editarCliente(req: EditarClienteRequest): Promise<ApiResponse<{ cliente_id: string; atualizado: true }>> {
    return delay(ok({ cliente_id: req.cliente_id, atualizado: true as const }));
  },
  async gerarLinkEndereco(req: GerarLinkEnderecoRequest): Promise<ApiResponse<GerarLinkEnderecoResponse>> {
    return delay(ok({
      link_endereco: `https://app.example.com/end/${crypto.randomUUID()}`,
      expira_em_segundos: 1800,
      token_id: crypto.randomUUID(),
    }));
  },
  async resolverId(req: ResolverIdRequest): Promise<ApiResponse<ResolverIdResponse>> {
    return delay(ok({
      match_status: "single_match",
      candidatos: [{ id: "add_45", nome: "Bacon", score: 0.97, estrategia: "exact+trigram" }],
    }));
  },
  async criarPedido(req: CriarPedidoRequest): Promise<ApiResponse<CriarPedidoResponse>> {
    return delay(ok({ numero_pedido: Math.floor(1000 + Math.random() * 9000), status: "Rascunho" as const }));
  },
  async atualizarPedido(req: AtualizarPedidoRequest): Promise<ApiResponse<{ ok: true }>> {
    return delay(ok({ ok: true as const }));
  },
  async fecharPedido(req: FecharPedidoRequest): Promise<ApiResponse<{ ok: true; status: "Em analise" }>> {
    return delay(ok({ ok: true as const, status: "Em analise" as const }));
  },
  async cancelarPedido(req: CancelarPedidoRequest): Promise<ApiResponse<{ ok: true; status: "Cancelado" }>> {
    return delay(ok({ ok: true as const, status: "Cancelado" as const }));
  },
  async listarCardapioDisponivel(req: ListarCardapioRequest): Promise<ApiResponse<{ itens: { id: string; nome: string; preco: number }[] }>> {
    return delay(ok({ itens: [{ id: "p1", nome: "X-Burger", preco: 22.9 }, { id: "p3", nome: "Coca-Cola 350ml", preco: 6 }] }));
  },
};
