import { ok, delay } from "./http";
import { mockUsuarios } from "@/mocks/fixtures";
import type { UsuarioEspaco, AppRole } from "@/types/domain";
import type { ApiResponse } from "@/types/api";

let store: UsuarioEspaco[] = [...mockUsuarios];

export const usuariosService = {
  async listar(): Promise<ApiResponse<UsuarioEspaco[]>> {
    return delay(ok(store));
  },
  async toggleAtivo(id: string, ativo: boolean): Promise<ApiResponse<UsuarioEspaco>> {
    store = store.map((u) => (u.id === id ? { ...u, ativo } : u));
    return delay(ok(store.find((x) => x.id === id)!));
  },
  async alterarRole(id: string, role: AppRole): Promise<ApiResponse<UsuarioEspaco>> {
    store = store.map((u) => (u.id === id ? { ...u, role } : u));
    return delay(ok(store.find((x) => x.id === id)!));
  },
};
