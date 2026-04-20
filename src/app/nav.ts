import {
  LayoutDashboard, ShoppingBag, ClipboardList, Package, Users, Truck,
  MessageCircle, BarChart3, Settings, UserCog, Building2, Receipt, Activity, ListOrdered
} from "lucide-react";
import type { AppRole } from "@/types/domain";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

const ADMIN: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Pedidos", url: "/pedidos", icon: ShoppingBag },
  { title: "Comandas", url: "/comandas", icon: ClipboardList },
  { title: "Produtos", url: "/produtos", icon: Package },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Entregas", url: "/entregas", icon: Truck },
  { title: "WhatsApp", url: "/whatsapp", icon: MessageCircle },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Usuários", url: "/usuarios", icon: UserCog },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

const CAIXA: NavItem[] = [
  { title: "PDV / Pedidos", url: "/pedidos", icon: ShoppingBag },
  { title: "Comandas", url: "/comandas", icon: ClipboardList },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Entregas", url: "/entregas", icon: Truck },
];

const ENTREGADOR: NavItem[] = [
  { title: "Minhas entregas", url: "/entregas", icon: Truck },
  { title: "Histórico", url: "/entregas/historico", icon: ListOrdered },
];

const SUPERADMIN: NavItem[] = [
  { title: "Espaços", url: "/superadmin/espacos", icon: Building2 },
  { title: "Assinaturas", url: "/superadmin/assinaturas", icon: Receipt },
  { title: "Financeiro", url: "/superadmin/financeiro", icon: BarChart3 },
  { title: "Uso da plataforma", url: "/superadmin/uso", icon: Activity },
];

export function getNavForRole(role: AppRole | null): NavItem[] {
  switch (role) {
    case "superadmin": return SUPERADMIN;
    case "admin": return ADMIN;
    case "caixa": return CAIXA;
    case "entregador": return ENTREGADOR;
    default: return [];
  }
}
