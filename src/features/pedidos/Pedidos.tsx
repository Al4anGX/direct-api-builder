import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSkeleton } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { PermissionGate } from "@/components/common/PermissionGate";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { pedidosService } from "@/services/pedidos.service";
import { formatBRL, formatTimeAgo } from "@/lib/formatters";
import { useAuth } from "@/hooks/useAuth";
import { can } from "@/lib/permissions";
import { Plus, Star, MessageCircle, ClipboardList, ShoppingBag, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import type { Pedido, StatusPedido, CanalPedido } from "@/types/domain";
import { PedidoDrawer } from "./PedidoDrawer";
import { NovoPedidoWizard } from "./NovoPedidoWizard";

// 5 colunas operacionais. Rascunho/Cancelado/Finalizado ficam fora do quadro.
const COLUNAS: { status: StatusPedido; label: string; next: StatusPedido | null }[] = [
  { status: "Em analise", label: "Em análise", next: "Em producao" },
  { status: "Em producao", label: "Em produção", next: "Pronto" },
  { status: "Pronto", label: "Pronto", next: "Saiu para entrega" },
  { status: "Saiu para entrega", label: "Saiu p/ entrega", next: "Finalizado" },
  { status: "Finalizado", label: "Finalizado", next: null },
];

export default function Pedidos() {
  const [busca, setBusca] = useState("");
  const [canal, setCanal] = useState<CanalPedido | "todos">("todos");
  const [pedidoSelId, setPedidoSelId] = useState<string | null>(null);
  const [novoOpen, setNovoOpen] = useState(false);
  const qc = useQueryClient();
  const { activeRole } = useAuth();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["pedidos", busca, canal],
    queryFn: () => pedidosService.listar({
      busca,
      canal: canal === "todos" ? undefined : canal,
    }),
  });

  const avancar = useMutation({
    mutationFn: ({ id, status }: { id: string; status: StatusPedido }) =>
      pedidosService.alterarStatus(id, status),
    onSuccess: (_r, vars) => {
      toast.success(`Pedido movido para "${vars.status}"`);
      qc.invalidateQueries({ queryKey: ["pedidos"] });
    },
    onError: () => toast.error("Não foi possível mover o pedido"),
  });

  const grupos = useMemo(() => {
    const base: Record<StatusPedido, Pedido[]> = {
      "Rascunho": [], "Em analise": [], "Em producao": [], "Pronto": [],
      "Saiu para entrega": [], "Finalizado": [], "Cancelado": [],
    };
    (data?.data ?? []).forEach((p) => { base[p.status]?.push(p); });
    return base;
  }, [data]);

  const podeAvancar = can(activeRole, "editar_pedido");

  return (
    <>
      <PageHeader
        title="Pedidos"
        description="Quadro Kanban — fila única de todos os canais"
        actions={
          <PermissionGate action="criar_pedido">
            <Button onClick={() => setNovoOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Novo pedido
            </Button>
          </PermissionGate>
        }
      />

      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Buscar por cliente, telefone ou número do pedido..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="sm:max-w-md"
        />
        <Select value={canal} onValueChange={(v) => setCanal(v as CanalPedido | "todos")}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Canal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os canais</SelectItem>
            <SelectItem value="consumo">Consumo no local</SelectItem>
            <SelectItem value="comanda">Comanda</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && <LoadingSkeleton rows={6} />}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <div className="flex gap-3 min-w-max">
            {COLUNAS.map((col) => (
              <Coluna
                key={col.status}
                titulo={col.label}
                status={col.status}
                pedidos={grupos[col.status]}
                proximoStatus={col.next}
                onAvancar={(id, next) => avancar.mutate({ id, status: next })}
                onAbrir={(id) => setPedidoSelId(id)}
                podeAvancar={podeAvancar}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}

      <PedidoDrawer
        pedidoId={pedidoSelId}
        open={!!pedidoSelId}
        onOpenChange={(v) => { if (!v) setPedidoSelId(null); }}
      />
    </>
  );
}

function Coluna({
  titulo, status, pedidos, proximoStatus, onAvancar, onAbrir, podeAvancar,
}: {
  titulo: string;
  status: StatusPedido;
  pedidos: Pedido[];
  proximoStatus: StatusPedido | null;
  onAvancar: (id: string, next: StatusPedido) => void;
  onAbrir: (id: string) => void;
  podeAvancar: boolean;
}) {
  return (
    <div className="w-80 shrink-0 flex flex-col bg-muted/30 rounded-lg border border-border">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <StatusBadge status={status} />
        </div>
        <Badge variant="outline" className="text-xs">{pedidos.length}</Badge>
      </div>
      <div className="p-2 flex flex-col gap-2 max-h-[calc(100vh-22rem)] overflow-y-auto">
        {pedidos.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">Nenhum pedido</p>
        ) : (
          pedidos.map((p) => (
            <PedidoCard
              key={p.id}
              pedido={p}
              proximoStatus={proximoStatus}
              onAvancar={onAvancar}
              onAbrir={onAbrir}
              podeAvancar={podeAvancar}
            />
          ))
        )}
      </div>
    </div>
  );
}

function PedidoCard({
  pedido, proximoStatus, onAvancar, onAbrir, podeAvancar,
}: {
  pedido: Pedido;
  proximoStatus: StatusPedido | null;
  onAvancar: (id: string, next: StatusPedido) => void;
  onAbrir: (id: string) => void;
  podeAvancar: boolean;
}) {
  return (
    <Card
      className="p-3 hover:shadow-soft transition-shadow cursor-pointer space-y-2"
      onClick={() => onAbrir(pedido.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {pedido.prioridade_manual && <Star className="h-3.5 w-3.5 text-warning fill-warning shrink-0" />}
          <span className="font-semibold text-sm">#{pedido.numero_pedido}</span>
        </div>
        <CanalBadge canal={pedido.canal} />
      </div>

      <p className="text-xs text-muted-foreground truncate">{pedido.cliente_nome}</p>

      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {pedido.itens.length} {pedido.itens.length === 1 ? "item" : "itens"} · há {formatTimeAgo(pedido.criado_em)}
        </span>
        <span className="font-semibold">{formatBRL(pedido.valor_total)}</span>
      </div>

      {proximoStatus && podeAvancar && (
        <Button
          size="sm"
          variant="outline"
          className="w-full h-7 text-xs"
          onClick={(e) => { e.stopPropagation(); onAvancar(pedido.id, proximoStatus); }}
        >
          Avançar <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      )}
    </Card>
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
  return (
    <Badge variant="outline" className="gap-1 text-[10px] px-1.5 py-0 h-5">
      <Icon className="h-3 w-3" /> {cfg.label}
    </Badge>
  );
}
