-- ============ CHAVES PIX (1 por espaço) ============
CREATE TYPE public.tipo_chave_pix AS ENUM ('cpf', 'cnpj', 'telefone', 'email', 'aleatoria');

CREATE TABLE public.chaves_pix (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  espaco_id UUID NOT NULL UNIQUE REFERENCES public.espacos(id) ON DELETE CASCADE,
  chave TEXT NOT NULL,
  tipo public.tipo_chave_pix NOT NULL,
  banco TEXT NOT NULL,
  nome_recebedor TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chaves_pix ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem chave PIX do seu espaço"
  ON public.chaves_pix FOR SELECT TO authenticated
  USING (espaco_id = public.current_espaco_id() OR public.is_superadmin(auth.uid()));

CREATE POLICY "Admin gerencia chave PIX do seu espaço"
  ON public.chaves_pix FOR ALL TO authenticated
  USING (espaco_id = public.current_espaco_id() AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (espaco_id = public.current_espaco_id() AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Superadmin gerencia chaves PIX"
  ON public.chaves_pix FOR ALL TO authenticated
  USING (public.is_superadmin(auth.uid()))
  WITH CHECK (public.is_superadmin(auth.uid()));

CREATE TRIGGER trg_chaves_pix_atualizado
  BEFORE UPDATE ON public.chaves_pix
  FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();

-- ============ PAGAMENTOS (registro manual, sem gateway) ============
CREATE TYPE public.metodo_pagamento AS ENUM ('pix', 'dinheiro', 'credito', 'debito');
CREATE TYPE public.status_pagamento AS ENUM ('pendente', 'aprovado', 'estornado');

CREATE TABLE public.pagamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  espaco_id UUID NOT NULL REFERENCES public.espacos(id) ON DELETE CASCADE,
  pedido_id UUID NOT NULL,
  metodo public.metodo_pagamento NOT NULL,
  valor NUMERIC(10,2) NOT NULL CHECK (valor >= 0),
  troco NUMERIC(10,2),
  status public.status_pagamento NOT NULL DEFAULT 'pendente',
  conciliado BOOLEAN NOT NULL DEFAULT false,
  observacao TEXT,
  registrado_por UUID,
  confirmado_por UUID,
  confirmado_em TIMESTAMPTZ,
  estornado_por UUID,
  estornado_em TIMESTAMPTZ,
  motivo_estorno TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pagamentos_pedido ON public.pagamentos(pedido_id);
CREATE INDEX idx_pagamentos_espaco_status ON public.pagamentos(espaco_id, status);

ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem pagamentos do seu espaço"
  ON public.pagamentos FOR SELECT TO authenticated
  USING (espaco_id = public.current_espaco_id() OR public.is_superadmin(auth.uid()));

CREATE POLICY "Caixa e admin registram pagamentos"
  ON public.pagamentos FOR INSERT TO authenticated
  WITH CHECK (
    espaco_id = public.current_espaco_id()
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'caixa'))
  );

CREATE POLICY "Caixa e admin atualizam pagamentos do seu espaço"
  ON public.pagamentos FOR UPDATE TO authenticated
  USING (
    espaco_id = public.current_espaco_id()
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'caixa'))
  )
  WITH CHECK (
    espaco_id = public.current_espaco_id()
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'caixa'))
  );

CREATE POLICY "Apenas admin deleta pagamentos"
  ON public.pagamentos FOR DELETE TO authenticated
  USING (espaco_id = public.current_espaco_id() AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Superadmin gerencia pagamentos"
  ON public.pagamentos FOR ALL TO authenticated
  USING (public.is_superadmin(auth.uid()))
  WITH CHECK (public.is_superadmin(auth.uid()));

CREATE TRIGGER trg_pagamentos_atualizado
  BEFORE UPDATE ON public.pagamentos
  FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();