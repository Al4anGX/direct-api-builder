# Roadmap de Implantacao - MVP v1

## 1. Objetivo
Definir ordem de execucao para sair de discovery para MVP operando em ambiente real com baixo retrabalho.

## 2. Ordem macro aprovada
1. Pedidos
2. Cadastro de produtos
3. Pagamento
4. Configuracao de WhatsApp e agente de IA
5. Configuracao geral do restaurante (cupom + impressora)
6. Horario de funcionamento
7. Usuarios e tipos

## 3. Fases sugeridas
## Fase 0 - Fundacao tecnica (1 sprint)
- Estrutura multi-tenant.
- Auth + RBAC base.
- Modelo de dados inicial.
- Auditoria basica.
- Setup de observabilidade.

Criterio de saida:
- login funcional por espaco,
- isolamento de dados validado,
- perfis admin/caixa/entregador ativos.

## Fase 1 - Core operacional de pedidos (1-2 sprints)
- CRUD de cliente basico.
- Criacao/edicao/cancelamento de pedido.
- Fluxo de status.
- Fila unica com filtros.
- Prioridade manual por admin/caixa.

Criterio de saida:
- pedido completo roda ponta a ponta ate `Finalizado`.

## Fase 2 - Comandas e produtos (1 sprint)
- Comanda com campo livre de mesa.
- Transferencia de itens.
- Fechamento com divisao por pessoa/valor.
- Catalogo de produtos com variacoes/adicionais.
- Indisponibilidade manual.

Criterio de saida:
- operacao de consumo local sem planilha externa.

## Fase 3 - Pagamento e entrega propria (1 sprint)
- PIX (chave/tipo/banco por espaco).
- Regras de multiplo pagamento no balcao.
- Troco.
- Atribuicao de entregador e status de entrega.
- Registro separado de receita de entrega.

Criterio de saida:
- pedido de entrega e retirada operam com pagamento e finalizacao.

## Fase 4 - Impressao termica e configuracoes (1 sprint)
- Integracao de impressao (QZ Tray ou equivalente).
- Regras de vias por canal.
- Reimpressao por permissao.
- Horario de funcionamento.
- Layout basico de cupom.

Criterio de saida:
- pedidos aprovados imprimem automaticamente conforme regra.

## Fase 5 - Relatorios, metas e alertas (1 sprint)
- KPIs do MVP.
- Dashboard em tempo real.
- Metas.
- Alertas automaticos.
- Auditoria de alteracao de preco/cardapio.

Criterio de saida:
- gestor acompanha operacao sem consulta manual externa.

## Fase 6 - Integracao WhatsApp e preparacao go-live (1 sprint)
- Criar instancia WhatsApp por espaco.
- Conectar numero e validar status de conexao.
- Fluxo de pedido via WhatsApp.
- Ajustes finais de permissao e UX.
- Checklist de producao.

Criterio de saida:
- primeiro espaco piloto operando em ambiente real.

## 4. Dependencias criticas
- Definicao final do identificador de espaco no login.
- Definicao da politica de backup e retencao.
- Definicao de unidade de cobranca do agente IA (para modulo comercial).
- Definicao da estrategia de API publica para terceiros.

## 5. Plano de validacao do MVP
- Piloto com 1 restaurante real.
- Janela de validacao: 2 semanas.
- Metricas de sucesso:
  - 95%+ de pedidos sem intervencao manual externa.
  - tempo medio de abertura de pedido menor que 60s.
  - falha de impressao abaixo de 2%.
  - fechamento financeiro diario sem divergencia critica.

## 6. Riscos e mitigacao
- Risco: instabilidade da API WhatsApp nao oficial.
  - Mitigacao: retry, monitoramento e fallback manual.
- Risco: erros de impressao local.
  - Mitigacao: fila de impressao + reimpressao simples.
- Risco: escopo crescer com IA cedo demais.
  - Mitigacao: separar backlog IA e manter MVP operacional primeiro.

## 7. Go-live checklist
- Espaco criado e ativo.
- Usuarios e papeis configurados.
- Produtos cadastrados e disponiveis.
- Chave PIX cadastrada.
- Impressora testada por canal.
- Horario de funcionamento ativo.
- WhatsApp conectado.
- Metas e alertas configurados.
- Equipe treinada no fluxo de pedido/comanda/entrega.

## 8. Proxima fase (V2)
- Fechamento de caixa por turno/operador.
- KDS opcional.
- Exportacoes (CSV/Excel/PDF).
- Integracao fiscal.
- Multiunidade/franquias.
- Conciliacao automatica.
