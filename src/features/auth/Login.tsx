import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Phone, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { normalizeTelefone, formatTelefoneBR } from "@/lib/formatters";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

interface EspacoResolved {
  id: string;
  nome: string;
  logo_url: string | null;
  cor_primaria: string;
}

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const { isAuthenticated, signIn } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [telefone, setTelefone] = useState("");
  const [espaco, setEspaco] = useState<EspacoResolved | null>(null);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [superMode, setSuperMode] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const from = (loc.state as any)?.from?.pathname ?? "/";
      nav(from, { replace: true });
    }
  }, [isAuthenticated, nav, loc.state]);

  async function handleResolveEspaco() {
    const tel = normalizeTelefone(telefone);
    if (tel.length < 10) {
      toast.error("Informe um telefone válido com DDD");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("resolve-espaco", {
        body: { telefone: tel },
      });
      if (error || !data?.success) {
        toast.error(data?.error?.message ?? "Espaco não encontrado");
        return;
      }
      setEspaco(data.data);
      setStep(2);
    } catch (e) {
      toast.error("Falha ao consultar Espaco");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    setLoading(true);
    try {
      const { error } = await signIn(email, senha);
      if (error) {
        toast.error(error.message ?? "Falha no login");
        return;
      }
      toast.success("Bem-vindo!");
      nav("/", { replace: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md p-6 sm:p-8 shadow-elevated">
        {step === 1 && !superMode && (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-3">
                <Phone className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-semibold">Entrar no Espaco</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Informe o telefone do seu comércio
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="tel">Telefone do Espaco</Label>
                <Input
                  id="tel"
                  inputMode="tel"
                  placeholder="(11) 99999-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleResolveEspaco()}
                  className="mt-1.5"
                />
              </div>

              <Button onClick={handleResolveEspaco} disabled={loading} className="w-full">
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Continuar
              </Button>

              <button
                type="button"
                onClick={() => setSuperMode(true)}
                className="w-full text-xs text-muted-foreground hover:text-foreground mt-2"
              >
                Sou superadmin →
              </button>
            </div>

            <DemoHint />
          </>
        )}

        {step === 1 && superMode && (
          <SuperLoginForm
            email={email} setEmail={setEmail}
            senha={senha} setSenha={setSenha}
            loading={loading} onLogin={handleLogin}
            onBack={() => setSuperMode(false)}
          />
        )}

        {step === 2 && espaco && (
          <>
            <button
              type="button"
              onClick={() => { setStep(1); setEspaco(null); setEmail(""); setSenha(""); }}
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4"
            >
              <ArrowLeft className="h-3 w-3" /> Trocar Espaco
            </button>
            <div className="text-center mb-6">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-3 text-xl font-bold">
                {espaco.nome[0].toUpperCase()}
              </div>
              <h1 className="text-xl font-semibold">{espaco.nome}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {formatTelefoneBR(telefone)}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="senha">Senha</Label>
                <Input id="senha" type="password" autoComplete="current-password"
                  value={senha} onChange={(e) => setSenha(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="mt-1.5" />
              </div>
              <Button onClick={handleLogin} disabled={loading || !email || !senha} className="w-full">
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Entrar
              </Button>
            </div>

            <DemoHint />
          </>
        )}
      </Card>
    </div>
  );
}

function SuperLoginForm({
  email, setEmail, senha, setSenha, loading, onLogin, onBack,
}: {
  email: string; setEmail: (v: string) => void;
  senha: string; setSenha: (v: string) => void;
  loading: boolean; onLogin: () => void; onBack: () => void;
}) {
  return (
    <>
      <button type="button" onClick={onBack}
        className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="h-3 w-3" /> Voltar
      </button>
      <div className="text-center mb-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-foreground text-background mb-3">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-semibold">Acesso Superadmin</h1>
      </div>
      <div className="space-y-4">
        <div>
          <Label htmlFor="email-s">E-mail</Label>
          <Input id="email-s" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="senha-s">Senha</Label>
          <Input id="senha-s" type="password" value={senha} onChange={(e) => setSenha(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onLogin()} className="mt-1.5" />
        </div>
        <Button onClick={onLogin} disabled={loading || !email || !senha} className="w-full">
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Entrar
        </Button>
      </div>
      <DemoHint />
    </>
  );
}

function DemoHint() {
  return (
    <div className="mt-6 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
      <p className="font-medium text-foreground mb-1">Credenciais de demonstração</p>
      <p>Telefone do Espaco: <code className="font-mono">(11) 99999-0000</code></p>
      <p>Senha (todos): <code className="font-mono">demo1234</code></p>
      <ul className="mt-1 space-y-0.5">
        <li>• admin@demo.com</li>
        <li>• caixa@demo.com</li>
        <li>• entregador@demo.com</li>
        <li>• super@demo.com (use "Sou superadmin")</li>
      </ul>
    </div>
  );
}
