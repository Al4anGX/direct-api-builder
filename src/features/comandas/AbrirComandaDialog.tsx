import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { comandasService } from "@/services/comandas.service";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}

export function AbrirComandaDialog({ open, onOpenChange, onCreated }: Props) {
  const [referencia, setReferencia] = useState("");
  const [loading, setLoading] = useState(false);

  async function salvar() {
    const ref = referencia.trim();
    if (ref.length < 2) {
      toast.error("Informe uma referência (ex.: Mesa 5, Balcão 2)");
      return;
    }
    setLoading(true);
    const res = await comandasService.abrir(ref);
    setLoading(false);
    if (res.success) {
      toast.success(`Comanda ${ref} aberta`);
      setReferencia("");
      onOpenChange(false);
      onCreated();
    } else {
      toast.error("Erro ao abrir comanda");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Nova comanda</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Referência (mesa, balcão, nome)</Label>
          <Input
            placeholder="Ex.: Mesa 5"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && salvar()}
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={salvar} disabled={loading}>{loading ? "Abrindo..." : "Abrir comanda"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
