# Handoff Frontend (Lovable) - MVP v1

## 1. Objetivo deste documento
Guiar a construcao de telas, menus e componentes no Lovable sem ambiguidade funcional.

## 1.1 Como usar este documento no Lovable
- Tratar este arquivo como especificacao de interface.
- Para regras de negocio e APIs, consultar `03_backend_banco_api.md` e `05_whatsapp_agente_ia_n8n.md`.
- Em caso de conflito, seguir esta ordem de prioridade:
  1. `01_escopo_mvp.md`
  2. `02_handoff_lovable_frontend.md`
  3. `05_whatsapp_agente_ia_n8n.md`
  4. `03_backend_banco_api.md`

## 2. Principios de UX do produto
- Interface simples para publico pouco tecnico.
- Fluxo rapido para operacao de caixa.
- Maximo de 2 cliques para abrir pedido e enviar para producao.
- Linguagem clara: usar termo `Espaco` (nao usar workspace para usuario final).
- Responsivo para desktop e celular.

## 3. Estrutura de navegacao por perfil
### 3.1 Superadmin
Menus:
- Espacos
- Usuarios por espaco
- Assinaturas
- Financeiro
- Uso da plataforma (trafego/uso IA)

### 3.2 Admin do espaco
Menus:
- Dashboard
- Pedidos
- Comandas
- Produtos
- Clientes
- Entregas
- Relatorios
- Configuracoes
- Usuarios e permissoes

### 3.3 Caixa
Menus:
- PDV/Pedidos
- Comandas
- Clientes
- Entregas

### 3.4 Entregador
Menus:
- Minhas entregas
- Historico

## 4. Mapa de telas (MVP)
1. Login (com identificacao por espaco)
2. Seletor de espaco (somente para superadmin)
3. Dashboard operacional
4. Tela de pedidos (fila unica)
5. Novo pedido (consumo/comanda/whatsapp)
6. Detalhe do pedido
7. Comandas ativas
8. Fechamento de comanda
9. Catalogo de produtos
10. Cadastro/edicao de produto
11. Clientes
12. Entregas e atribuicao
13. Configuracao WhatsApp (instancia + conexao)
14. Configuracao de impressao/cupom
15. Horario de funcionamento
16. Relatorios e metas
17. Usuarios e papeis

## 5. Tela a tela - comportamento esperado
## 5.1 Tela Pedidos (fila unica)
Elementos:
- Filtros: canal, status, periodo, prioridade.
- Cards/lista de pedidos com cliente, canal, horario, status, valor.
- Acao rapida: priorizar (admin/caixa), abrir, cancelar, reimprimir.

Interacoes:
- Clique em `Novo pedido` abre modal/tela de criacao.
- Clique em pedido abre detalhe lateral (drawer) com itens e acoes.
- Mudanca de status via botao principal.

Estados de UI:
- vazio: "Nenhum pedido no filtro atual"
- erro: "Falha ao carregar pedidos"
- loading: skeleton de lista

## 5.2 Novo pedido
Passos:
1. Selecionar canal (`consumo`, `comanda`, `whatsapp`).
2. Selecionar/criar cliente (obrigatorio).
3. Adicionar itens + observacoes por item/pedido.
4. Definir taxa entrega quando aplicavel.
5. Salvar como `Em analise` e/ou `Aprovar e enviar para producao`.

Validacoes:
- Nao permitir finalizar sem cliente.
- Nao permitir produto indisponivel.

## 5.3 Comandas
Elementos:
- Lista de comandas abertas.
- Campo livre de mesa.
- Acao: transferir itens entre comandas.
- Acao: fechar comanda com divisao.

Fechamento:
- Dividir por igual ou por valor informado por pessoa.
- Nao fechar sem total pago.

## 5.4 Produtos
Elementos:
- Lista por categoria.
- Busca por nome.
- Toggle de disponibilidade.
- Formulario com variacoes/adicionais e campos obrigatorios.

Cadastro:
- Ate 2 fotos por produto (20MB cada).

## 5.5 Entregas
Elementos:
- Pedidos prontos para saida.
- Seletor de entregador.
- Botao `Atribuir`.

Comportamento:
- Ao atribuir, sistema dispara mensagem com dados de entrega ao entregador.

## 5.6 Configuracoes
Subsecoes:
- Tema e logo do espaco.
- Horario de funcionamento.
- Impressao/cupom (vias, layout basico).
- WhatsApp (instancia, status conexao, reconectar).
- Usuarios e papeis.

## 5.7 Relatorios
Elementos:
- KPIs em cards no topo.
- Graficos por periodo/canal/produto/pagamento.
- Metas e status (atingida, em risco, nao atingida).
- Alertas automaticos exibidos em painel.

## 6. Componentes de UI obrigatorios
- Header com identificacao de espaco.
- Sidebar por perfil.
- Tabela/lista com filtros e paginacao.
- Drawer de detalhe de pedido.
- Modal de confirmacao para cancelamento/estorno.
- Badge de status de pedido.
- Toast para sucesso/erro.

## 7. Regras de permissao na interface
- Esconder acoes nao autorizadas por perfil.
- Estorno visivel somente para admin.
- Priorizar/cancelar visivel para admin e caixa.
- Reimprimir visivel para admin e caixa.

## 8. Copys operacionais sugeridas
- "Novo pedido"
- "Enviar para producao"
- "Marcar como pronto"
- "Saiu para entrega"
- "Finalizar pedido"
- "Nao foi possivel concluir a acao"

## 9. Entregaveis esperados do Lovable
- Prototipo navegavel de todas as telas do mapa.
- Componentes reutilizaveis para pedidos/comandas/produtos.
- Layout responsivo desktop + mobile.
- Variaveis visuais para tema por espaco (logo/cor).
- Hand-off de estados de componente para integracao com APIs.

## 10. Criterios de pronto para interface
- Navegacao por perfil funcionando sem mostrar acoes indevidas.
- Fluxo completo de pedido na UI: criar -> editar -> fechar.
- Fluxo de comanda na UI: abrir -> adicionar itens -> fechar sem pendencia.
- Tela de WhatsApp: status da instancia + reconectar + indicador de IA ativa/pausada.
- Todas as telas principais com estado de erro e vazio.
