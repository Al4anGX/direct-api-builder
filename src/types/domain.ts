// Tipos do domínio — alinhados a 01_escopo, 02_handoff e 03_backend.
// IDs strings (uuid).

export type AppRole = "superadmin" | "admin" | "caixa" | "entregador";

export interface Espaco {
  id: string;
  nome: string;
  telefone: string;
  slug: string | null;
  logo_url: string | null;
  cor_primaria: string; // HSL components "24 95% 53%"
  ativo: boolean;
  trial_ate: string | null;
  criado_em: string;
}

export interface Profile {
  id: string;
  espaco_id: string | null;
  nome: string;
  email: string;
  telefone: string | null;
  ativo: boolean;
}

export interface UserRoleRow {
  id: string;
  user_id: string;
  espaco_id: string | null;
  role: AppRole;
}

// ----------------- PEDIDOS -----------------
export type CanalPedido = "consumo" | "comanda" | "whatsapp";
export type StatusPedido =
  | "Rascunho"
  | "Em analise"
  | "Em producao"
  | "Pronto"
  | "Saiu para entrega"
  | "Finalizado"
  | "Cancelado";

export interface PedidoItem {
  id: string;
  produto_id: string;
  produto_nome: string;
  quantidade: number;
  preco_unitario: number;
  observacao?: string;
  adicionais?: { id: string; nome: string; preco: number }[];
}

export interface Pedido {
  id: string;
  numero_pedido: number;
  espaco_id: string;
  cliente_id: string | null;
  cliente_nome: string;
  cliente_telefone: string;
  canal: CanalPedido;
  status: StatusPedido;
  prioridade_manual: boolean;
  itens: PedidoItem[];
  valor_subtotal: number;
  valor_entrega: number;
  valor_total: number;
  observacao_geral?: string;
  endereco_entrega?: string;
  agendado_para?: string | null;
  criado_em: string;
  atualizado_em: string;
}

// ----------------- COMANDAS -----------------
export interface Comanda {
  id: string;
  espaco_id: string;
  referencia_mesa_livre: string;
  status: "aberta" | "fechada";
  total_atual: number;
  itens: PedidoItem[];
  abertura_em: string;
  fechamento_em?: string;
}

// ----------------- PRODUTOS -----------------
export interface Categoria {
  id: string;
  nome: string;
  ordem: number;
}

export interface Adicional {
  id: string;
  nome: string;
  preco: number;
}

export interface Variacao {
  id: string;
  nome: string;
  preco_extra: number;
}

export interface Produto {
  id: string;
  espaco_id: string;
  categoria_id: string;
  categoria_nome: string;
  nome: string;
  descricao: string;
  preco_base: number;
  ativo: boolean;
  disponivel: boolean;
  exige_escolha_obrigatoria: boolean;
  fotos: string[];
  variacoes: Variacao[];
  adicionais: Adicional[];
}

// ----------------- CLIENTES -----------------
export interface EnderecoCliente {
  id: string;
  rua: string;
  numero: string;
  bairro: string;
  complemento?: string;
  cidade: string;
  cep?: string;
}

export interface Cliente {
  id: string;
  espaco_id: string;
  nome: string;
  telefone: string;
  blacklist: boolean;
  enderecos: EnderecoCliente[];
  ultimos_pedidos: { id: string; numero: number; data: string; total: number; status: StatusPedido }[];
  total_pedidos: number;
  ticket_medio: number;
}

// ----------------- ENTREGAS -----------------
export type StatusEntrega = "atribuida" | "saiu" | "entregue" | "falha";

export interface Entregador {
  id: string;
  nome: string;
  telefone: string;
  ativo: boolean;
}

export interface Entrega {
  id: string;
  pedido_id: string;
  pedido_numero: number;
  cliente_nome: string;
  endereco: string;
  bairro: string;
  entregador_id: string | null;
  entregador_nome: string | null;
  status: StatusEntrega;
  taxa_entrega: number;
  atribuida_em?: string;
  entregue_em?: string;
}

// ----------------- PAGAMENTOS -----------------
export type MetodoPagamento = "pix" | "dinheiro" | "credito" | "debito";
export type StatusPagamento = "pendente" | "aprovado" | "estornado";

export interface Pagamento {
  id: string;
  pedido_id: string;
  metodo: MetodoPagamento;
  valor: number;
  status: StatusPagamento;
  troco?: number;
  conciliado: boolean;
  criado_em: string;
}

// ----------------- WHATSAPP -----------------
export type StatusInstanciaWA = "connected" | "connecting" | "disconnected";

export interface InstanciaWhatsApp {
  id: string;
  espaco_id: string;
  numero: string;
  status: StatusInstanciaWA;
  qrcode?: string;
  ultima_conexao?: string;
}

export type StatusIAConversa = "ativa" | "pausada";

export interface ConversaWhatsApp {
  id: string;
  numero_cliente: string;
  cliente_nome: string;
  ultima_mensagem: string;
  ultima_em: string;
  ia_status: StatusIAConversa;
  pausada_motivo?: string; // ex: "operador respondeu manualmente"
  nao_lidas: number;
}

// ----------------- KPIs -----------------
export interface DashboardKpis {
  vendas_total: number;
  pedidos_total: number;
  pedidos_por_status: Record<StatusPedido, number>;
  pedidos_por_canal: Record<CanalPedido, number>;
  ticket_medio: number;
  tempo_medio_preparo_min: number;
  tempo_medio_total_min: number;
  taxa_cancelamento: number;
  receita_entrega: number;
  top_produtos: { nome: string; quantidade: number; receita: number }[];
}

// ----------------- USUÁRIOS (admin) -----------------
export interface UsuarioEspaco {
  id: string;
  email: string;
  nome: string;
  role: AppRole;
  ativo: boolean;
  ultimo_login?: string;
}
