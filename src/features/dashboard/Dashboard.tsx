import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { relatoriosService } from "@/services/relatorios.service";
import { formatBRL } from "@/lib/formatters";
import { ShoppingBag, DollarSign, Clock, TrendingUp, Truck, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard-kpis"],
    queryFn: () => relatoriosService.kpis(),
  });

  if (isLoading) return <LoadingState />;
  if (isError || !data?.data) return <ErrorState onRetry={() => refetch()} />;

  const k = data.data;

  return (
    <>
      <PageHeader title="Dashboard" description="Visão operacional do Espaco em tempo real" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Vendas hoje" value={formatBRL(k.vendas_total)} icon={DollarSign} delta={{ value: 12, positive: true }} hint="vs ontem" />
        <KpiCard label="Pedidos" value={k.pedidos_total} icon={ShoppingBag} delta={{ value: 8, positive: true }} hint="vs ontem" />
        <KpiCard label="Ticket médio" value={formatBRL(k.ticket_medio)} icon={TrendingUp} />
        <KpiCard label="Tempo médio" value={`${k.tempo_medio_total_min}min`} icon={Clock} hint={`preparo ${k.tempo_medio_preparo_min}min`} />
        <KpiCard label="Receita entrega" value={formatBRL(k.receita_entrega)} icon={Truck} />
        <KpiCard label="Cancelamentos" value={`${k.taxa_cancelamento}%`} icon={XCircle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Pedidos por status</h3>
          <div className="space-y-2">
            {Object.entries(k.pedidos_por_status).map(([s, n]) => (
              <div key={s} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{s}</span>
                <span className="font-medium">{n}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Top produtos</h3>
          <div className="space-y-2">
            {k.top_produtos.map((p) => (
              <div key={p.nome} className="flex items-center justify-between text-sm">
                <span>{p.nome}</span>
                <span className="text-muted-foreground">{p.quantidade}× · {formatBRL(p.receita)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
