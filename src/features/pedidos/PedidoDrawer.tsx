import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { LoadingSkeleton } from "@/components/common/LoadingState";
import { PermissionGate } from "@/components/common/PermissionGate";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { pedidosService } from "@/services/pedidos.service";
import { PagamentosPedido } from "./PagamentosPedido";
import { formatBRL, formatDateTimeBR, formatTelefoneBR } from "@/lib/formatters";
import { useAuth } from "@/hooks/useAuth";
import { can } from "@/lib/permissions";
import {
  Star, Printer, XCircle, ArrowRight, MapPin, Phone, MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import type { StatusPedido } from "@/types/domain";

const PROXIMO: Partial<Record<StatusPedido, StatusPedido>> = {
  "Em analise": "Em producao",
  "Em producao": "Pronto",
  "Pronto": "Saiu para entrega",
  "Saiu para entrega": "Finalizado",
};

interface Props {
  pedidoId: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function PedidoDrawer({ pedidoId, open, onOpenChange }: Props) {
  const qc = useQueryClient();
  const { activeRole } = useAuth();
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [motivo, setMotivo] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["pedido", pedidoId],
    queryFn: () => pedidosService.obter(pedidoId!),
    enabled: !!pedidoId && open,
  });

  const pedido = data?.data ?? null;

  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ["pedidos"] });
    qc.invalidateQueries({ queryKey: ["pedido", pedidoId] });
  };

  const avancar = useMutation({
    mutationFn: (next: StatusPedido) => pedidosService.alterarStatus(pedidoId!, next),
    onSuccess: (_r, next) => { toast.success(`Pedido movido para "${next}"`); invalidar(); },
    onError: () => toast.error("Não foi possível alterar o status"),
  });

  const priorizar = useMutation({
    mutationFn: (v: boolean) => pedidosService.priorizar(pedidoId!, v),
    onSuccess: (_r, v) => { toast.success(v ? "Pedido priorizado" : "Prioridade removida"); invalidar(); },
    onError: () => toast.error("Não foi possível atualizar a prioridade"),
  });

  const cancelar = useMutation({
    mutationFn: () => pedidosService.cancelar(pedidoId!, motivo.trim()),
    onSuccess: () => {
      toast.success("Pedido cancelado");
      setConfirmCancelOpen(false);
      setMotivo("");
      invalidar();
      onOpenChange(false);
    },
    onError: () => toast.error("Não foi possível cancelar"),
  });

  const reimprimir = useMutation({
    mutationFn: () => pedidosService.reimprimir(pedidoId!),
    onSuccess: () => toast.success("Reimpressão enviada"),
    onError: () => toast.error("Não foi possível reimprimir"),
  });

  const next = pedido ? PROXIMO[pedido.status] ?? null : null;
  const isFinalizado = pedido?.status === "Finalizado" || pedido?.status === "Cancelado";
  const podeEditar = can(activeRole, "editar_pedido");
  const podePriorizar = can(activeRole, "priorizar_pedido");
  const podeCancelar = can(activeRole, "cancelar_pedido");
  const podeReimprimir = can(activeRole, "reimprimir_pedido");

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
          {isLoading || !pedido ? (
            <div className="p-6"><LoadingSkeleton rows={8} /></div>
          ) : (
            <>
              <SheetHeader className="p-6 pb-4 border-b border-border">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {pedido.prioridade_manual && <Star className="h-4 w-4 text-warning fill-warning shrink-0" />}
                    <SheetTitle className="truncate">Pedido #{pedido.numero_pedido}</SheetTitle>
                  </div>
                  <StatusBadge status={pedido.status} />
                </div>
                <SheetDescription className="text-left">
                  Criado em {formatDateTimeBR(pedido.criado_em)} · Canal: {pedido.canal}
                </SheetDescription>
              </SheetHeader>

              <ScrollArea className="flex-1">
                <div className="p-6 space-y-5">
                  {/* Cliente */}
                  <section className="space-y-1">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Cliente</h3>
                    <p className="font-medium">{pedido.cliente_nome}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" /> {formatTelefoneBR(pedido.cliente_telefone)}
                    </p>
                    {pedido.endereco_entrega && (
                      <p className="text-sm text-muted-foreground flex items-start gap-1.5 pt-1">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>{pedido.endereco_entrega}</span>
                      </p>
                    )}
                  </section>

                  <Separator />

                  {/* Itens */}
                  <section className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                      Itens ({pedido.itens.length})
                    </h3>
                    <ul className="space-y-3">
                      {pedido.itens.map((it) => (
                        <li key={it.id} className="text-sm">
                          <div className="flex justify-between gap-2">
                            <span>
                              <span className="font-medium">{it.quantidade}×</span> {it.produto_nome}
                            </span>
                            <span className="text-muted-foreground">
                              {formatBRL(it.preco_unitario * it.quantidade)}
                            </span>
                          </div>
                          {it.adicionais && it.adicionais.length > 0 && (
                            <ul className="ml-5 mt-1 text-xs text-muted-foreground">
                              {it.adicionais.map((a) => (
                                <li key={a.id}>+ {a.nome} ({formatBRL(a.preco)})</li>
                              ))}
                            </ul>
                          )}
                          {it.observacao && (
                            <p className="ml-5 mt-1 text-xs text-muted-foreground italic flex items-start gap-1">
                              <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" /> {it.observacao}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>

                  {pedido.observacao_geral && (
                    <>
                      <Separator />
                      <section className="space-y-1">
                        <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Observação</h3>
                        <p className="text-sm">{pedido.observacao_geral}</p>
                      </section>
                    </>
                  )}

                  <Separator />

                  {/* Totais */}
                  <section className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatBRL(pedido.valor_subtotal)}</span>
                    </div>
                    {pedido.valor_entrega > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Taxa de entrega</span>
                        <span>{formatBRL(pedido.valor_entrega)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-base pt-1">
                      <span>Total</span>
                      <span>{formatBRL(pedido.valor_total)}</span>
                    </div>
                  </section>

                  <Separator />

                  <PagamentosPedido pedidoId={pedido.id} totalPedido={pedido.valor_total} />
                </div>
              </ScrollArea>

              {/* Ações */}
              <div className="border-t border-border p-4 space-y-2 bg-muted/20">
                {next && podeEditar && !isFinalizado && (
                  <Button
                    className="w-full"
                    onClick={() => avancar.mutate(next)}
                    disabled={avancar.isPending}
                  >
                    Avançar para {next} <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <PermissionGate action="priorizar_pedido">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => priorizar.mutate(!pedido.prioridade_manual)}
                      disabled={priorizar.isPending || isFinalizado}
                    >
                      <Star className={`h-4 w-4 mr-1 ${pedido.prioridade_manual ? "fill-warning text-warning" : ""}`} />
                      {pedido.prioridade_manual ? "Despriorizar" : "Priorizar"}
                    </Button>
                  </PermissionGate>

                  <PermissionGate action="reimprimir_pedido">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => reimprimir.mutate()}
                      disabled={reimprimir.isPending}
                    >
                      <Printer className="h-4 w-4 mr-1" /> Reimprimir
                    </Button>
                  </PermissionGate>
                </div>

                {podeCancelar && !isFinalizado && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setConfirmCancelOpen(true)}
                  >
                    <XCircle className="h-4 w-4 mr-1" /> Cancelar pedido
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Modal de cancelamento com motivo */}
      <Dialog open={confirmCancelOpen} onOpenChange={(v) => { setConfirmCancelOpen(v); if (!v) setMotivo(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar pedido</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Informe o motivo do cancelamento.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo</Label>
            <Textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex.: Cliente desistiu, falta de ingrediente, endereço fora da área..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmCancelOpen(false)}>Voltar</Button>
            <Button
              variant="destructive"
              disabled={motivo.trim().length < 3 || cancelar.isPending}
              onClick={() => cancelar.mutate()}
            >
              Cancelar pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
