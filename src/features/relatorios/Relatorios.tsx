import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/common/LoadingState";
import { relatoriosService } from "@/services/relatorios.service";
import { formatBRL } from "@/lib/formatters";
import { DollarSign, ShoppingBag, Clock, TrendingUp } from "lucide-react";

export default function Relatorios() {
  const { data, isLoading } = useQuery({ queryKey: ["relatorios"], queryFn: () => relatoriosService.kpis() });
  if (isLoading || !data?.data) return <LoadingState />;
  const k = data.data;

  return (
    <>
      <PageHeader title="Relatórios" description="KPIs, metas e alertas" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Vendas" value={formatBRL(k.vendas_total)} icon={DollarSign} />
        <KpiCard label="Pedidos" value={k.pedidos_total} icon={ShoppingBag} />
        <KpiCard label="Ticket médio" value={formatBRL(k.ticket_medio)} icon={TrendingUp} />
        <KpiCard label="Tempo médio" value={`${k.tempo_medio_total_min}min`} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Pedidos por canal</h3>
          {Object.entries(k.pedidos_por_canal).map(([canal, n]) => (
            <div key={canal} className="flex items-center justify-between text-sm py-1">
              <span className="capitalize text-muted-foreground">{canal}</span>
              <span className="font-medium">{n}</span>
            </div>
          ))}
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Metas (placeholder)</h3>
          <div className="space-y-3 text-sm">
            <MetaRow label="Vendas diárias" atual={k.vendas_total} meta={5000} />
            <MetaRow label="Pedidos do dia" atual={k.pedidos_total} meta={100} />
            <MetaRow label="Ticket médio" atual={k.ticket_medio} meta={55} />
          </div>
        </Card>
      </div>
    </>
  );
}

function MetaRow({ label, atual, meta }: { label: string; atual: number; meta: number }) {
  const pct = Math.min(100, Math.round((atual / meta) * 100));
  const cor = pct >= 100 ? "bg-success" : pct >= 70 ? "bg-warning" : "bg-destructive";
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span>{label}</span>
        <span className="text-muted-foreground">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${cor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
