import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSkeleton } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { produtosService } from "@/services/produtos.service";
import { formatBRL } from "@/lib/formatters";
import { Package } from "lucide-react";
import { toast } from "sonner";

export default function Produtos() {
  const qc = useQueryClient();
  const [busca, setBusca] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["produtos", busca],
    queryFn: () => produtosService.listar(busca),
  });

  return (
    <>
      <PageHeader title="Produtos" description="Catálogo do Espaco" />
      <div className="mb-4">
        <Input placeholder="Buscar por nome..." value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      {isLoading && <LoadingSkeleton rows={4} />}
      {data?.data && data.data.length === 0 && (
        <EmptyState title="Nenhum produto cadastrado" icon={<Package className="h-6 w-6" />} />
      )}

      <div className="space-y-2">
        {data?.data?.map((p) => (
          <Card key={p.id} className="p-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium">{p.nome}</h3>
                  <Badge variant="outline" className="text-xs">{p.categoria_nome}</Badge>
                  {p.exige_escolha_obrigatoria && <Badge variant="secondary" className="text-xs">Escolha obrigatória</Badge>}
                </div>
                <p className="text-sm text-muted-foreground truncate mt-0.5">{p.descricao}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatBRL(p.preco_base)}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{p.disponivel ? "Disponível" : "Indisponível"}</span>
                  <Switch
                    checked={p.disponivel}
                    onCheckedChange={async (v) => {
                      await produtosService.toggleDisponibilidade(p.id, v);
                      qc.invalidateQueries({ queryKey: ["produtos"] });
                      toast.success(v ? "Produto disponível" : "Produto indisponível");
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
