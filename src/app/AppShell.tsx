import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useEffect } from "react";

export function AppShell() {
  const { espaco, profile, signOut } = useAuth();

  // Aplica cor primária do Espaco em runtime (white-label).
  useEffect(() => {
    if (espaco?.cor_primaria) {
      document.documentElement.style.setProperty("--brand", espaco.cor_primaria);
      document.documentElement.style.setProperty("--primary", espaco.cor_primaria);
      document.documentElement.style.setProperty("--ring", espaco.cor_primaria);
      document.documentElement.style.setProperty("--sidebar-primary", espaco.cor_primaria);
    }
  }, [espaco?.cor_primaria]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="hidden sm:block ml-2">
                <p className="text-sm font-medium">{espaco?.nome ?? "Plataforma"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-medium">{profile?.nome || profile?.email}</p>
                <p className="text-xs text-muted-foreground">{profile?.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={signOut} title="Sair">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 max-w-full overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
