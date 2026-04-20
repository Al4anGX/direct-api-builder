import { ok, delay } from "./http";
import { mockClientes } from "@/mocks/fixtures";
import type { Cliente } from "@/types/domain";
import type { ApiResponse } from "@/types/api";
import { normalizeTelefone } from "@/lib/formatters";

let store: Cliente[] = [...mockClientes];

export const clientesService = {
  async listar(busca?: string): Promise<ApiResponse<Cliente[]>> {
    let list = [...store];
    if (busca) {
      const tel = normalizeTelefone(busca);
      const q = busca.toLowerCase();
      list = list.filter(
        (c) => c.nome.toLowerCase().includes(q) || (tel && c.telefone.includes(tel))
      );
    }
    return delay(ok(list));
  },
  async obter(id: string): Promise<ApiResponse<Cliente | null>> {
    return delay(ok(store.find((c) => c.id === id) ?? null));
  },
  async toggleBlacklist(id: string, value: boolean): Promise<ApiResponse<Cliente>> {
    store = store.map((c) => (c.id === id ? { ...c, blacklist: value } : c));
    return delay(ok(store.find((x) => x.id === id)!));
  },
};
