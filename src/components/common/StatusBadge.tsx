import { cn } from "@/lib/utils";
import type { StatusPedido } from "@/types/domain";

const map: Record<StatusPedido, { label: string; bg: string; fg: string }> = {
  "Rascunho": { label: "Rascunho", bg: "bg-status-rascunho/10", fg: "text-status-rascunho" },
  "Em analise": { label: "Em análise", bg: "bg-status-em-analise/15", fg: "text-status-em-analise" },
  "Em producao": { label: "Em produção", bg: "bg-status-em-producao/15", fg: "text-status-em-producao" },
  "Pronto": { label: "Pronto", bg: "bg-status-pronto/15", fg: "text-status-pronto" },
  "Saiu para entrega": { label: "Saiu p/ entrega", bg: "bg-status-saiu-entrega/15", fg: "text-status-saiu-entrega" },
  "Finalizado": { label: "Finalizado", bg: "bg-status-finalizado/15", fg: "text-status-finalizado" },
  "Cancelado": { label: "Cancelado", bg: "bg-status-cancelado/15", fg: "text-status-cancelado" },
};

export function StatusBadge({ status, className }: { status: StatusPedido; className?: string }) {
  const cfg = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", cfg.bg, cfg.fg, className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}
