import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSkeleton } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PermissionGate } from "@/components/common/PermissionGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { pedidosService } from "@/services/pedidos.service";
import { formatBRL, formatTimeAgo } from "@/lib/formatters";
import { Plus, Star, MessageCircle, ClipboardList, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export default function Pedidos() {
  const [busca, setBusca] = useState("");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["pedidos", busca],
    queryFn: () => pedidosService.listar({ busca }),
  });

  return (
    <>
      <PageHeader
        title="Pedidos"
        description="Fila única de todos os canais"
        actions={
          <PermissionGate action="criar_pedido">
            <Button onClick={() => toast.info("Wizard de novo pedido — próxima entrega")}>
              <Plus className="h-4 w-4 mr-1" /> Novo pedido
            </Button>
          </PermissionGate>
        }
      />

      <div className="mb-4">
        <Input placeholder="Buscar por cliente, telefone ou número do pedido..."
          value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      {isLoading && <LoadingSkeleton rows={6} />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {data?.data && data.data.length === 0 && (
        <EmptyState title="Nenhum pedido no filtro atual" icon={<ShoppingBag className="h-6 w-6" />} />
      )}

      <div className="space-y-2">
        {data?.data?.map((p) => (
          <Card key={p.id} className="p-4 hover:shadow-soft transition-shadow cursor-pointer"
            onClick={() => toast.info(`Drawer do pedido #${p.numero_pedido} — próxima entrega`)}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                {p.prioridade_manual && <Star className="h-4 w-4 text-warning fill-warning" />}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">#{p.numero_pedido}</span>
                    <StatusBadge status={p.status} />
                    <CanalBadge canal={p.canal} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 truncate">
                    {p.cliente_nome} · {p.itens.length} {p.itens.length === 1 ? "item" : "itens"} · há {formatTimeAgo(p.criado_em)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatBRL(p.valor_total)}</p>
                {p.valor_entrega > 0 && <p className="text-xs text-muted-foreground">+ {formatBRL(p.valor_entrega)} entrega</p>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function CanalBadge({ canal }: { canal: string }) {
  const map: Record<string, { label: string; icon: any }> = {
    consumo: { label: "Consumo", icon: ShoppingBag },
    comanda: { label: "Comanda", icon: ClipboardList },
    whatsapp: { label: "WhatsApp", icon: MessageCircle },
  };
  const cfg = map[canal] ?? { label: canal, icon: ShoppingBag };
  const Icon = cfg.icon;
  return <Badge variant="outline" className="gap-1"><Icon className="h-3 w-3" /> {cfg.label}</Badge>;
}
