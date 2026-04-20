import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSkeleton } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { entregasService } from "@/services/entregas.service";
import { formatBRL } from "@/lib/formatters";
import { Truck } from "lucide-react";
import { PermissionGate } from "@/components/common/PermissionGate";
import { toast } from "sonner";

export default function Entregas() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["entregas"], queryFn: () => entregasService.listar() });
  const { data: ents } = useQuery({ queryKey: ["entregadores"], queryFn: () => entregasService.listarEntregadores() });

  return (
    <>
      <PageHeader title="Entregas" description="Atribuição e acompanhamento" />
      {isLoading && <LoadingSkeleton rows={3} />}
      {data?.data && data.data.length === 0 && <EmptyState title="Nenhuma entrega" icon={<Truck className="h-6 w-6" />} />}

      <div className="space-y-2">
        {data?.data?.map((e) => (
          <Card key={e.id} className="p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">#{e.pedido_numero}</span>
                  <Badge variant="outline">{e.status}</Badge>
                </div>
                <p className="text-sm mt-1">{e.cliente_nome}</p>
                <p className="text-xs text-muted-foreground">{e.endereco} · {e.bairro}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Taxa {formatBRL(e.taxa_entrega)}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t flex items-center gap-2 flex-wrap">
              <PermissionGate action="atribuir_entregador">
                <Select
                  value={e.entregador_id ?? ""}
                  onValueChange={async (v) => {
                    await entregasService.atribuir(e.id, v);
                    qc.invalidateQueries({ queryKey: ["entregas"] });
                    toast.success("Entregador atribuído");
                  }}
                >
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Atribuir entregador" />
                  </SelectTrigger>
                  <SelectContent>
                    {ents?.data?.map((en) => (
                      <SelectItem key={en.id} value={en.id}>{en.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </PermissionGate>
              {e.status === "saiu" && (
                <Button size="sm" variant="outline" onClick={async () => {
                  await entregasService.alterarStatus(e.id, "entregue");
                  qc.invalidateQueries({ queryKey: ["entregas"] });
                  toast.success("Entrega concluída");
                }}>Marcar entregue</Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
