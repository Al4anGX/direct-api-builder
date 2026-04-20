import { create } from "zustand";
import type { AppRole, Espaco, Profile } from "@/types/domain";
import type { Session, User } from "@supabase/supabase-js";

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  espaco: Espaco | null;
  roles: AppRole[];
  loading: boolean;
  set: (s: Partial<AuthState>) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  profile: null,
  espaco: null,
  roles: [],
  loading: true,
  set: (s) => set(s),
  reset: () => set({ session: null, user: null, profile: null, espaco: null, roles: [], loading: false }),
}));

export function getActiveRole(): AppRole | null {
  const { roles } = useAuthStore.getState();
  if (roles.includes("superadmin")) return "superadmin";
  if (roles.includes("admin")) return "admin";
  if (roles.includes("caixa")) return "caixa";
  if (roles.includes("entregador")) return "entregador";
  return null;
}
