import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSkeleton } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { clientesService } from "@/services/clientes.service";
import { formatBRL, formatTelefoneBR } from "@/lib/formatters";
import { Users } from "lucide-react";

export default function Clientes() {
  const [busca, setBusca] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["clientes", busca],
    queryFn: () => clientesService.listar(busca),
  });

  return (
    <>
      <PageHeader title="Clientes" description="Cadastro e histórico" />
      <div className="mb-4">
        <Input placeholder="Buscar por nome ou telefone..." value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      {isLoading && <LoadingSkeleton rows={4} />}
      {data?.data && data.data.length === 0 && <EmptyState title="Nenhum cliente" icon={<Users className="h-6 w-6" />} />}

      <div className="space-y-2">
        {data?.data?.map((c) => (
          <Card key={c.id} className="p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{c.nome}</h3>
                  {c.blacklist && <Badge variant="destructive" className="text-xs">Blacklist</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{formatTelefoneBR(c.telefone)}</p>
              </div>
              <div className="text-right text-sm">
                <p>{c.total_pedidos} pedidos</p>
                <p className="text-muted-foreground">Ticket médio {formatBRL(c.ticket_medio)}</p>
              </div>
            </div>
            {c.ultimos_pedidos.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-1">Últimos pedidos</p>
                <div className="space-y-0.5 text-sm">
                  {c.ultimos_pedidos.map((p) => (
                    <div key={p.id} className="flex justify-between text-xs">
                      <span>#{p.numero} · {p.status}</span>
                      <span className="text-muted-foreground">{formatBRL(p.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
