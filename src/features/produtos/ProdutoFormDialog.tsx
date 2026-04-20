import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { produtosService } from "@/services/produtos.service";
import { toast } from "sonner";
import type { Produto, Variacao, Adicional } from "@/types/domain";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  produto: Produto | null; // null = criar
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}

const blank = (): Partial<Produto> => ({
  nome: "",
  descricao: "",
  preco_base: 0,
  categoria_id: "",
  ativo: true,
  disponivel: true,
  exige_escolha_obrigatoria: false,
  variacoes: [],
  adicionais: [],
  fotos: [],
});

export function ProdutoFormDialog({ produto, open, onOpenChange, onSaved }: Props) {
  const { data: catsResp } = useQuery({
    queryKey: ["categorias"],
    queryFn: () => produtosService.listarCategorias(),
  });
  const categorias = catsResp?.data ?? [];

  const [form, setForm] = useState<Partial<Produto>>(blank());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(produto ? { ...produto } : blank());
    }
  }, [produto, open]);

  const setField = <K extends keyof Produto>(k: K, v: Produto[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Variações
  const addVariacao = () => {
    const nova: Variacao = { id: `v${Date.now()}`, nome: "", preco_extra: 0 };
    setField("variacoes", [...(form.variacoes ?? []), nova]);
  };
  const updateVariacao = (id: string, patch: Partial<Variacao>) => {
    setField("variacoes", (form.variacoes ?? []).map((v) => (v.id === id ? { ...v, ...patch } : v)));
  };
  const removeVariacao = (id: string) => {
    setField("variacoes", (form.variacoes ?? []).filter((v) => v.id !== id));
  };

  // Adicionais
  const addAdicional = () => {
    const novo: Adicional = { id: `a${Date.now()}`, nome: "", preco: 0 };
    setField("adicionais", [...(form.adicionais ?? []), novo]);
  };
  const updateAdicional = (id: string, patch: Partial<Adicional>) => {
    setField("adicionais", (form.adicionais ?? []).map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };
  const removeAdicional = (id: string) => {
    setField("adicionais", (form.adicionais ?? []).filter((a) => a.id !== id));
  };

  async function salvar() {
    if (!form.nome || form.nome.trim().length < 2) {
      toast.error("Informe o nome do produto");
      return;
    }
    if (!form.categoria_id) {
      toast.error("Selecione uma categoria");
      return;
    }
    if ((form.preco_base ?? 0) < 0) {
      toast.error("Preço inválido");
      return;
    }
    if ((form.variacoes ?? []).some((v) => !v.nome.trim())) {
      toast.error("Toda variação precisa de nome");
      return;
    }
    if ((form.adicionais ?? []).some((a) => !a.nome.trim())) {
      toast.error("Todo adicional precisa de nome");
      return;
    }

    setSaving(true);
    const res = await produtosService.salvar({ ...form, id: produto?.id });
    setSaving(false);
    if (res.success) {
      toast.success(produto ? "Produto atualizado" : "Produto criado");
      onOpenChange(false);
      onSaved();
    } else {
      toast.error("Erro ao salvar produto");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{produto ? "Editar produto" : "Novo produto"}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basico" className="mt-2">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="basico">Básico</TabsTrigger>
            <TabsTrigger value="variacoes">Variações ({(form.variacoes ?? []).length})</TabsTrigger>
            <TabsTrigger value="adicionais">Adicionais ({(form.adicionais ?? []).length})</TabsTrigger>
          </TabsList>

          <TabsContent value="basico" className="space-y-3 pt-3">
            <div>
              <Label>Nome</Label>
              <Input value={form.nome ?? ""} onChange={(e) => setField("nome", e.target.value)} />
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                value={form.descricao ?? ""}
                onChange={(e) => setField("descricao", e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Categoria</Label>
                <Select
                  value={form.categoria_id ?? ""}
                  onValueChange={(v) => setField("categoria_id", v)}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {categorias.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Preço base (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={form.preco_base ?? 0}
                  onChange={(e) => setField("preco_base", Number(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="ativo" className="cursor-pointer">Ativo no catálogo</Label>
                <Switch
                  id="ativo"
                  checked={form.ativo ?? true}
                  onCheckedChange={(v) => setField("ativo", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="disp" className="cursor-pointer">Disponível agora</Label>
                <Switch
                  id="disp"
                  checked={form.disponivel ?? true}
                  onCheckedChange={(v) => setField("disponivel", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="obr" className="cursor-pointer text-sm">
                  Exige escolha obrigatória de variação
                </Label>
                <Switch
                  id="obr"
                  checked={form.exige_escolha_obrigatoria ?? false}
                  onCheckedChange={(v) => setField("exige_escolha_obrigatoria", v)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="variacoes" className="pt-3 space-y-2">
            <p className="text-xs text-muted-foreground">
              Ex.: tamanhos, sabores. O cliente escolhe uma; o preço extra é somado ao preço base.
            </p>
            {(form.variacoes ?? []).map((v) => (
              <div key={v.id} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label className="text-xs">Nome</Label>
                  <Input value={v.nome} onChange={(e) => updateVariacao(v.id, { nome: e.target.value })} />
                </div>
                <div className="w-28">
                  <Label className="text-xs">Preço extra</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={v.preco_extra}
                    onChange={(e) => updateVariacao(v.id, { preco_extra: Number(e.target.value) || 0 })}
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeVariacao(v.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addVariacao} className="w-full">
              <Plus className="h-4 w-4 mr-1" /> Adicionar variação
            </Button>
          </TabsContent>

          <TabsContent value="adicionais" className="pt-3 space-y-2">
            <p className="text-xs text-muted-foreground">
              Ex.: bacon, queijo extra. O cliente pode escolher quantos quiser; cada um soma o seu preço.
            </p>
            {(form.adicionais ?? []).map((a) => (
              <div key={a.id} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label className="text-xs">Nome</Label>
                  <Input value={a.nome} onChange={(e) => updateAdicional(a.id, { nome: e.target.value })} />
                </div>
                <div className="w-28">
                  <Label className="text-xs">Preço</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={a.preco}
                    onChange={(e) => updateAdicional(a.id, { preco: Number(e.target.value) || 0 })}
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeAdicional(a.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addAdicional} className="w-full">
              <Plus className="h-4 w-4 mr-1" /> Adicionar adicional
            </Button>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={salvar} disabled={saving}>
            {saving ? "Salvando..." : "Salvar produto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
