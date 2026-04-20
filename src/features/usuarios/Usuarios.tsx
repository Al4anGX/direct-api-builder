import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSkeleton } from "@/components/common/LoadingState";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { usuariosService } from "@/services/usuarios.service";
import { formatTimeAgo } from "@/lib/formatters";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function Usuarios() {
  const { data, isLoading } = useQuery({ queryKey: ["usuarios"], queryFn: () => usuariosService.listar() });

  return (
    <>
      <PageHeader
        title="Usuários e permissões"
        description="Equipe do Espaco"
        actions={
          <Button onClick={() => toast.info("Convite de usuário — próxima entrega")}>
            <Plus className="h-4 w-4 mr-1" /> Novo usuário
          </Button>
        }
      />
      {isLoading && <LoadingSkeleton rows={3} />}
      <div className="space-y-2">
        {data?.data?.map((u) => (
          <Card key={u.id} className="p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="font-medium">{u.nome}</p>
                <p className="text-sm text-muted-foreground">{u.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="capitalize">{u.role}</Badge>
                {u.ultimo_login && <span className="text-xs text-muted-foreground">último acesso há {formatTimeAgo(u.ultimo_login)}</span>}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{u.ativo ? "Ativo" : "Inativo"}</span>
                  <Switch checked={u.ativo} onCheckedChange={() => toast.info("Ativar/inativar — próxima entrega")} />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
