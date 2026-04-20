import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSkeleton } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { comandasService } from "@/services/comandas.service";
import { formatBRL, formatTimeAgo } from "@/lib/formatters";
import { ClipboardList, Plus } from "lucide-react";
import { PermissionGate } from "@/components/common/PermissionGate";
import { AbrirComandaDialog } from "./AbrirComandaDialog";
import { ComandaDrawer } from "./ComandaDrawer";

export default function Comandas() {
  const qc = useQueryClient();
  const [abrirOpen, setAbrirOpen] = useState(false);
  const [selId, setSelId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["comandas"], queryFn: () => comandasService.listar() });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["comandas"] });
    if (selId) qc.invalidateQueries({ queryKey: ["comanda", selId] });
  };

  const abertas = data?.data?.filter((c) => c.status === "aberta") ?? [];

  return (
    <>
      <PageHeader
        title="Comandas"
        description="Comandas abertas no Espaco"
        actions={
          <PermissionGate action="abrir_comanda">
            <Button onClick={() => setAbrirOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Nova comanda
            </Button>
          </PermissionGate>
        }
      />

      {isLoading && <LoadingSkeleton rows={3} />}
      {!isLoading && abertas.length === 0 && (
        <EmptyState title="Nenhuma comanda aberta" icon={<ClipboardList className="h-6 w-6" />} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {abertas.map((c) => (
          <Card
            key={c.id}
            className="p-4 cursor-pointer hover:border-primary transition-colors"
            onClick={() => setSelId(c.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{c.referencia_mesa_livre}</h3>
              <Badge variant="default">{c.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Aberta há {formatTimeAgo(c.abertura_em)} · {c.itens.length} itens
            </p>
            <div className="space-y-1 mb-3 text-sm">
              {c.itens.slice(0, 3).map((i) => (
                <div key={i.id} className="flex justify-between">
                  <span className="truncate">{i.quantidade}× {i.produto_nome}</span>
                  <span className="text-muted-foreground">{formatBRL(i.preco_unitario * i.quantidade)}</span>
                </div>
              ))}
              {c.itens.length > 3 && <p className="text-xs text-muted-foreground">+ {c.itens.length - 3} itens</p>}
              {c.itens.length === 0 && <p className="text-xs text-muted-foreground italic">Sem itens — clique para adicionar</p>}
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-semibold">{formatBRL(c.total_atual)}</span>
            </div>
          </Card>
        ))}
      </div>

      <AbrirComandaDialog
        open={abrirOpen}
        onOpenChange={setAbrirOpen}
        onCreated={refresh}
      />

      <ComandaDrawer
        comandaId={selId}
        onOpenChange={(v) => !v && setSelId(null)}
        onChanged={refresh}
      />
    </>
  );
}
