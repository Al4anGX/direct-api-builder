import type {
  Pedido, Comanda, Produto, Cliente, Entrega, Entregador,
  InstanciaWhatsApp, ConversaWhatsApp, DashboardKpis, UsuarioEspaco, Categoria
} from "@/types/domain";

const ESPACO_ID = "demo";
const now = new Date();
const minus = (min: number) => new Date(now.getTime() - min * 60000).toISOString();

// ---------- CATEGORIAS / PRODUTOS ----------
export const mockCategorias: Categoria[] = [
  { id: "c1", nome: "Lanches", ordem: 1 },
  { id: "c2", nome: "Bebidas", ordem: 2 },
  { id: "c3", nome: "Sobremesas", ordem: 3 },
  { id: "c4", nome: "Combos", ordem: 4 },
];

export const mockProdutos: Produto[] = [
  {
    id: "p1", espaco_id: ESPACO_ID, categoria_id: "c1", categoria_nome: "Lanches",
    nome: "X-Burger", descricao: "Pão, hambúrguer 150g, queijo, alface, tomate",
    preco_base: 22.9, ativo: true, disponivel: true, exige_escolha_obrigatoria: false,
    fotos: [], variacoes: [], adicionais: [
      { id: "a1", nome: "Bacon", preco: 4 },
      { id: "a2", nome: "Queijo extra", preco: 3 },
    ],
  },
  {
    id: "p2", espaco_id: ESPACO_ID, categoria_id: "c1", categoria_nome: "Lanches",
    nome: "X-Salada", descricao: "Pão, hambúrguer, queijo, alface, tomate, milho",
    preco_base: 24.9, ativo: true, disponivel: true, exige_escolha_obrigatoria: false,
    fotos: [], variacoes: [], adicionais: [],
  },
  {
    id: "p3", espaco_id: ESPACO_ID, categoria_id: "c2", categoria_nome: "Bebidas",
    nome: "Coca-Cola 350ml", descricao: "Lata gelada",
    preco_base: 6, ativo: true, disponivel: true, exige_escolha_obrigatoria: false,
    fotos: [], variacoes: [], adicionais: [],
  },
  {
    id: "p4", espaco_id: ESPACO_ID, categoria_id: "c2", categoria_nome: "Bebidas",
    nome: "Suco Natural", descricao: "300ml",
    preco_base: 9, ativo: true, disponivel: false, exige_escolha_obrigatoria: true,
    fotos: [], variacoes: [
      { id: "v1", nome: "Laranja", preco_extra: 0 },
      { id: "v2", nome: "Maracujá", preco_extra: 0 },
      { id: "v3", nome: "Abacaxi", preco_extra: 1 },
    ], adicionais: [],
  },
  {
    id: "p5", espaco_id: ESPACO_ID, categoria_id: "c3", categoria_nome: "Sobremesas",
    nome: "Pudim", descricao: "Fatia generosa",
    preco_base: 12, ativo: true, disponivel: true, exige_escolha_obrigatoria: false,
    fotos: [], variacoes: [], adicionais: [],
  },
];

// ---------- CLIENTES ----------
export const mockClientes: Cliente[] = [
  {
    id: "cli1", espaco_id: ESPACO_ID, nome: "João Silva", telefone: "5511988887777",
    blacklist: false,
    enderecos: [
      { id: "e1", rua: "Rua das Flores", numero: "123", bairro: "Centro", cidade: "São Paulo" },
    ],
    ultimos_pedidos: [
      { id: "x1", numero: 1042, data: minus(60), total: 38.9, status: "Finalizado" },
      { id: "x2", numero: 1031, data: minus(180), total: 26, status: "Finalizado" },
      { id: "x3", numero: 1018, data: minus(1440), total: 51.5, status: "Finalizado" },
    ],
    total_pedidos: 14, ticket_medio: 38.5,
  },
  {
    id: "cli2", espaco_id: ESPACO_ID, nome: "Maria Souza", telefone: "5511977776666",
    blacklist: false, enderecos: [],
    ultimos_pedidos: [
      { id: "y1", numero: 1041, data: minus(45), total: 22.9, status: "Em producao" },
    ],
    total_pedidos: 3, ticket_medio: 24,
  },
  {
    id: "cli3", espaco_id: ESPACO_ID, nome: "Pedro Costa", telefone: "5511966665555",
    blacklist: true, enderecos: [],
    ultimos_pedidos: [],
    total_pedidos: 0, ticket_medio: 0,
  },
];

// ---------- PEDIDOS ----------
export const mockPedidos: Pedido[] = [
  {
    id: "ped1", numero_pedido: 1045, espaco_id: ESPACO_ID,
    cliente_id: "cli1", cliente_nome: "João Silva", cliente_telefone: "5511988887777",
    canal: "whatsapp", status: "Em analise", prioridade_manual: false,
    itens: [
      { id: "i1", produto_id: "p1", produto_nome: "X-Burger", quantidade: 2, preco_unitario: 22.9, adicionais: [{ id: "a1", nome: "Bacon", preco: 4 }] },
      { id: "i2", produto_id: "p3", produto_nome: "Coca-Cola 350ml", quantidade: 2, preco_unitario: 6 },
    ],
    valor_subtotal: 65.8, valor_entrega: 5, valor_total: 70.8,
    endereco_entrega: "Rua das Flores, 123 - Centro",
    criado_em: minus(8), atualizado_em: minus(8),
  },
  {
    id: "ped2", numero_pedido: 1044, espaco_id: ESPACO_ID,
    cliente_id: "cli2", cliente_nome: "Maria Souza", cliente_telefone: "5511977776666",
    canal: "consumo", status: "Em producao", prioridade_manual: true,
    itens: [{ id: "i3", produto_id: "p2", produto_nome: "X-Salada", quantidade: 1, preco_unitario: 24.9 }],
    valor_subtotal: 24.9, valor_entrega: 0, valor_total: 24.9,
    criado_em: minus(15), atualizado_em: minus(10),
  },
  {
    id: "ped3", numero_pedido: 1043, espaco_id: ESPACO_ID,
    cliente_id: "cli1", cliente_nome: "João Silva", cliente_telefone: "5511988887777",
    canal: "comanda", status: "Pronto", prioridade_manual: false,
    itens: [
      { id: "i4", produto_id: "p1", produto_nome: "X-Burger", quantidade: 1, preco_unitario: 22.9 },
      { id: "i5", produto_id: "p5", produto_nome: "Pudim", quantidade: 1, preco_unitario: 12 },
    ],
    valor_subtotal: 34.9, valor_entrega: 0, valor_total: 34.9,
    criado_em: minus(35), atualizado_em: minus(5),
  },
  {
    id: "ped4", numero_pedido: 1042, espaco_id: ESPACO_ID,
    cliente_id: "cli1", cliente_nome: "João Silva", cliente_telefone: "5511988887777",
    canal: "whatsapp", status: "Saiu para entrega", prioridade_manual: false,
    itens: [{ id: "i6", produto_id: "p2", produto_nome: "X-Salada", quantidade: 1, preco_unitario: 24.9 }],
    valor_subtotal: 24.9, valor_entrega: 7, valor_total: 31.9,
    endereco_entrega: "Rua das Flores, 123 - Centro",
    criado_em: minus(60), atualizado_em: minus(20),
  },
  {
    id: "ped5", numero_pedido: 1040, espaco_id: ESPACO_ID,
    cliente_id: "cli2", cliente_nome: "Maria Souza", cliente_telefone: "5511977776666",
    canal: "consumo", status: "Finalizado", prioridade_manual: false,
    itens: [{ id: "i7", produto_id: "p3", produto_nome: "Coca-Cola 350ml", quantidade: 3, preco_unitario: 6 }],
    valor_subtotal: 18, valor_entrega: 0, valor_total: 18,
    criado_em: minus(180), atualizado_em: minus(150),
  },
];

// ---------- COMANDAS ----------
export const mockComandas: Comanda[] = [
  {
    id: "com1", espaco_id: ESPACO_ID, referencia_mesa_livre: "Mesa 3",
    status: "aberta", total_atual: 87.7,
    itens: [
      { id: "ci1", produto_id: "p1", produto_nome: "X-Burger", quantidade: 2, preco_unitario: 22.9 },
      { id: "ci2", produto_id: "p3", produto_nome: "Coca-Cola 350ml", quantidade: 4, preco_unitario: 6 },
      { id: "ci3", produto_id: "p5", produto_nome: "Pudim", quantidade: 1, preco_unitario: 12 },
    ],
    abertura_em: minus(45),
  },
  {
    id: "com2", espaco_id: ESPACO_ID, referencia_mesa_livre: "Balcão 1",
    status: "aberta", total_atual: 30.9,
    itens: [{ id: "ci4", produto_id: "p2", produto_nome: "X-Salada", quantidade: 1, preco_unitario: 24.9 }, { id: "ci5", produto_id: "p3", produto_nome: "Coca-Cola 350ml", quantidade: 1, preco_unitario: 6 }],
    abertura_em: minus(20),
  },
];

// ---------- ENTREGAS / ENTREGADORES ----------
export const mockEntregadores: Entregador[] = [
  { id: "ent1", nome: "Carlos Moto", telefone: "5511955554444", ativo: true },
  { id: "ent2", nome: "Ana Bike", telefone: "5511944443333", ativo: true },
];

export const mockEntregas: Entrega[] = [
  {
    id: "e1", pedido_id: "ped4", pedido_numero: 1042,
    cliente_nome: "João Silva", endereco: "Rua das Flores, 123", bairro: "Centro",
    entregador_id: "ent1", entregador_nome: "Carlos Moto",
    status: "saiu", taxa_entrega: 7, atribuida_em: minus(20),
  },
  {
    id: "e2", pedido_id: "ped1", pedido_numero: 1045,
    cliente_nome: "João Silva", endereco: "Rua das Flores, 123", bairro: "Centro",
    entregador_id: null, entregador_nome: null,
    status: "atribuida", taxa_entrega: 5,
  },
];

// ---------- WHATSAPP ----------
export const mockInstancia: InstanciaWhatsApp = {
  id: "wa1", espaco_id: ESPACO_ID, numero: "5511999990000",
  status: "connected", ultima_conexao: minus(2),
};

export const mockConversas: ConversaWhatsApp[] = [
  { id: "co1", numero_cliente: "5511988887777", cliente_nome: "João Silva", ultima_mensagem: "Pode mandar o pedido?", ultima_em: minus(3), ia_status: "ativa", nao_lidas: 0 },
  { id: "co2", numero_cliente: "5511977776666", cliente_nome: "Maria Souza", ultima_mensagem: "Obrigada!", ultima_em: minus(12), ia_status: "pausada", pausada_motivo: "Operador respondeu manualmente", nao_lidas: 2 },
  { id: "co3", numero_cliente: "5511933332222", cliente_nome: "Visitante", ultima_mensagem: "Quanto custa o X-Burger?", ultima_em: minus(40), ia_status: "ativa", nao_lidas: 0 },
];

// ---------- KPIs ----------
export const mockKpis: DashboardKpis = {
  vendas_total: 4287.5,
  pedidos_total: 87,
  pedidos_por_status: {
    "Rascunho": 0, "Em analise": 3, "Em producao": 2, "Pronto": 1,
    "Saiu para entrega": 1, "Finalizado": 78, "Cancelado": 2,
  },
  pedidos_por_canal: { consumo: 32, comanda: 28, whatsapp: 27 },
  ticket_medio: 49.2,
  tempo_medio_preparo_min: 18,
  tempo_medio_total_min: 35,
  taxa_cancelamento: 2.3,
  receita_entrega: 312,
  top_produtos: [
    { nome: "X-Burger", quantidade: 42, receita: 961.8 },
    { nome: "Coca-Cola 350ml", quantidade: 78, receita: 468 },
    { nome: "X-Salada", quantidade: 19, receita: 473.1 },
    { nome: "Pudim", quantidade: 12, receita: 144 },
  ],
};

// ---------- USUÁRIOS ----------
export const mockUsuarios: UsuarioEspaco[] = [
  { id: "u1", email: "admin@demo.com", nome: "Admin Demo", role: "admin", ativo: true, ultimo_login: minus(5) },
  { id: "u2", email: "caixa@demo.com", nome: "Caixa Demo", role: "caixa", ativo: true, ultimo_login: minus(60) },
  { id: "u3", email: "entregador@demo.com", nome: "Entregador Demo", role: "entregador", ativo: true, ultimo_login: minus(120) },
];
