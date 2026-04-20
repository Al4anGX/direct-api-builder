# Backend, Banco e APIs - MVP v1

## 1. Objetivo
Definir arquitetura logica para implementacao de backend, banco e contratos de API com foco em multi-tenant, operacao de pedidos e integracoes.

## 2. Diretrizes arquiteturais
- Multi-tenant com isolamento por `espaco_id` em todas as entidades de dominio.
- RBAC por perfil de usuario.
- Auditoria de eventos e alteracoes sensiveis.
- API REST como base.
- Integracoes assicronas por fila/eventos quando aplicavel.

## 3. Entidades principais (modelo logico)
## 3.1 Plataforma
- `espacos`
- `planos`
- `assinaturas`
- `faturas`
- `usuarios`
- `usuarios_espaco`
- `roles`
- `permissoes`

## 3.2 Operacao
- `clientes`
- `enderecos_cliente`
- `produtos`
- `categorias`
- `produto_variacoes`
- `produto_adicionais`
- `combos`
- `comandas`
- `pedidos`
- `pedido_itens`
- `pedido_status_historico`
- `pagamentos`
- `entregadores`
- `entregas`
- `impressao_jobs`

## 3.3 Governanca
- `auditoria_eventos`
- `metas`
- `alertas`
- `configuracoes_espaco`
- `integracoes_whatsapp`
- `agente_ia_config` (estrutura inicial, escopo detalhado em fase dedicada)

## 4. Campos essenciais por entidade
## 4.1 pedidos
- id
- espaco_id
- cliente_id
- canal (`consumo`, `comanda`, `whatsapp`)
- status
- prioridade_manual (bool)
- valor_subtotal
- valor_entrega
- valor_total
- observacao_geral
- criado_por
- criado_em

## 4.2 comandas
- id
- espaco_id
- referencia_mesa_livre
- status (`aberta`, `fechada`)
- total_atual

## 4.3 produtos
- id
- espaco_id
- categoria_id
- nome
- descricao
- preco_base
- ativo
- disponivel
- exige_escolha_obrigatoria

## 4.4 pagamentos
- id
- espaco_id
- pedido_id
- metodo (`pix`, `dinheiro`, `credito`, `debito`)
- valor
- status (`pendente`, `aprovado`, `estornado`)
- conciliado (bool)
- conciliado_em

## 4.5 entregas
- id
- espaco_id
- pedido_id
- entregador_id
- tipo_entregador (`proprio`)
- status (`atribuida`, `saiu`, `entregue`, `falha`)
- taxa_entrega

## 5. Status e maquina de estados
Fluxo base:
- `Em analise` -> `Em producao` -> `Pronto` -> `Finalizado`

Fluxo de entrega:
- `Pronto` -> `Saiu para entrega` -> `Finalizado`

Fluxo de excecao:
- qualquer estado permitido -> `Cancelado` (com trilha de auditoria)

Regra:
- Edicao permitida ate antes de `Em producao`.

## 6. API REST (contratos base)
## 6.1 Auth e contexto
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

## 6.2 Espacos e usuarios
- `POST /superadmin/espacos`
- `GET /superadmin/espacos`
- `POST /superadmin/espacos/{id}/usuarios`
- `PATCH /superadmin/espacos/{id}/usuarios/{userId}` (inativar/reativar)

## 6.3 Produtos
- `GET /produtos`
- `POST /produtos`
- `PATCH /produtos/{id}`
- `PATCH /produtos/{id}/disponibilidade`

## 6.4 Clientes
- `GET /clientes?telefone=`
- `POST /clientes`
- `GET /clientes/{id}`
- `POST /clientes/{id}/enderecos`
- `PATCH /clientes/{id}/blacklist`

## 6.5 Pedidos e comandas
- `GET /pedidos`
- `POST /pedidos`
- `GET /pedidos/{id}`
- `PATCH /pedidos/{id}`
- `POST /pedidos/{id}/priorizar`
- `POST /pedidos/{id}/status`
- `POST /pedidos/{id}/cancelar`
- `POST /pedidos/{id}/reimprimir`

- `GET /comandas`
- `POST /comandas`
- `POST /comandas/{id}/itens/transferir`
- `POST /comandas/{id}/fechar`

## 6.6 Pagamentos
- `POST /pedidos/{id}/pagamentos`
- `POST /pagamentos/{id}/estornar`
- `POST /pagamentos/{id}/conciliar`

## 6.7 Entregas
- `GET /entregas`
- `POST /entregas/{pedidoId}/atribuir`
- `POST /entregas/{id}/status`

## 6.8 Relatorios
- `GET /relatorios/kpis`
- `GET /relatorios/pedidos`
- `GET /relatorios/produtos`
- `GET /relatorios/entregas`
- `GET /relatorios/metas`

## 6.9 WhatsApp e integracoes
- `POST /integracoes/whatsapp/instancias`
- `POST /integracoes/whatsapp/instancias/{id}/conectar`
- `GET /integracoes/whatsapp/instancias/{id}/status`

## 7. Eventos internos (para n8n e automacoes)
- `pedido.criado`
- `pedido.aprovado`
- `pedido.status_alterado`
- `pedido.pronto`
- `pedido.saiu_entrega`
- `pedido.finalizado`
- `pagamento.aprovado`
- `pagamento.estornado`
- `entrega.atribuida`

Observacao: no MVP, eventos podem ser publicados em um barramento interno unico multi-tenant para consumo de um n8n compartilhado.

## 8. Regras de seguranca e compliance
- Toda query com filtro obrigatorio por `espaco_id`.
- Auditoria para: cancelamento, estorno, alteracao de preco, reimpressao.
- Consentimento LGPD e fluxo de exclusao de dados de cliente.
- Segredo de integracao (tokens/chaves) armazenado criptografado.

## 9. Impressao termica
- Gerar `impressao_jobs` no evento de pedido aprovado.
- Politica de vias:
  - WhatsApp normal: cozinha + balcao.
  - Retirada: cozinha + balcao + cliente.
- Reimpressao via endpoint com permissao de admin/caixa.

## 10. Performance e operacao
- Dashboard com atualizacao proxima de tempo real.
- Paginacao padrao em listagens.
- Logs estruturados por `espaco_id`.
- Monitoramento de erros por modulo.

## 11. OpenAPI e padrao de resposta
Padrao sugerido:
```
{
  "success": true,
  "data": {},
  "error": null,
  "meta": {
    "request_id": "..."
  }
}
```

## 12. Pendencias tecnicas abertas
- Politica de backup/retencao.
- Definicao final da unidade de cobranca do agente de IA.
- Definicao tecnica final do identificador de espaco no login (slug/path/token).
- Detalhar API publica para terceiros (escopo, auth, rate limit).
