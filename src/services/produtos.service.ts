import { ok, delay } from "./http";
import { mockProdutos, mockCategorias } from "@/mocks/fixtures";
import type { Produto, Categoria } from "@/types/domain";
import type { ApiResponse } from "@/types/api";

let store: Produto[] = [...mockProdutos];

export const produtosService = {
  async listar(busca?: string, categoriaId?: string): Promise<ApiResponse<Produto[]>> {
    let list = [...store];
    if (busca) {
      const q = busca.toLowerCase();
      list = list.filter((p) => p.nome.toLowerCase().includes(q));
    }
    if (categoriaId && categoriaId !== "todas") {
      list = list.filter((p) => p.categoria_id === categoriaId);
    }
    return delay(ok(list));
  },
  async obter(id: string): Promise<ApiResponse<Produto | null>> {
    return delay(ok(store.find((p) => p.id === id) ?? null));
  },
  async listarCategorias(): Promise<ApiResponse<Categoria[]>> {
    return delay(ok(mockCategorias));
  },
  async toggleDisponibilidade(id: string, disponivel: boolean): Promise<ApiResponse<Produto>> {
    store = store.map((p) => (p.id === id ? { ...p, disponivel } : p));
    return delay(ok(store.find((x) => x.id === id)!));
  },
  async toggleAtivo(id: string, ativo: boolean): Promise<ApiResponse<Produto>> {
    store = store.map((p) => (p.id === id ? { ...p, ativo } : p));
    return delay(ok(store.find((x) => x.id === id)!));
  },
  async excluir(id: string): Promise<ApiResponse<{ ok: true }>> {
    store = store.filter((p) => p.id !== id);
    return delay(ok({ ok: true as const }));
  },
  async salvar(produto: Partial<Produto> & { id?: string }): Promise<ApiResponse<Produto>> {
    const cat = mockCategorias.find((c) => c.id === produto.categoria_id);
    if (produto.id) {
      store = store.map((p) =>
        p.id === produto.id
          ? ({ ...p, ...produto, categoria_nome: cat?.nome ?? p.categoria_nome } as Produto)
          : p,
      );
      return delay(ok(store.find((x) => x.id === produto.id)!));
    }
    const novo: Produto = {
      id: `p${Date.now()}`,
      espaco_id: "demo",
      categoria_id: produto.categoria_id || "c1",
      categoria_nome: cat?.nome || "Lanches",
      nome: produto.nome || "",
      descricao: produto.descricao || "",
      preco_base: produto.preco_base || 0,
      ativo: produto.ativo ?? true,
      disponivel: produto.disponivel ?? true,
      exige_escolha_obrigatoria: produto.exige_escolha_obrigatoria ?? false,
      fotos: produto.fotos ?? [],
      variacoes: produto.variacoes ?? [],
      adicionais: produto.adicionais ?? [],
    };
    store.push(novo);
    return delay(ok(novo));
  },
};
