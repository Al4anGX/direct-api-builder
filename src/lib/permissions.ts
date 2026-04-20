// Permissões declarativas — aplicadas na UI.
// Fonte de verdade: 01_escopo §3 + 02_handoff §7.

import type { AppRole } from "@/types/domain";

export const PERMISSIONS = {
  // Pedidos
  criar_pedido: ["admin", "caixa"] as AppRole[],
  editar_pedido: ["admin", "caixa"] as AppRole[],
  cancelar_pedido: ["admin", "caixa"] as AppRole[],
  reimprimir_pedido: ["admin", "caixa"] as AppRole[],
  priorizar_pedido: ["admin", "caixa"] as AppRole[],
  // Pagamentos
  estornar_pagamento: ["admin"] as AppRole[],
  conciliar_pagamento: ["admin", "caixa"] as AppRole[],
  // Comandas
  abrir_comanda: ["admin", "caixa"] as AppRole[],
  fechar_comanda: ["admin", "caixa"] as AppRole[],
  // Produtos
  gerenciar_produtos: ["admin"] as AppRole[],
  alterar_disponibilidade_produto: ["admin", "caixa"] as AppRole[],
  // Entregas
  atribuir_entregador: ["admin", "caixa"] as AppRole[],
  ver_minhas_entregas: ["admin", "caixa", "entregador"] as AppRole[],
  // Clientes
  gerenciar_clientes: ["admin", "caixa"] as AppRole[],
  marcar_blacklist: ["admin"] as AppRole[],
  // WhatsApp
  configurar_whatsapp: ["admin"] as AppRole[],
  pausar_ia_conversa: ["admin", "caixa"] as AppRole[],
  // Relatórios
  ver_relatorios: ["admin"] as AppRole[],
  // Usuários
  gerenciar_usuarios: ["admin"] as AppRole[],
  // Superadmin
  gerenciar_espacos: ["superadmin"] as AppRole[],
  ver_uso_plataforma: ["superadmin"] as AppRole[],
} as const;

export type PermissionAction = keyof typeof PERMISSIONS;

export function can(role: AppRole | null | undefined, action: PermissionAction): boolean {
  if (!role) return false;
  return PERMISSIONS[action].includes(role);
}
