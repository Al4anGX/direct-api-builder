import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";

export function SuperEspacos() {
  return (
    <>
      <PageHeader title="Espaços" description="Gestão da plataforma" />
      <Card className="p-8 text-center text-sm text-muted-foreground">
        Lista e criação de Espaços — próxima entrega.
      </Card>
    </>
  );
}
export function SuperAssinaturas() {
  return (<><PageHeader title="Assinaturas" /><Card className="p-8 text-center text-sm text-muted-foreground">Próxima entrega.</Card></>);
}
export function SuperFinanceiro() {
  return (<><PageHeader title="Financeiro" /><Card className="p-8 text-center text-sm text-muted-foreground">Próxima entrega.</Card></>);
}
export function SuperUso() {
  return (<><PageHeader title="Uso da plataforma" /><Card className="p-8 text-center text-sm text-muted-foreground">Métricas de uso (tráfego, IA) — próxima entrega.</Card></>);
}
