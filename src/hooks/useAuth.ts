import { useAuthStore, getActiveRole } from "@/store/authStore";
import { can, type PermissionAction } from "@/lib/permissions";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const { user, profile, espaco, roles, loading } = useAuthStore();
  const activeRole = getActiveRole();

  return {
    user,
    profile,
    espaco,
    roles,
    activeRole,
    isAuthenticated: !!user,
    loading,
    signIn: async (email: string, password: string) => {
      return supabase.auth.signInWithPassword({ email, password });
    },
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };
}

export function usePermission(action: PermissionAction): boolean {
  const role = getActiveRole();
  return can(role, action);
}
