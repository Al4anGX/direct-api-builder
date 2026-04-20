import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSkeleton } from "@/components/common/LoadingState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { whatsappService } from "@/services/whatsapp.service";
import { formatTelefoneBR, formatTimeAgo } from "@/lib/formatters";
import { MessageCircle, RotateCw, PowerOff, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PermissionGate } from "@/components/common/PermissionGate";

export default function WhatsApp() {
  const qc = useQueryClient();
  const { data: inst, isLoading } = useQuery({
    queryKey: ["wa-instancia"],
    queryFn: () => whatsappService.obterInstancia(),
    refetchInterval: 3000,
  });
  const { data: convs } = useQuery({ queryKey: ["wa-conversas"], queryFn: () => whatsappService.listarConversas() });

  const status = inst?.data?.status ?? "disconnected";
  const statusCfg = {
    connected: { label: "Conectado", color: "bg-wa-connected", text: "text-wa-connected" },
    connecting: { label: "Conectando...", color: "bg-wa-connecting animate-pulse", text: "text-wa-connecting" },
    disconnected: { label: "Desconectado", color: "bg-wa-disconnected", text: "text-wa-disconnected" },
  }[status];

  return (
    <>
      <PageHeader title="WhatsApp" description="Instância e conversas com agente IA" />

      {isLoading && <LoadingSkeleton rows={2} />}

      {inst?.data && (
        <Card className="p-4 mb-6">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-wa-connected/10 flex items-center justify-center text-wa-connected">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">{formatTelefoneBR(inst.data.numero)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn("h-2 w-2 rounded-full", statusCfg.color)} />
                  <span className={cn("text-sm font-medium", statusCfg.text)}>{statusCfg.label}</span>
                  {inst.data.ultima_conexao && (
                    <span className="text-xs text-muted-foreground">· última conexão há {formatTimeAgo(inst.data.ultima_conexao)}</span>
                  )}
                </div>
              </div>
            </div>
            <PermissionGate action="configurar_whatsapp">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={async () => {
                  await whatsappService.reconectar(inst.data!.id);
                  qc.invalidateQueries({ queryKey: ["wa-instancia"] });
                  toast.success("Reconectando...");
                }}>
                  <RotateCw className="h-4 w-4 mr-1" /> Reconectar
                </Button>
                <Button variant="ghost" size="sm" onClick={async () => {
                  await whatsappService.desconectar(inst.data!.id);
                  qc.invalidateQueries({ queryKey: ["wa-instancia"] });
                }}>
                  <PowerOff className="h-4 w-4 mr-1" /> Desconectar
                </Button>
              </div>
            </PermissionGate>
          </div>
        </Card>
      )}

      <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" /> Conversas com IA
      </h2>
      <div className="space-y-2">
        {convs?.data?.map((c) => (
          <Card key={c.id} className="p-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium">{c.cliente_nome}</p>
                  <span className="text-xs text-muted-foreground">{formatTelefoneBR(c.numero_cliente)}</span>
                  {c.nao_lidas > 0 && <span className="rounded-full bg-primary text-primary-foreground text-xs px-2">{c.nao_lidas}</span>}
                </div>
                <p className="text-sm text-muted-foreground truncate mt-0.5">{c.ultima_mensagem}</p>
                <p className="text-xs text-muted-foreground mt-0.5">há {formatTimeAgo(c.ultima_em)}</p>
              </div>
              <PermissionGate action="pausar_ia_conversa">
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-medium", c.ia_status === "ativa" ? "text-success" : "text-warning")}>
                      IA {c.ia_status}
                    </span>
                    <Switch
                      checked={c.ia_status === "ativa"}
                      onCheckedChange={async (v) => {
                        await whatsappService.toggleIA(c.id, v ? "ativa" : "pausada");
                        qc.invalidateQueries({ queryKey: ["wa-conversas"] });
                      }}
                    />
                  </div>
                  {c.ia_status === "pausada" && c.pausada_motivo && (
                    <span className="text-xs text-muted-foreground italic">{c.pausada_motivo}</span>
                  )}
                </div>
              </PermissionGate>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
