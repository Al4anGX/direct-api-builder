// Tipos do webhook UAZAPI inbound (referência conforme 05_whatsapp §1473).
// Não implementado nesta fase — apenas para uso futuro pelo backend.

export type TipoMensagemWA = "text" | "audio" | "image" | "document" | "video" | "location";

export interface UazapiInboundEvent {
  event_id: string;
  message_id: string;
  instance_id: string;
  numero_recebedor: string;
  numero_cliente: string;
  cliente_nome?: string;
  tipo: TipoMensagemWA;
  texto?: string;
  midia?: {
    url_temporaria: string;
    mime: string;
    tamanho_bytes: number;
  };
  recebido_em: string;
}

export interface AgentContextPayload {
  request_id: string;
  timestamp: string;
  espaco: { id: string; nome: string; timezone: string };
  canal: { origem: "whatsapp"; numero_recebedor: string; numero_cliente: string; mensagem: string };
  cliente: { id: string | null; nome: string; sobrenome: string; blacklist: boolean };
  agente: {
    auth: { token_tipo: "x-api-key-temporaria"; token: string; token_expira_em_segundos: number };
    prompt_final: string;
    tools_disponiveis: string[];
  };
}
