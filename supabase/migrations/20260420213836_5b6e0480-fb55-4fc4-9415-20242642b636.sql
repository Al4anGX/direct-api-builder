-- =============================================================
-- FUNDAÇÃO MULTI-TENANT — MVP Foundation
-- =============================================================

-- 1. ENUM de papéis
CREATE TYPE public.app_role AS ENUM ('superadmin', 'admin', 'caixa', 'entregador');

-- 2. Tabela ESPACOS
CREATE TABLE public.espacos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL UNIQUE, -- normalizado: só dígitos com DDI+DDD (ex: 5511999990000)
  slug TEXT UNIQUE,
  logo_url TEXT,
  cor_primaria TEXT DEFAULT '24 95% 53%', -- HSL components (laranja default)
  ativo BOOLEAN NOT NULL DEFAULT true,
  trial_ate TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_espacos_telefone ON public.espacos(telefone);
CREATE INDEX idx_espacos_ativo ON public.espacos(ativo);

-- 3. Tabela PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  espaco_id UUID REFERENCES public.espacos(id) ON DELETE SET NULL,
  nome TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  telefone TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_espaco ON public.profiles(espaco_id);

-- 4. Tabela USER_ROLES (separada por segurança)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  espaco_id UUID REFERENCES public.espacos(id) ON DELETE CASCADE, -- nullable p/ superadmin
  role public.app_role NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, espaco_id, role)
);

CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_espaco ON public.user_roles(espaco_id);

-- 5. FUNÇÃO de timestamp
CREATE OR REPLACE FUNCTION public.set_atualizado_em()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_espacos_updated
BEFORE UPDATE ON public.espacos
FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();

CREATE TRIGGER trg_profiles_updated
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();

-- 6. SECURITY DEFINER: has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 7. SECURITY DEFINER: is_superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'superadmin'
  )
$$;

-- 8. SECURITY DEFINER: current_espaco_id (do profile do usuário logado)
CREATE OR REPLACE FUNCTION public.current_espaco_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT espaco_id FROM public.profiles WHERE id = auth.uid()
$$;

-- 9. SECURITY DEFINER: pertence_ao_espaco
CREATE OR REPLACE FUNCTION public.pertence_ao_espaco(_user_id UUID, _espaco_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND espaco_id = _espaco_id
  )
$$;

-- 10. TRIGGER: cria profile no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, telefone, espaco_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    NEW.raw_user_meta_data->>'telefone',
    NULLIF(NEW.raw_user_meta_data->>'espaco_id', '')::UUID
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================
-- RLS
-- =============================================================
ALTER TABLE public.espacos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ESPACOS
CREATE POLICY "Superadmin vê todos os espacos"
ON public.espacos FOR SELECT TO authenticated
USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Usuário vê seu próprio espaco"
ON public.espacos FOR SELECT TO authenticated
USING (id = public.current_espaco_id());

CREATE POLICY "Superadmin gerencia espacos"
ON public.espacos FOR ALL TO authenticated
USING (public.is_superadmin(auth.uid()))
WITH CHECK (public.is_superadmin(auth.uid()));

CREATE POLICY "Admin atualiza seu espaco"
ON public.espacos FOR UPDATE TO authenticated
USING (id = public.current_espaco_id() AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (id = public.current_espaco_id() AND public.has_role(auth.uid(), 'admin'));

-- PROFILES
CREATE POLICY "Usuário vê seu próprio profile"
ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "Superadmin vê todos profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Admin vê profiles do seu espaco"
ON public.profiles FOR SELECT TO authenticated
USING (
  espaco_id = public.current_espaco_id()
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Usuário atualiza seu próprio profile"
ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid() AND (espaco_id IS NOT DISTINCT FROM (SELECT espaco_id FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY "Admin atualiza profiles do espaco"
ON public.profiles FOR UPDATE TO authenticated
USING (espaco_id = public.current_espaco_id() AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (espaco_id = public.current_espaco_id() AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Superadmin gerencia profiles"
ON public.profiles FOR ALL TO authenticated
USING (public.is_superadmin(auth.uid()))
WITH CHECK (public.is_superadmin(auth.uid()));

-- USER_ROLES
CREATE POLICY "Usuário vê seus próprios roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Superadmin vê todos roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Admin vê roles do seu espaco"
ON public.user_roles FOR SELECT TO authenticated
USING (
  espaco_id = public.current_espaco_id()
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Superadmin gerencia roles"
ON public.user_roles FOR ALL TO authenticated
USING (public.is_superadmin(auth.uid()))
WITH CHECK (public.is_superadmin(auth.uid()));

CREATE POLICY "Admin gerencia roles do seu espaco (não-superadmin)"
ON public.user_roles FOR ALL TO authenticated
USING (
  espaco_id = public.current_espaco_id()
  AND public.has_role(auth.uid(), 'admin')
  AND role <> 'superadmin'
)
WITH CHECK (
  espaco_id = public.current_espaco_id()
  AND public.has_role(auth.uid(), 'admin')
  AND role <> 'superadmin'
);