# Escopo MVP v1 - Sistema Delivery/PDV Multi-tenant

## Leitura rapida para implementacao
- Este documento define o escopo do MVP (o que entra e o que nao entra).
- Para telas e componentes, usar `02_handoff_lovable_frontend.md`.
- Para APIs e dados, usar `03_backend_banco_api.md` e `05_whatsapp_agente_ia_n8n.md`.

## 1. Objetivo do MVP
Entregar um sistema SaaS para restaurantes/lanchonetes com operacao de pedidos por consumo local, comanda, retirada e WhatsApp, com impressao termica, pagamento e gestao basica.

## 2. Modelo de negocio e tenancy
- Plataforma multi-tenant com `superadmin` e `espacos`.
- Cada `espaco` representa um comercio e tem isolamento de dados.
- Usuario pertence a apenas 1 espaco.
- Superadmin pode criar espaco, criar usuario no espaco, inativar/excluir usuario do espaco.
- White-label por espaco: logo e cor de tema.
- Trial de 7 dias.
- Assinatura:
  - sem IA: valor fixo,
  - com IA: franquia + excedente por uso.
- Bloqueio total por inadimplencia.
- SLA alvo inicial: `99,5%`.

## 3. Perfis e permissoes (MVP)
- `admin (dono)`
- `caixa`
- `entregador`

Regras-chave:
- Cancelar pedido: admin e caixa.
- Reimprimir: admin e caixa.
- Estornar pagamento: apenas admin.
- Sessao por dispositivo + logout remoto.

## 4. Canais e origem de pedido
- `consumo` (balcao)
- `comanda` (com campo livre para mesa)
- `whatsapp` (integracao API nao oficial)

Regras-chave:
- Pedido sempre exige cliente identificado (nome, sobrenome, telefone).
- Cliente recorrente identificado por telefone.
- Sem orcamento: pedido nasce direto como pedido.
- Pedido agendado permitido.
- Fora do horario de funcionamento nao aceita novos pedidos.
- Prioridade manual de fila: admin e caixa.

## 5. Modulos IN (entram no MVP)
- Gestao de pedidos (criar, editar antes de producao, cancelar, finalizar).
- Comandas (abertura, transferencia de itens, divisao de conta por pessoa/valor).
- Impressao termica automatica (sem KDS).
- Cadastro de produtos e cardapio.
- Pagamento com foco em PIX.
- Entrega propria com atribuicao de entregador.
- Configuracao de WhatsApp (instancia + conexao numero por espaco).
- Relatorios e dashboard em tempo real.
- Metas e alertas basicos.
- Auditoria de alteracoes de preco/cardapio.

## 6. Modulos OUT (fora do MVP)
- KDS (tela de cozinha).
- Operacao offline.
- Emissao fiscal (NFC-e/SAT).
- Integracao TEF/POS nativa.
- Programa de fidelidade e cupons.
- Campanhas (SMS/e-mail/marketing).
- Multiunidade/franquias por espaco.
- Roteirizacao automatica de multiplas entregas.
- Exportacao CSV/Excel/PDF.
- DRE simplificada.

## 7. Fluxo operacional base
### 7.1 Status do pedido
Status base para MVP:
`Em analise -> Em producao -> Pronto -> Finalizado`

Status complementar para entrega:
`Saiu para entrega`

Status excepcional:
`Cancelado`

Observacao: o status informado no discovery como `Pronto para entrega` foi normalizado para `Pronto` para atender todos os canais.

### 7.2 Regras de edicao
- Pode editar pedido se ainda nao entrou em producao.
- Nao fecha comanda sem pagamento total.

### 7.3 Regras de impressao
- WhatsApp normal: 2 vias (cozinha + balcao).
- Retirada: 3 vias (cozinha + balcao + cliente).
- Sem cupom de cancelamento automatico.

## 8. Produtos e cardapio
- Estrutura: categorias > produtos > variacoes/adicionais.
- Escolhas obrigatorias por produto suportadas.
- Combos suportados.
- Sem preco por canal/horario (exceto taxa de entrega).
- Indisponibilidade manual (inclusive para bot).
- Midia: ate 2 fotos por produto, 20MB por foto.

## 9. Pagamentos e caixa
- PIX como principal forma no MVP.
- Multiplo pagamento apenas no consumo/balcao.
- WhatsApp: foco em um pagamento por pedido (PIX no fluxo do sistema).
- Troco obrigatorio.
- Sem fechamento de caixa por turno no MVP (V2).
- Conciliacao manual.
- Sem fiado/pendente no fechamento do pedido.

## 10. Entrega e logistica
- Entrega propria.
- Taxa por bairro (com opcao futura de km/fixa).
- Sem pedido minimo.
- Tempo estimado fixo por tipo (retirada x entrega).
- Entregador sem app: recebe mensagem com dados da entrega.
- Sem rastreio por link para cliente.

## 11. CRM e LGPD
- Cliente obrigatorio no pedido.
- Multiplos enderecos por cliente.
- Blacklist de cliente.
- Exibicao operacional dos 3 ultimos pedidos.
- Consentimento e exclusao de dados LGPD previstos.

## 12. Relatorios e monitoramento (MVP)
KPIs obrigatorios:
- Vendas totais.
- Pedidos por status e canal.
- Ticket medio.
- Tempo medio de preparo.
- Tempo medio total do pedido.
- Top produtos vendidos.
- Taxa de cancelamento.
- Receita de entrega separada.

Outros itens:
- Dashboard em tempo real.
- Alertas automaticos.
- Metas com acompanhamento.
- Visao superadmin de uso de plataforma e uso de API/IA.

## 13. Integracoes iniciais
- WhatsApp API nao oficial.
- QZ Tray/impressao termica automatica.
- n8n padrao compartilhado para eventos multi-tenant.
- Asaas como candidato para assinatura/cobranca.

## 14. Pendencias que seguem abertas
- Definir politica de backup e retencao.
- Definir unidade exata de cobranca do uso de IA.
- Definir detalhe final de identificador de espaco (slug/path/token) no login.
- Definir se area de entrega por mapa/poligono entrara em fase futura.
