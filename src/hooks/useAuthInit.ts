import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";
import type { AppRole } from "@/types/domain";

/**
 * Inicializa e mantém o estado de autenticação.
 * - Listener PRIMEIRO, depois getSession (regra crítica do Supabase).
 * - Carrega profile + espaco + roles após login.
 */
export function useAuthInit() {
  const set = useAuthStore((s) => s.set);
  const reset = useAuthStore((s) => s.reset);

  useEffect(() => {
    let mounted = true;

    // 1) Listener primeiro
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      set({ session, user: session?.user ?? null });
      if (session?.user) {
        // defer carregamento extra para evitar deadlock no listener
        setTimeout(() => loadContext(session.user.id), 0);
      } else {
        reset();
      }
    });

    // 2) getSession depois
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      set({ session, user: session?.user ?? null });
      if (session?.user) loadContext(session.user.id);
      else set({ loading: false });
    });

    async function loadContext(userId: string) {
      try {
        const [{ data: profile }, { data: rolesRows }] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
          supabase.from("user_roles").select("role").eq("user_id", userId),
        ]);

        const roles: AppRole[] = (rolesRows ?? []).map((r: any) => r.role as AppRole);

        let espaco = null;
        if (profile?.espaco_id) {
          const { data: esp } = await supabase
            .from("espacos")
            .select("*")
            .eq("id", profile.espaco_id)
            .maybeSingle();
          espaco = esp as any;
        }

        set({ profile: profile as any, espaco, roles, loading: false });
      } catch {
        set({ loading: false });
      }
    }

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [set, reset]);
}
