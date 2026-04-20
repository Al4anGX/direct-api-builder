import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ShieldOff } from "lucide-react";

export default function SemPermissao() {
  const nav = useNavigate();
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="p-8 text-center max-w-sm">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive mb-3">
          <ShieldOff className="h-5 w-5" />
        </div>
        <h1 className="text-lg font-semibold">Sem permissão</h1>
        <p className="text-sm text-muted-foreground mt-1">Seu perfil não tem acesso a esta tela.</p>
        <Button variant="outline" className="mt-4" onClick={() => nav("/")}>Voltar</Button>
      </Card>
    </div>
  );
}
