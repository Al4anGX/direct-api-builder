import { ok, delay } from "./http";
import { mockProdutos, mockCategorias } from "@/mocks/fixtures";
import type { Produto, Categoria } from "@/types/domain";
import type { ApiResponse } from "@/types/api";

let store: Produto[] = [...mockProdutos];

export const produtosService = {
  async listar(busca?: string): Promise<ApiResponse<Produto[]>> {
    let list = [...store];
    if (busca) {
      const q = busca.toLowerCase();
      list = list.filter((p) => p.nome.toLowerCase().includes(q));
    }
    return delay(ok(list));
  },
  async listarCategorias(): Promise<ApiResponse<Categoria[]>> {
    return delay(ok(mockCategorias));
  },
  async toggleDisponibilidade(id: string, disponivel: boolean): Promise<ApiResponse<Produto>> {
    store = store.map((p) => (p.id === id ? { ...p, disponivel } : p));
    return delay(ok(store.find((x) => x.id === id)!));
  },
  async salvar(produto: Partial<Produto> & { id?: string }): Promise<ApiResponse<Produto>> {
    if (produto.id) {
      store = store.map((p) => (p.id === produto.id ? { ...p, ...produto } as Produto : p));
      return delay(ok(store.find((x) => x.id === produto.id)!));
    }
    const novo: Produto = {
      id: `p${Date.now()}`,
      espaco_id: "demo",
      categoria_id: produto.categoria_id || "c1",
      categoria_nome: produto.categoria_nome || "Lanches",
      nome: produto.nome || "",
      descricao: produto.descricao || "",
      preco_base: produto.preco_base || 0,
      ativo: true,
      disponivel: true,
      exige_escolha_obrigatoria: false,
      fotos: [],
      variacoes: [],
      adicionais: [],
    };
    store.push(novo);
    return delay(ok(novo));
  },
};
