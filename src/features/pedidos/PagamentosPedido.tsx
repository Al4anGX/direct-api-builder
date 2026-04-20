import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSkeleton } from "@/components/common/LoadingState";
import { PermissionGate } from "@/components/common/PermissionGate";
import { pagamentosService, type MetodoPagamento, type Pagamento } from "@/services/pagamentos.service";
import { chavePixService } from "@/services/chavePix.service";
import { useAuth } from "@/hooks/useAuth";
import { can } from "@/lib/permissions";
import { formatBRL, formatDateTimeBR } from "@/lib/formatters";
import { toast } from "sonner";
import { CheckCircle2, RotateCcw, Plus, Copy, Banknote, CreditCard, QrCode } from "lucide-react";

interface Props {
  pedidoId: string;
  totalPedido: number;
}

const METODOS: { value: MetodoPagamento; label: string; icon: typeof QrCode }[] = [
  { value: "pix", label: "PIX", icon: QrCode },
  { value: "dinheiro", label: "Dinheiro", icon: Banknote },
  { value: "credito", label: "Crédito", icon: CreditCard },
  { value: "debito", label: "Débito", icon: CreditCard },
];

export function PagamentosPedido({ pedidoId, totalPedido }: Props) {
  const qc = useQueryClient();
  const { espaco, activeRole } = useAuth();
  const podeEstornar = can(activeRole, "estornar_pagamento");
  const podeRegistrar = can(activeRole, "conciliar_pagamento");

  const { data: pagsResp, isLoading } = useQuery({
    queryKey: ["pagamentos", pedidoId],
    queryFn: () => pagamentosService.listarPorPedido(pedidoId),
  });
  const pagamentos = pagsResp?.data ?? [];

  const { data: pixResp } = useQuery({
    queryKey: ["chave-pix", espaco?.id],
    queryFn: () => chavePixService.obter(espaco!.id),
    enabled: !!espaco?.id,
  });
  const chavePix = pixResp?.data ?? null;

  const totalPago = useMemo(
    () => pagamentos.filter(p => p.status === "aprovado").reduce((s, p) => s + Number(p.valor), 0),
    [pagamentos]
  );
  const restante = Math.max(0, totalPedido - totalPago);

  const [novoOpen, setNovoOpen] = useState(false);
  const [estornoAlvo, setEstornoAlvo] = useState<Pagamento | null>(null);

  const confirmar = useMutation({
    mutationFn: (id: string) => pagamentosService.confirmarRecebimento(id),
    onSuccess: () => { toast.success("Pagamento confirmado"); qc.invalidateQueries({ queryKey: ["pagamentos", pedidoId] }); },
    onError: () => toast.error("Não foi possível confirmar"),
  });

  function copiarChave() {
    if (!chavePix) return;
    navigator.clipboard.writeText(chavePix.chave);
    toast.success("Chave PIX copiada");
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Pagamentos</h3>
        <PermissionGate action="conciliar_pagamento">
          <Button size="sm" variant="outline" onClick={() => setNovoOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Registrar
          </Button>
        </PermissionGate>
      </div>

      {/* Resumo */}
      <div className="rounded-md border p-3 grid grid-cols-3 gap-2 text-center text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="font-semibold">{formatBRL(totalPedido)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Pago</p>
          <p className="font-semibold text-success">{formatBRL(totalPago)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Restante</p>
          <p className={`font-semibold ${restante > 0 ? "text-warning" : ""}`}>{formatBRL(restante)}</p>
        </div>
      </div>

      {/* Chave PIX do espaço (contexto rápido) */}
      {chavePix && (
        <div className="rounded-md bg-muted/40 p-3 text-xs space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium uppercase tracking-wide text-muted-foreground">Chave PIX do Espaco</span>
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={copiarChave}>
              <Copy className="h-3 w-3 mr-1" /> Copiar
            </Button>
          </div>
          <p><span className="text-muted-foreground">Tipo:</span> {chavePix.tipo.toUpperCase()}</p>
          <p className="break-all"><span className="text-muted-foreground">Chave:</span> {chavePix.chave}</p>
          <p><span className="text-muted-foreground">Recebedor:</span> {chavePix.nome_recebedor} · {chavePix.banco}</p>
        </div>
      )}

      {/* Lista */}
      {isLoading ? (
        <LoadingSkeleton rows={2} />
      ) : pagamentos.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">Nenhum pagamento registrado.</p>
      ) : (
        <ul className="space-y-2">
          {pagamentos.map((p) => (
            <li key={p.id} className="rounded-md border p-3 text-sm space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="uppercase text-[10px]">{p.metodo}</Badge>
                  <span className="font-medium">{formatBRL(Number(p.valor))}</span>
                  {p.troco != null && Number(p.troco) > 0 && (
                    <span className="text-xs text-muted-foreground">troco {formatBRL(Number(p.troco))}</span>
                  )}
                </div>
                <StatusPagBadge status={p.status} />
              </div>
              <p className="text-xs text-muted-foreground">
                Registrado em {formatDateTimeBR(p.criado_em)}
                {p.confirmado_em && ` · Confirmado em ${formatDateTimeBR(p.confirmado_em)}`}
              </p>
              {p.observacao && <p className="text-xs italic">{p.observacao}</p>}
              {p.status === "estornado" && p.motivo_estorno && (
                <p className="text-xs text-destructive">Estorno: {p.motivo_estorno}</p>
              )}

              <div className="flex gap-2 pt-1">
                {p.status === "pendente" && podeRegistrar && (
                  <Button size="sm" variant="outline" onClick={() => confirmar.mutate(p.id)} disabled={confirmar.isPending}>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Confirmar recebimento
                  </Button>
                )}
                {p.status === "aprovado" && podeEstornar && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setEstornoAlvo(p)}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Estornar
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <NovoPagamentoDialog
        open={novoOpen}
        onOpenChange={setNovoOpen}
        pedidoId={pedidoId}
        valorSugerido={restante > 0 ? restante : totalPedido}
        onCreated={() => qc.invalidateQueries({ queryKey: ["pagamentos", pedidoId] })}
      />
      <EstornoDialog
        pagamento={estornoAlvo}
        onOpenChange={(v) => !v && setEstornoAlvo(null)}
        onDone={() => qc.invalidateQueries({ queryKey: ["pagamentos", pedidoId] })}
      />
    </section>
  );
}

function StatusPagBadge({ status }: { status: Pagamento["status"] }) {
  const map = {
    pendente: { label: "Pendente", cls: "bg-warning/15 text-warning border-warning/30" },
    aprovado: { label: "Aprovado", cls: "bg-success/15 text-success border-success/30" },
    estornado: { label: "Estornado", cls: "bg-destructive/15 text-destructive border-destructive/30" },
  } as const;
  const it = map[status];
  return <Badge variant="outline" className={`text-[10px] ${it.cls}`}>{it.label}</Badge>;
}

function NovoPagamentoDialog({
  open, onOpenChange, pedidoId, valorSugerido, onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  pedidoId: string;
  valorSugerido: number;
  onCreated: () => void;
}) {
  const { espaco } = useAuth();
  const [metodo, setMetodo] = useState<MetodoPagamento>("pix");
  const [valor, setValor] = useState<number>(valorSugerido);
  const [troco, setTroco] = useState<number>(0);
  const [obs, setObs] = useState("");
  const [loading, setLoading] = useState(false);

  // sincroniza valor sugerido quando abre
  useMemo(() => { if (open) { setValor(valorSugerido); setTroco(0); setObs(""); setMetodo("pix"); } }, [open, valorSugerido]);

  async function salvar() {
    if (!espaco) return;
    if (valor <= 0) { toast.error("Informe um valor válido"); return; }
    setLoading(true);
    const res = await pagamentosService.registrar({
      espaco_id: espaco.id,
      pedido_id: pedidoId,
      metodo,
      valor,
      troco: metodo === "dinheiro" ? troco : null,
      observacao: obs.trim() || null,
    });
    setLoading(false);
    if (res.success) {
      toast.success(metodo === "pix" ? "PIX registrado como pendente" : "Pagamento registrado");
      onCreated();
      onOpenChange(false);
    } else {
      toast.error(res.error?.message ?? "Erro ao registrar");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar pagamento</DialogTitle>
          <DialogDescription>
            PIX entra como <strong>pendente</strong> até a conferência do comprovante. Demais métodos já entram aprovados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Método</Label>
            <div className="grid grid-cols-4 gap-2 mt-1.5">
              {METODOS.map((m) => {
                const Icon = m.icon;
                const ativo = metodo === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMetodo(m.value)}
                    className={`rounded-md border p-2 flex flex-col items-center gap-1 text-xs transition ${
                      ativo ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Valor (R$)</Label>
              <Input
                type="number" min={0} step="0.01"
                value={valor}
                onChange={(e) => setValor(Number(e.target.value) || 0)}
              />
            </div>
            {metodo === "dinheiro" && (
              <div>
                <Label>Troco (R$)</Label>
                <Input
                  type="number" min={0} step="0.01"
                  value={troco}
                  onChange={(e) => setTroco(Number(e.target.value) || 0)}
                />
              </div>
            )}
          </div>

          <div>
            <Label>Observação (opcional)</Label>
            <Textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder={metodo === "pix" ? "Ex.: Comprovante enviado pelo cliente às 14h" : ""}
              rows={2}
              maxLength={300}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={salvar} disabled={loading}>
            {loading ? "Registrando..." : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EstornoDialog({
  pagamento, onOpenChange, onDone,
}: {
  pagamento: Pagamento | null;
  onOpenChange: (v: boolean) => void;
  onDone: () => void;
}) {
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);

  async function confirmar() {
    if (!pagamento) return;
    if (motivo.trim().length < 3) { toast.error("Informe o motivo (mín. 3 caracteres)"); return; }
    setLoading(true);
    const res = await pagamentosService.estornar(pagamento.id, motivo.trim());
    setLoading(false);
    if (res.success) {
      toast.success("Pagamento estornado");
      onDone();
      setMotivo("");
      onOpenChange(false);
    } else {
      toast.error(res.error?.message ?? "Erro ao estornar");
    }
  }

  return (
    <Dialog open={!!pagamento} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Estornar pagamento</DialogTitle>
          <DialogDescription>Apenas administradores podem estornar. Informe o motivo para auditoria.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Motivo</Label>
          <Textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={3} maxLength={300} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Voltar</Button>
          <Button variant="destructive" onClick={confirmar} disabled={loading}>
            {loading ? "Estornando..." : "Confirmar estorno"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
