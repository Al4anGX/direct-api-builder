import { useState, useMemo } from "react";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LoadingSkeleton } from "@/components/common/LoadingState";
import { pedidosService } from "@/services/pedidos.service";
import { produtosService } from "@/services/produtos.service";
import { clientesService } from "@/services/clientes.service";
import { formatBRL, normalizeTelefone, formatTelefoneBR } from "@/lib/formatters";
import {
  ShoppingBag, ClipboardList, MessageCircle, Plus, Minus, Trash2,
  ArrowLeft, ArrowRight, Search, UserPlus, Check,
} from "lucide-react";
import { toast } from "sonner";
import type { CanalPedido, Produto, Cliente, PedidoItem } from "@/types/domain";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

type Etapa = "canal" | "cliente" | "itens" | "entrega" | "revisao";

const ORDEM: Etapa[] = ["canal", "cliente", "itens", "entrega", "revisao"];

const clienteRapidoSchema = z.object({
  nome: z.string().trim().min(2, "Nome muito curto").max(80, "Máximo 80 caracteres"),
  telefone: z.string()
    .transform(normalizeTelefone)
    .refine((v) => v.length >= 10 && v.length <= 13, "Telefone inválido (DDD + número)"),
});

const enderecoSchema = z.string().trim().min(5, "Endereço muito curto").max(200);

export function NovoPedidoWizard({ open, onOpenChange }: Props) {
  const qc = useQueryClient();
  const [etapa, setEtapa] = useState<Etapa>("canal");
  const [canal, setCanal] = useState<CanalPedido | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [novoNome, setNovoNome] = useState("");
  const [novoTel, setNovoTel] = useState("");
  const [buscaCli, setBuscaCli] = useState("");
  const [itens, setItens] = useState<PedidoItem[]>([]);
  const [buscaProd, setBuscaProd] = useState("");
  const [endereco, setEndereco] = useState("");
  const [taxa, setTaxa] = useState<string>("0");
  const [observacao, setObservacao] = useState("");

  const reset = () => {
    setEtapa("canal");
    setCanal(null); setCliente(null);
    setNovoNome(""); setNovoTel(""); setBuscaCli("");
    setItens([]); setBuscaProd("");
    setEndereco(""); setTaxa("0"); setObservacao("");
  };

  const fechar = (v: boolean) => {
    onOpenChange(v);
    if (!v) setTimeout(reset, 200);
  };

  const { data: prodData, isLoading: loadingProd } = useQuery({
    queryKey: ["produtos-wizard", buscaProd],
    queryFn: () => produtosService.listar(buscaProd),
    enabled: etapa === "itens",
  });

  const { data: cliData, isLoading: loadingCli } = useQuery({
    queryKey: ["clientes-wizard", buscaCli],
    queryFn: () => clientesService.listar(buscaCli),
    enabled: etapa === "cliente",
  });

  const subtotal = useMemo(
    () => itens.reduce(
      (s, it) => s + (it.preco_unitario * it.quantidade) +
        (it.adicionais?.reduce((a, ad) => a + ad.preco, 0) ?? 0) * it.quantidade,
      0
    ),
    [itens]
  );
  const taxaNum = Number(taxa.replace(",", ".")) || 0;
  const total = subtotal + taxaNum;

  const ehDelivery = canal === "whatsapp";

  const criar = useMutation({
    mutationFn: (enviar: boolean) => pedidosService.criar({
      canal: canal!,
      cliente_id: cliente?.id ?? null,
      cliente_nome: cliente!.nome,
      cliente_telefone: cliente!.telefone,
      itens,
      valor_entrega: ehDelivery ? taxaNum : 0,
      endereco_entrega: ehDelivery ? endereco : undefined,
      observacao_geral: observacao.trim() || undefined,
      enviar_para_producao: enviar,
    }),
    onSuccess: (resp, enviar) => {
      toast.success(enviar
        ? `Pedido #${resp.data?.numero_pedido} enviado para produção`
        : `Rascunho #${resp.data?.numero_pedido} salvo`);
      qc.invalidateQueries({ queryKey: ["pedidos"] });
      fechar(false);
    },
    onError: () => toast.error("Não foi possível criar o pedido"),
  });

  // Validação por etapa
  const podeAvancar = (() => {
    if (etapa === "canal") return !!canal;
    if (etapa === "cliente") return !!cliente;
    if (etapa === "itens") return itens.length > 0;
    if (etapa === "entrega") {
      if (!ehDelivery) return true;
      return enderecoSchema.safeParse(endereco).success && taxaNum >= 0;
    }
    return true;
  })();

  const idxAtual = ORDEM.indexOf(etapa);
  const proxima = () => setEtapa(ORDEM[Math.min(ORDEM.length - 1, idxAtual + 1)]);
  const anterior = () => setEtapa(ORDEM[Math.max(0, idxAtual - 1)]);

  const adicionarProduto = (p: Produto) => {
    setItens((prev) => {
      const ex = prev.find((it) => it.produto_id === p.id);
      if (ex) return prev.map((it) => it === ex ? { ...it, quantidade: it.quantidade + 1 } : it);
      return [...prev, {
        id: `tmp${Date.now()}-${p.id}`,
        produto_id: p.id,
        produto_nome: p.nome,
        quantidade: 1,
        preco_unitario: p.preco_base,
      }];
    });
  };
  const ajustarQtd = (id: string, delta: number) =>
    setItens((prev) => prev
      .map((it) => it.id === id ? { ...it, quantidade: it.quantidade + delta } : it)
      .filter((it) => it.quantidade > 0)
    );
  const removerItem = (id: string) => setItens((prev) => prev.filter((it) => it.id !== id));

  const criarCliente = useMutation({
    mutationFn: () => clientesService.criarRapido({ nome: novoNome, telefone: novoTel }),
    onSuccess: (r) => {
      if (r.data) { setCliente(r.data); toast.success("Cliente cadastrado"); }
    },
    onError: () => toast.error("Falha ao cadastrar cliente"),
  });

  const submitNovoCliente = () => {
    const parsed = clienteRapidoSchema.safeParse({ nome: novoNome, telefone: novoTel });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    criarCliente.mutate();
  };

  return (
    <Sheet open={open} onOpenChange={fechar}>
      <SheetContent className="w-full sm:max-w-2xl p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b border-border">
          <SheetTitle>Novo pedido</SheetTitle>
          <SheetDescription>
            Etapa {idxAtual + 1} de {ORDEM.length} — {etapa === "canal" && "escolha o canal"}
            {etapa === "cliente" && "selecione o cliente"}
            {etapa === "itens" && "monte o pedido"}
            {etapa === "entrega" && (ehDelivery ? "endereço e taxa" : "observações")}
            {etapa === "revisao" && "revisar e confirmar"}
          </SheetDescription>
          <Stepper etapa={etapa} />
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-6">
            {etapa === "canal" && <EtapaCanal canal={canal} onChange={setCanal} />}

            {etapa === "cliente" && (
              <EtapaCliente
                buscaCli={buscaCli} setBuscaCli={setBuscaCli}
                clientes={cliData?.data ?? []} loading={loadingCli}
                cliente={cliente} setCliente={setCliente}
                novoNome={novoNome} setNovoNome={setNovoNome}
                novoTel={novoTel} setNovoTel={setNovoTel}
                onCriarNovo={submitNovoCliente}
                criando={criarCliente.isPending}
              />
            )}

            {etapa === "itens" && (
              <EtapaItens
                buscaProd={buscaProd} setBuscaProd={setBuscaProd}
                produtos={prodData?.data ?? []} loading={loadingProd}
                itens={itens} subtotal={subtotal}
                onAdicionar={adicionarProduto}
                onAjustar={ajustarQtd}
                onRemover={removerItem}
              />
            )}

            {etapa === "entrega" && (
              <EtapaEntrega
                ehDelivery={ehDelivery}
                endereco={endereco} setEndereco={setEndereco}
                taxa={taxa} setTaxa={setTaxa}
                observacao={observacao} setObservacao={setObservacao}
              />
            )}

            {etapa === "revisao" && (
              <EtapaRevisao
                canal={canal!} cliente={cliente!} itens={itens}
                ehDelivery={ehDelivery} endereco={endereco}
                subtotal={subtotal} taxa={taxaNum} total={total}
                observacao={observacao}
              />
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-border p-4 bg-muted/20 flex items-center justify-between gap-2">
          <Button variant="outline" onClick={anterior} disabled={idxAtual === 0}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
          <div className="text-sm text-muted-foreground hidden sm:block">
            Total: <span className="font-semibold text-foreground">{formatBRL(total)}</span>
          </div>
          {etapa !== "revisao" ? (
            <Button onClick={proxima} disabled={!podeAvancar}>
              Avançar <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => criar.mutate(false)} disabled={criar.isPending}>
                Salvar rascunho
              </Button>
              <Button onClick={() => criar.mutate(true)} disabled={criar.isPending}>
                <Check className="h-4 w-4 mr-1" /> Enviar para produção
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ---------- Stepper ----------
function Stepper({ etapa }: { etapa: Etapa }) {
  const labels: Record<Etapa, string> = {
    canal: "Canal", cliente: "Cliente", itens: "Itens", entrega: "Entrega", revisao: "Revisão",
  };
  const idx = ORDEM.indexOf(etapa);
  return (
    <div className="flex items-center gap-1.5 mt-3">
      {ORDEM.map((e, i) => (
        <div key={e} className="flex items-center gap-1.5 flex-1">
          <div className={`h-1.5 flex-1 rounded-full ${i <= idx ? "bg-primary" : "bg-muted"}`} />
          {i === ORDEM.length - 1 && (
            <span className="text-xs text-muted-foreground hidden sm:inline">{labels[etapa]}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------- Etapa: Canal ----------
function EtapaCanal({ canal, onChange }: { canal: CanalPedido | null; onChange: (c: CanalPedido) => void }) {
  const opcoes: { v: CanalPedido; label: string; desc: string; Icon: any }[] = [
    { v: "consumo", label: "Consumo no local", desc: "Cliente está no balcão/mesa", Icon: ShoppingBag },
    { v: "comanda", label: "Comanda", desc: "Vincular a uma comanda aberta", Icon: ClipboardList },
    { v: "whatsapp", label: "WhatsApp / Delivery", desc: "Pedido com endereço e taxa", Icon: MessageCircle },
  ];
  return (
    <RadioGroup value={canal ?? ""} onValueChange={(v) => onChange(v as CanalPedido)} className="space-y-2">
      {opcoes.map(({ v, label, desc, Icon }) => (
        <Label key={v} htmlFor={`c-${v}`} className="cursor-pointer">
          <Card className={`p-4 flex items-center gap-3 transition-colors ${canal === v ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
            <RadioGroupItem value={v} id={`c-${v}`} />
            <Icon className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">{label}</p>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          </Card>
        </Label>
      ))}
    </RadioGroup>
  );
}

// ---------- Etapa: Cliente ----------
function EtapaCliente(props: {
  buscaCli: string; setBuscaCli: (v: string) => void;
  clientes: Cliente[]; loading: boolean;
  cliente: Cliente | null; setCliente: (c: Cliente | null) => void;
  novoNome: string; setNovoNome: (v: string) => void;
  novoTel: string; setNovoTel: (v: string) => void;
  onCriarNovo: () => void; criando: boolean;
}) {
  return (
    <Tabs defaultValue="buscar">
      <TabsList className="w-full">
        <TabsTrigger value="buscar" className="flex-1"><Search className="h-3.5 w-3.5 mr-1" /> Buscar</TabsTrigger>
        <TabsTrigger value="novo" className="flex-1"><UserPlus className="h-3.5 w-3.5 mr-1" /> Novo</TabsTrigger>
      </TabsList>
      <TabsContent value="buscar" className="space-y-3 mt-4">
        <Input
          placeholder="Buscar por nome ou telefone"
          value={props.buscaCli}
          onChange={(e) => props.setBuscaCli(e.target.value)}
        />
        {props.loading ? <LoadingSkeleton rows={3} /> : (
          <div className="space-y-2">
            {props.clientes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhum cliente encontrado. Cadastre na aba "Novo".
              </p>
            ) : props.clientes.map((c) => (
              <Card
                key={c.id}
                onClick={() => props.setCliente(c)}
                className={`p-3 cursor-pointer transition-colors ${props.cliente?.id === c.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
              >
                <div className="flex justify-between items-center gap-2">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{c.nome}</p>
                    <p className="text-xs text-muted-foreground">{formatTelefoneBR(c.telefone)}</p>
                  </div>
                  {c.blacklist && <Badge variant="destructive" className="text-xs">Bloqueado</Badge>}
                </div>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
      <TabsContent value="novo" className="space-y-3 mt-4">
        <div>
          <Label htmlFor="nv-nome">Nome *</Label>
          <Input id="nv-nome" value={props.novoNome} onChange={(e) => props.setNovoNome(e.target.value)} maxLength={80} />
        </div>
        <div>
          <Label htmlFor="nv-tel">Telefone (com DDD) *</Label>
          <Input id="nv-tel" value={props.novoTel} onChange={(e) => props.setNovoTel(e.target.value)} placeholder="(11) 99999-0000" maxLength={20} />
        </div>
        <Button onClick={props.onCriarNovo} disabled={props.criando} className="w-full">
          <UserPlus className="h-4 w-4 mr-1" /> Cadastrar e selecionar
        </Button>
      </TabsContent>
    </Tabs>
  );
}

// ---------- Etapa: Itens ----------
function EtapaItens(props: {
  buscaProd: string; setBuscaProd: (v: string) => void;
  produtos: Produto[]; loading: boolean;
  itens: PedidoItem[]; subtotal: number;
  onAdicionar: (p: Produto) => void;
  onAjustar: (id: string, delta: number) => void;
  onRemover: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar produto..."
        value={props.buscaProd}
        onChange={(e) => props.setBuscaProd(e.target.value)}
      />

      {props.loading ? <LoadingSkeleton rows={3} /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {props.produtos.filter((p) => p.disponivel).map((p) => (
            <Card key={p.id} className="p-3 flex items-center justify-between gap-2 hover:bg-muted/50 transition-colors">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{p.nome}</p>
                <p className="text-xs text-muted-foreground">{formatBRL(p.preco_base)}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => props.onAdicionar(p)}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Separator />

      <div>
        <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide mb-2">
          Carrinho ({props.itens.length})
        </h3>
        {props.itens.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum item adicionado</p>
        ) : (
          <ul className="space-y-2">
            {props.itens.map((it) => (
              <li key={it.id} className="flex items-center justify-between gap-2 p-2 rounded-md border border-border">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{it.produto_nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatBRL(it.preco_unitario)} cada
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => props.onAjustar(it.id, -1)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">{it.quantidade}</span>
                  <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => props.onAjustar(it.id, +1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => props.onRemover(it.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="flex justify-between text-sm mt-3 pt-2 border-t border-border">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold">{formatBRL(props.subtotal)}</span>
        </div>
      </div>
    </div>
  );
}

// ---------- Etapa: Entrega ----------
function EtapaEntrega(props: {
  ehDelivery: boolean;
  endereco: string; setEndereco: (v: string) => void;
  taxa: string; setTaxa: (v: string) => void;
  observacao: string; setObservacao: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      {props.ehDelivery && (
        <>
          <div>
            <Label htmlFor="end">Endereço de entrega *</Label>
            <Textarea
              id="end" rows={2} maxLength={200}
              value={props.endereco}
              onChange={(e) => props.setEndereco(e.target.value)}
              placeholder="Rua, número, bairro, complemento"
            />
          </div>
          <div>
            <Label htmlFor="taxa">Taxa de entrega (R$)</Label>
            <Input
              id="taxa" type="text" inputMode="decimal"
              value={props.taxa}
              onChange={(e) => props.setTaxa(e.target.value.replace(/[^0-9.,]/g, ""))}
            />
          </div>
        </>
      )}
      <div>
        <Label htmlFor="obs">Observação geral (opcional)</Label>
        <Textarea
          id="obs" rows={3} maxLength={500}
          value={props.observacao}
          onChange={(e) => props.setObservacao(e.target.value)}
          placeholder="Ex.: sem cebola, troco para R$ 100..."
        />
      </div>
    </div>
  );
}

// ---------- Etapa: Revisão ----------
function EtapaRevisao(props: {
  canal: CanalPedido; cliente: Cliente; itens: PedidoItem[];
  ehDelivery: boolean; endereco: string;
  subtotal: number; taxa: number; total: number;
  observacao: string;
}) {
  const canalLabel = { consumo: "Consumo no local", comanda: "Comanda", whatsapp: "WhatsApp / Delivery" }[props.canal];
  return (
    <div className="space-y-4 text-sm">
      <Bloco titulo="Canal"><p>{canalLabel}</p></Bloco>
      <Bloco titulo="Cliente">
        <p className="font-medium">{props.cliente.nome}</p>
        <p className="text-muted-foreground">{formatTelefoneBR(props.cliente.telefone)}</p>
      </Bloco>
      <Bloco titulo={`Itens (${props.itens.length})`}>
        <ul className="space-y-1">
          {props.itens.map((it) => (
            <li key={it.id} className="flex justify-between">
              <span>{it.quantidade}× {it.produto_nome}</span>
              <span>{formatBRL(it.preco_unitario * it.quantidade)}</span>
            </li>
          ))}
        </ul>
      </Bloco>
      {props.ehDelivery && (
        <Bloco titulo="Entrega">
          <p>{props.endereco}</p>
        </Bloco>
      )}
      {props.observacao && (
        <Bloco titulo="Observação">
          <p>{props.observacao}</p>
        </Bloco>
      )}
      <div className="space-y-1 pt-2 border-t border-border">
        <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatBRL(props.subtotal)}</span></div>
        {props.ehDelivery && props.taxa > 0 && (
          <div className="flex justify-between"><span className="text-muted-foreground">Taxa</span><span>{formatBRL(props.taxa)}</span></div>
        )}
        <div className="flex justify-between font-semibold text-base pt-1"><span>Total</span><span>{formatBRL(props.total)}</span></div>
      </div>
    </div>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">{titulo}</h4>
      {children}
    </div>
  );
}
