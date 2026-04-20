import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatBRL, formatTimeAgo } from "@/lib/formatters";
import type { Comanda } from "@/types/domain";
import { comandasService } from "@/services/comandas.service";
import { produtosService } from "@/services/produtos.service";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PermissionGate } from "@/components/common/PermissionGate";
import { FecharComandaDialog } from "./FecharComandaDialog";

interface Props {
  comandaId: string | null;
  onOpenChange: (v: boolean) => void;
  onChanged: () => void;
}

export function ComandaDrawer({ comandaId, onOpenChange, onChanged }: Props) {
  const [busca, setBusca] = useState("");
  const [fecharOpen, setFecharOpen] = useState(false);

  const { data: comandaResp, refetch } = useQuery({
    queryKey: ["comanda", comandaId],
    queryFn: () => comandasService.obter(comandaId!),
    enabled: !!comandaId,
  });

  const { data: produtosResp } = useQuery({
    queryKey: ["produtos", busca],
    queryFn: () => produtosService.listar(busca),
    enabled: !!comandaId && busca.length > 0,
  });

  const comanda = comandaResp?.data as Comanda | null | undefined;

  async function adicionar(p: { id: string; nome: string; preco_base: number }) {
    if (!comanda) return;
    const r = await comandasService.adicionarItem(comanda.id, {
      produto_id: p.id,
      produto_nome: p.nome,
      quantidade: 1,
      preco_unitario: p.preco_base,
    });
    if (r.success) {
      toast.success(`${p.nome} adicionado`);
      setBusca("");
      refetch();
      onChanged();
    }
  }

  async function remover(itemId: string) {
    if (!comanda) return;
    const r = await comandasService.removerItem(comanda.id, itemId);
    if (r.success) {
      refetch();
      onChanged();
    }
  }

  return (
    <>
      <Sheet open={!!comandaId} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {comanda && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between gap-2">
                  <span>{comanda.referencia_mesa_livre}</span>
                  <Badge variant={comanda.status === "aberta" ? "default" : "secondary"}>{comanda.status}</Badge>
                </SheetTitle>
              </SheetHeader>

              <p className="text-xs text-muted-foreground mt-1">
                Aberta há {formatTimeAgo(comanda.abertura_em)}
              </p>

              {comanda.status === "aberta" && (
                <PermissionGate action="adicionar_item_comanda">
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Adicionar item</p>
                    <Input
                      placeholder="Buscar produto..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                    />
                    {busca && produtosResp?.data && (
                      <div className="mt-2 border rounded-md max-h-48 overflow-y-auto divide-y">
                        {produtosResp.data.length === 0 && (
                          <p className="p-3 text-xs text-muted-foreground">Nenhum produto encontrado</p>
                        )}
                        {produtosResp.data.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => adicionar(p)}
                            className="w-full flex items-center justify-between p-2 hover:bg-accent text-left text-sm"
                          >
                            <div>
                              <p className="font-medium">{p.nome}</p>
                              <p className="text-xs text-muted-foreground">{p.categoria_nome}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs">{formatBRL(p.preco_base)}</span>
                              <Plus className="h-4 w-4" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </PermissionGate>
              )}

              <Separator className="my-4" />

              <div>
                <p className="text-sm font-medium mb-2">Itens ({comanda.itens.length})</p>
                {comanda.itens.length === 0 && (
                  <p className="text-xs text-muted-foreground">Nenhum item adicionado ainda</p>
                )}
                <div className="space-y-1">
                  {comanda.itens.map((i) => (
                    <div key={i.id} className="flex items-center justify-between gap-2 py-1.5 border-b last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{i.quantidade}× {i.produto_nome}</p>
                      </div>
                      <span className="text-sm tabular-nums">{formatBRL(i.preco_unitario * i.quantidade)}</span>
                      {comanda.status === "aberta" && (
                        <PermissionGate action="adicionar_item_comanda">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remover(i.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </PermissionGate>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-lg font-semibold">{formatBRL(comanda.total_atual)}</span>
              </div>

              {comanda.status === "aberta" && (
                <PermissionGate action="fechar_comanda">
                  <Button
                    className="w-full mt-4"
                    onClick={() => setFecharOpen(true)}
                    disabled={comanda.itens.length === 0}
                  >
                    Fechar comanda
                  </Button>
                </PermissionGate>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      {comanda && (
        <FecharComandaDialog
          comanda={comanda}
          open={fecharOpen}
          onOpenChange={setFecharOpen}
          onClosed={() => {
            onChanged();
            onOpenChange(false);
          }}
        />
      )}
    </>
  );
}
