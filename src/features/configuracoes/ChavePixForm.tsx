import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/common/LoadingState";
import { useAuth } from "@/hooks/useAuth";
import { can } from "@/lib/permissions";
import { chavePixService, type TipoChavePix } from "@/services/chavePix.service";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

const TIPOS: { value: TipoChavePix; label: string }[] = [
  { value: "cpf", label: "CPF" },
  { value: "cnpj", label: "CNPJ" },
  { value: "telefone", label: "Telefone" },
  { value: "email", label: "E-mail" },
  { value: "aleatoria", label: "Chave aleatória" },
];

const schema = z.object({
  tipo: z.enum(["cpf", "cnpj", "telefone", "email", "aleatoria"]),
  chave: z.string().trim().min(3, "Informe a chave").max(120),
  banco: z.string().trim().min(2, "Informe o banco recebedor").max(80),
  nome_recebedor: z.string().trim().min(2, "Informe o nome do recebedor").max(120),
});

export function ChavePixForm() {
  const qc = useQueryClient();
  const { espaco, activeRole } = useAuth();
  const podeEditar = can(activeRole, "gerenciar_usuarios"); // admin-only para config

  const { data, isLoading } = useQuery({
    queryKey: ["chave-pix", espaco?.id],
    queryFn: () => chavePixService.obter(espaco!.id),
    enabled: !!espaco?.id,
  });
  const atual = data?.data ?? null;

  const [tipo, setTipo] = useState<TipoChavePix>("cnpj");
  const [chave, setChave] = useState("");
  const [banco, setBanco] = useState("");
  const [nome, setNome] = useState("");

  useEffect(() => {
    if (atual) {
      setTipo(atual.tipo);
      setChave(atual.chave);
      setBanco(atual.banco);
      setNome(atual.nome_recebedor);
    }
  }, [atual]);

  const salvar = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse({ tipo, chave, banco, nome_recebedor: nome });
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos");
      }
      const res = await chavePixService.salvar(espaco!.id, {
        tipo: parsed.data.tipo,
        chave: parsed.data.chave,
        banco: parsed.data.banco,
        nome_recebedor: parsed.data.nome_recebedor,
      });
      if (!res.success) throw new Error(res.error?.message ?? "Erro ao salvar");
      return res.data!;
    },
    onSuccess: () => {
      toast.success("Chave PIX salva");
      qc.invalidateQueries({ queryKey: ["chave-pix", espaco?.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remover = useMutation({
    mutationFn: async () => {
      const res = await chavePixService.excluir(espaco!.id);
      if (!res.success) throw new Error(res.error?.message ?? "Erro ao remover");
    },
    onSuccess: () => {
      toast.success("Chave PIX removida");
      setChave(""); setBanco(""); setNome("");
      qc.invalidateQueries({ queryKey: ["chave-pix", espaco?.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!espaco) {
    return <Card className="p-6 text-sm text-muted-foreground">Selecione um Espaco para configurar PIX.</Card>;
  }
  if (isLoading) return <Card className="p-6"><LoadingSkeleton rows={4} /></Card>;

  return (
    <Card className="p-5 space-y-5 max-w-2xl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-md bg-primary/10 text-primary grid place-items-center">
            <KeyRound className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold">Chave PIX do Espaco</h3>
            <p className="text-xs text-muted-foreground">
              Usada pelo agente de IA ao enviar dados de pagamento e pelo caixa para conferir o comprovante.
            </p>
          </div>
        </div>
        <Badge variant={atual ? "default" : "outline"}>
          {atual ? "Configurada" : "Não configurada"}
        </Badge>
      </div>

      <fieldset disabled={!podeEditar} className="space-y-4 disabled:opacity-70">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Tipo de chave</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as TipoChavePix)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIPOS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Chave</Label>
            <Input
              value={chave}
              onChange={(e) => setChave(e.target.value)}
              placeholder={
                tipo === "cnpj" ? "00.000.000/0000-00"
                : tipo === "cpf" ? "000.000.000-00"
                : tipo === "telefone" ? "+55 11 90000-0000"
                : tipo === "email" ? "pix@espaco.com.br"
                : "Chave aleatória"
              }
              maxLength={120}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Banco recebedor</Label>
            <Input value={banco} onChange={(e) => setBanco(e.target.value)} placeholder="Ex.: Nubank, Itaú, Inter" maxLength={80} />
          </div>
          <div className="space-y-1.5">
            <Label>Nome do recebedor</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como aparece no comprovante" maxLength={120} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          {atual && (
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => remover.mutate()}
              disabled={remover.isPending}
            >
              Remover
            </Button>
          )}
          <Button onClick={() => salvar.mutate()} disabled={salvar.isPending}>
            {salvar.isPending ? "Salvando..." : atual ? "Salvar alterações" : "Cadastrar chave"}
          </Button>
        </div>
        {!podeEditar && (
          <p className="text-xs text-muted-foreground">Apenas administradores podem editar a chave PIX.</p>
        )}
      </fieldset>
    </Card>
  );
}
