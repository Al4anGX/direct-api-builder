import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSkeleton } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { produtosService } from "@/services/produtos.service";
import { formatBRL } from "@/lib/formatters";
import { Package, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PermissionGate } from "@/components/common/PermissionGate";
import { ProdutoFormDialog } from "./ProdutoFormDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import type { Produto } from "@/types/domain";
import { usePermission } from "@/hooks/useAuth";

export default function Produtos() {
  const qc = useQueryClient();
  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Produto | null>(null);
  const [excluirAlvo, setExcluirAlvo] = useState<Produto | null>(null);

  const podeGerenciar = usePermission("gerenciar_produtos");

  const { data, isLoading } = useQuery({
    queryKey: ["produtos", busca, categoriaFiltro],
    queryFn: () => produtosService.listar(busca, categoriaFiltro),
  });

  const { data: catsResp } = useQuery({
    queryKey: ["categorias"],
    queryFn: () => produtosService.listarCategorias(),
  });
  const categorias = catsResp?.data ?? [];

  const refresh = () => qc.invalidateQueries({ queryKey: ["produtos"] });

  function abrirNovo() {
    setEditing(null);
    setFormOpen(true);
  }
  function abrirEditar(p: Produto) {
    setEditing(p);
    setFormOpen(true);
  }

  async function confirmarExcluir() {
    if (!excluirAlvo) return;
    const r = await produtosService.excluir(excluirAlvo.id);
    if (r.success) {
      toast.success("Produto excluído");
      refresh();
    }
    setExcluirAlvo(null);
  }

  return (
    <>
      <PageHeader
        title="Produtos"
        description="Catálogo do Espaco"
        actions={
          <PermissionGate action="gerenciar_produtos">
            <Button onClick={abrirNovo}>
              <Plus className="h-4 w-4 mr-1" /> Novo produto
            </Button>
          </PermissionGate>
        }
      />

      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Buscar por nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="flex-1"
        />
        <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
          <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas categorias</SelectItem>
            {categorias.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && <LoadingSkeleton rows={4} />}
      {data?.data && data.data.length === 0 && (
        <EmptyState title="Nenhum produto encontrado" icon={<Package className="h-6 w-6" />} />
      )}

      <div className="space-y-2">
        {data?.data?.map((p) => (
          <Card key={p.id} className={`p-4 ${!p.ativo ? "opacity-60" : ""}`}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium">{p.nome}</h3>
                  <Badge variant="outline" className="text-xs">{p.categoria_nome}</Badge>
                  {!p.ativo && <Badge variant="secondary" className="text-xs">Inativo</Badge>}
                  {p.exige_escolha_obrigatoria && <Badge variant="secondary" className="text-xs">Escolha obrigatória</Badge>}
                  {p.variacoes.length > 0 && <Badge variant="outline" className="text-xs">{p.variacoes.length} variações</Badge>}
                  {p.adicionais.length > 0 && <Badge variant="outline" className="text-xs">{p.adicionais.length} adicionais</Badge>}
                </div>
                {p.descricao && (
                  <p className="text-sm text-muted-foreground truncate mt-0.5">{p.descricao}</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatBRL(p.preco_base)}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{p.disponivel ? "Disponível" : "Indisponível"}</span>
                  <PermissionGate
                    action="alterar_disponibilidade_produto"
                    fallback={<Switch checked={p.disponivel} disabled />}
                  >
                    <Switch
                      checked={p.disponivel}
                      onCheckedChange={async (v) => {
                        await produtosService.toggleDisponibilidade(p.id, v);
                        refresh();
                        toast.success(v ? "Produto disponível" : "Produto indisponível");
                      }}
                    />
                  </PermissionGate>
                </div>
              </div>
            </div>

            {podeGerenciar && (
              <div className="mt-3 pt-3 border-t flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => abrirEditar(p)}>
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setExcluirAlvo(p)}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      <ProdutoFormDialog
        produto={editing}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={refresh}
      />

      <ConfirmDialog
        open={!!excluirAlvo}
        onOpenChange={(v) => !v && setExcluirAlvo(null)}
        title="Excluir produto?"
        description={`O produto "${excluirAlvo?.nome}" será removido permanentemente.`}
        confirmText="Excluir"
        onConfirm={confirmarExcluir}
      />
    </>
  );
}
