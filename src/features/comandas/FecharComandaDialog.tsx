import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/formatters";
import type { Comanda } from "@/types/domain";
import { comandasService } from "@/services/comandas.service";
import { toast } from "sonner";

interface Props {
  comanda: Comanda;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onClosed: () => void;
}

export function FecharComandaDialog({ comanda, open, onOpenChange, onClosed }: Props) {
  const [pessoas, setPessoas] = useState(2);
  const [valorPorPessoa, setValorPorPessoa] = useState<number>(50);
  const [loading, setLoading] = useState(false);

  const total = comanda.total_atual;
  const porIgual = useMemo(() => (pessoas > 0 ? total / pessoas : 0), [pessoas, total]);
  const qtdPessoasValor = useMemo(
    () => (valorPorPessoa > 0 ? Math.ceil(total / valorPorPessoa) : 0),
    [valorPorPessoa, total],
  );
  const restanteValor = useMemo(() => {
    if (valorPorPessoa <= 0 || qtdPessoasValor === 0) return 0;
    return Math.max(0, valorPorPessoa * qtdPessoasValor - total);
  }, [valorPorPessoa, qtdPessoasValor, total]);

  async function fechar() {
    setLoading(true);
    const res = await comandasService.fechar(comanda.id);
    setLoading(false);
    if (res.success) {
      toast.success(`Comanda ${comanda.referencia_mesa_livre} fechada`);
      onOpenChange(false);
      onClosed();
    } else {
      toast.error("Erro ao fechar comanda");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Fechar {comanda.referencia_mesa_livre}</DialogTitle>
        </DialogHeader>

        <div className="rounded-md bg-muted p-3 flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Total da comanda</span>
          <span className="text-lg font-semibold">{formatBRL(total)}</span>
        </div>

        <Tabs defaultValue="igual" className="mt-2">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="igual">Por igual</TabsTrigger>
            <TabsTrigger value="valor">Por valor</TabsTrigger>
            <TabsTrigger value="total">Total</TabsTrigger>
          </TabsList>

          <TabsContent value="igual" className="space-y-3 pt-3">
            <div>
              <Label>Quantidade de pessoas</Label>
              <Input
                type="number"
                min={1}
                value={pessoas}
                onChange={(e) => setPessoas(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>
            <div className="rounded-md border p-3 flex justify-between">
              <span className="text-sm">Cada pessoa paga</span>
              <span className="font-semibold">{formatBRL(porIgual)}</span>
            </div>
          </TabsContent>

          <TabsContent value="valor" className="space-y-3 pt-3">
            <div>
              <Label>Valor por pessoa (R$)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={valorPorPessoa}
                onChange={(e) => setValorPorPessoa(Number(e.target.value) || 0)}
              />
            </div>
            <div className="rounded-md border p-3 space-y-1 text-sm">
              <div className="flex justify-between"><span>Pessoas estimadas</span><span className="font-medium">{qtdPessoasValor}</span></div>
              <div className="flex justify-between"><span>Sobra (gorjeta)</span><span className="font-medium">{formatBRL(restanteValor)}</span></div>
            </div>
          </TabsContent>

          <TabsContent value="total" className="pt-3">
            <div className="rounded-md border p-3 text-sm text-muted-foreground">
              Pagamento integral em uma única forma. Total: <span className="font-semibold text-foreground">{formatBRL(total)}</span>.
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={fechar} disabled={loading}>
            {loading ? "Fechando..." : "Confirmar fechamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
