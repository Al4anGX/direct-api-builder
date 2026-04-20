import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { formatTelefoneBR } from "@/lib/formatters";
import { ChavePixForm } from "./ChavePixForm";

export default function Configuracoes() {
  const { espaco } = useAuth();
  return (
    <>
      <PageHeader title="Configurações" description="Personalize seu Espaco" />
      <Tabs defaultValue="geral">
        <TabsList>
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="horario">Horário</TabsTrigger>
          <TabsTrigger value="impressao">Impressão</TabsTrigger>
          <TabsTrigger value="pix">PIX</TabsTrigger>
        </TabsList>
        <TabsContent value="geral">
          <Card className="p-4 space-y-2 text-sm">
            <Row label="Nome do Espaco" value={espaco?.nome} />
            <Row label="Telefone" value={espaco?.telefone ? formatTelefoneBR(espaco.telefone) : "-"} />
            <Row label="Slug" value={espaco?.slug ?? "-"} />
            <Row label="Status" value={espaco?.ativo ? "Ativo" : "Inativo"} />
            <p className="text-xs text-muted-foreground pt-3 border-t">Edição completa (logo, cor, etc.) — próxima entrega.</p>
          </Card>
        </TabsContent>
        <TabsContent value="horario">
          <Placeholder text="Horário de funcionamento — próxima entrega" />
        </TabsContent>
        <TabsContent value="impressao">
          <Placeholder text="Configuração de impressão / vias por canal — próxima entrega" />
        </TabsContent>
        <TabsContent value="pix">
          <ChavePixForm />
        </TabsContent>
      </Tabs>
    </>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between py-1.5 border-b last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value ?? "-"}</span>
    </div>
  );
}
function Placeholder({ text }: { text: string }) {
  return <Card className="p-8 text-center text-sm text-muted-foreground">{text}</Card>;
}
