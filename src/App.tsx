import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthInit } from "@/hooks/useAuthInit";
import { RoleGuard } from "@/components/common/RoleGuard";
import { AppShell } from "@/app/AppShell";
import Login from "@/features/auth/Login";
import SemPermissao from "@/features/auth/SemPermissao";
import Dashboard from "@/features/dashboard/Dashboard";
import Pedidos from "@/features/pedidos/Pedidos";
import Comandas from "@/features/comandas/Comandas";
import Produtos from "@/features/produtos/Produtos";
import Clientes from "@/features/clientes/Clientes";
import Entregas from "@/features/entregas/Entregas";
import WhatsApp from "@/features/whatsapp/WhatsApp";
import Relatorios from "@/features/relatorios/Relatorios";
import Usuarios from "@/features/usuarios/Usuarios";
import Configuracoes from "@/features/configuracoes/Configuracoes";
import { SuperEspacos, SuperAssinaturas, SuperFinanceiro, SuperUso } from "@/features/superadmin/Superadmin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AuthBoot({ children }: { children: React.ReactNode }) {
  useAuthInit();
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthBoot>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/sem-permissao" element={<SemPermissao />} />

            <Route element={<RoleGuard><AppShell /></RoleGuard>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pedidos" element={<RoleGuard allow={["admin", "caixa"]}><Pedidos /></RoleGuard>} />
              <Route path="/comandas" element={<RoleGuard allow={["admin", "caixa"]}><Comandas /></RoleGuard>} />
              <Route path="/produtos" element={<RoleGuard allow={["admin"]}><Produtos /></RoleGuard>} />
              <Route path="/clientes" element={<RoleGuard allow={["admin", "caixa"]}><Clientes /></RoleGuard>} />
              <Route path="/entregas" element={<RoleGuard allow={["admin", "caixa", "entregador"]}><Entregas /></RoleGuard>} />
              <Route path="/entregas/historico" element={<RoleGuard allow={["entregador", "admin", "caixa"]}><Entregas /></RoleGuard>} />
              <Route path="/whatsapp" element={<RoleGuard allow={["admin"]}><WhatsApp /></RoleGuard>} />
              <Route path="/relatorios" element={<RoleGuard allow={["admin"]}><Relatorios /></RoleGuard>} />
              <Route path="/usuarios" element={<RoleGuard allow={["admin"]}><Usuarios /></RoleGuard>} />
              <Route path="/configuracoes" element={<RoleGuard allow={["admin"]}><Configuracoes /></RoleGuard>} />

              <Route path="/superadmin" element={<Navigate to="/superadmin/espacos" replace />} />
              <Route path="/superadmin/espacos" element={<RoleGuard allow={["superadmin"]}><SuperEspacos /></RoleGuard>} />
              <Route path="/superadmin/assinaturas" element={<RoleGuard allow={["superadmin"]}><SuperAssinaturas /></RoleGuard>} />
              <Route path="/superadmin/financeiro" element={<RoleGuard allow={["superadmin"]}><SuperFinanceiro /></RoleGuard>} />
              <Route path="/superadmin/uso" element={<RoleGuard allow={["superadmin"]}><SuperUso /></RoleGuard>} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthBoot>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
