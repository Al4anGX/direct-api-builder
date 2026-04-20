// Contratos das tools do agente IA (n8n) — alinhado a 05_whatsapp §18.
// Apenas tipos; implementação real virá em Fase B.

export type AgentToolName =
  | "criar-cliente"
  | "editar-cliente"
  | "gerar-link-endereco"
  | "resolver-id"
  | "criar-pedido"
  | "atualizar-pedido"
  | "fechar-pedido"
  | "cancelar-pedido"
  | "listar-cardapio-disponivel";

export interface AgentMeta {
  canal: "whatsapp";
  numero_recebedor: string;
  numero_cliente?: string;
  idempotency_key?: string;
}

export interface AgentBaseRequest {
  request_id: string;
  espaco_id: string;
  origem: "n8n-agent";
  meta: AgentMeta;
}

export interface CriarClienteRequest extends AgentBaseRequest {
  cliente: { nome: string; telefone: string };
}
export interface CriarClienteResponse {
  cliente_id: string;
  criado: boolean;
}

export interface EditarClienteRequest extends AgentBaseRequest {
  cliente_id: string;
  atualizacoes: { nome?: string; telefone?: string };
}

export type MotivoLinkEndereco =
  | "primeiro_cadastro"
  | "endereco_inexistente"
  | "endereco_desatualizado"
  | "cliente_solicitou_troca"
  | "endereco_nao_atendido"
  | "reconfirmacao_endereco";

export interface GerarLinkEnderecoRequest extends AgentBaseRequest {
  cliente_id: string;
  contexto: { motivo: MotivoLinkEndereco };
}
export interface GerarLinkEnderecoResponse {
  link_endereco: string;
  expira_em_segundos: number;
  token_id: string;
}

export type TipoIdResolver = "produto" | "adicional" | "variacao" | "categoria" | "bairro";
export interface ResolverIdRequest extends AgentBaseRequest {
  tipo_id: TipoIdResolver;
  texto_busca: string;
  top_k?: number;
}
export interface ResolverIdResponse {
  match_status: "single_match" | "multiple_matches" | "no_match";
  candidatos: { id: string; nome: string; score: number; estrategia: string }[];
}

export interface CriarPedidoRequest extends AgentBaseRequest {
  cliente_id: string;
  pedido: {
    canal: "whatsapp";
    tipo_atendimento: "entrega" | "retirada" | null;
    forma_pagamento: "pix" | "dinheiro" | null;
    endereco_id: string | null;
    agendado_para: string | null;
    observacao_geral: string | null;
  };
}
export interface CriarPedidoResponse {
  numero_pedido: number;
  status: "Rascunho";
}

export type AtualizarPedidoAction =
  | "adicionar_item"
  | "remover_item"
  | "atualizar_item"
  | "definir_endereco"
  | "definir_pagamento"
  | "definir_observacao";

export interface AtualizarPedidoRequest extends AgentBaseRequest {
  numero_pedido: number;
  action: AtualizarPedidoAction;
  payload: Record<string, unknown>;
}

export interface FecharPedidoRequest extends AgentBaseRequest {
  numero_pedido: number;
  resumo_confirmado_pelo_cliente: boolean;
}

export interface CancelarPedidoRequest extends AgentBaseRequest {
  numero_pedido: number;
  motivo: string;
}

export interface ListarCardapioRequest extends AgentBaseRequest {
  filtro?: { categoria?: string; somente_disponiveis?: boolean };
}

// Códigos de erro semânticos comuns
export type AgentErrorCode =
  | "INVALID_PAYLOAD"
  | "TOKEN_INVALIDO"
  | "ESPACO_INATIVO"
  | "MODULO_IA_BLOQUEADO"
  | "LIMITE_IA_ATINGIDO"
  | "CLIENTE_NAO_ENCONTRADO"
  | "CLIENTE_BLACKLIST"
  | "TELEFONE_INVALIDO"
  | "TELEFONE_JA_CADASTRADO"
  | "SEM_ALTERACOES"
  | "MOTIVO_INVALIDO"
  | "TIPO_ID_INVALIDO"
  | "SEM_RESULTADO"
  | "ITEM_INDISPONIVEL"
  | "PEDIDO_NAO_ENCONTRADO";
