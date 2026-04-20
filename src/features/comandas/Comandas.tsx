import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSkeleton } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { comandasService } from "@/services/comandas.service";
import { formatBRL, formatTimeAgo } from "@/lib/formatters";
import { ClipboardList, Plus } from "lucide-react";
import { toast } from "sonner";
import { PermissionGate } from "@/components/common/PermissionGate";

export default function Comandas() {
  const { data, isLoading } = useQuery({ queryKey: ["comandas"], queryFn: () => comandasService.listar() });

  return (
    <>
      <PageHeader
        title="Comandas"
        description="Comandas abertas no Espaco"
        actions={
          <PermissionGate action="abrir_comanda">
            <Button onClick={() => toast.info("Abrir comanda — próxima entrega")}>
              <Plus className="h-4 w-4 mr-1" /> Nova comanda
            </Button>
          </PermissionGate>
        }
      />

      {isLoading && <LoadingSkeleton rows={3} />}
      {data?.data && data.data.length === 0 && (
        <EmptyState title="Nenhuma comanda aberta" icon={<ClipboardList className="h-6 w-6" />} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {data?.data?.map((c) => (
          <Card key={c.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{c.referencia_mesa_livre}</h3>
              <Badge variant={c.status === "aberta" ? "default" : "secondary"}>{c.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Aberta há {formatTimeAgo(c.abertura_em)} · {c.itens.length} itens
            </p>
            <div className="space-y-1 mb-3 text-sm">
              {c.itens.slice(0, 3).map((i) => (
                <div key={i.id} className="flex justify-between">
                  <span className="truncate">{i.quantidade}× {i.produto_nome}</span>
                  <span className="text-muted-foreground">{formatBRL(i.preco_unitario * i.quantidade)}</span>
                </div>
              ))}
              {c.itens.length > 3 && <p className="text-xs text-muted-foreground">+ {c.itens.length - 3} itens</p>}
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-semibold">{formatBRL(c.total_atual)}</span>
            </div>
            <PermissionGate action="fechar_comanda">
              <Button variant="outline" size="sm" className="w-full mt-3"
                onClick={() => toast.info("Fechamento com divisão — próxima entrega")}>
                Fechar comanda
              </Button>
            </PermissionGate>
          </Card>
        ))}
      </div>
    </>
  );
}
