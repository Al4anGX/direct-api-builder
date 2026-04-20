# Levantamento de Requisitos - Sistema Delivery/PDV (Multi-tenant)

## Objetivo
Consolidar todas as decisoes e respostas de discovery para evitar ambiguidades no desenho do produto.

## Contexto inicial (definido)
- O sistema tera um `superadmin`.
- O superadmin pode criar `espacos`.
- Cada `espaco` representa um comercio (ex.: restaurante, lanchonete).
- Cada comercio usa as funcionalidades do sistema dentro do seu proprio ambiente.
- O foco inicial e mapear funcionalidades macro e micro por meio de perguntas e respostas.

## Registro de decisoes

### Sessao 001
- Usuario informou a arquitetura inicial multi-tenant com superadmin e espacos (comercios).
- Usuario solicitou que cada resposta seja registrada neste arquivo para consulta futura e resolucao de ambiguidades.

### Sessao 002 - Respostas consolidadas (Blocos 1 a 4 parcial)

#### Bloco 1 - Estrutura do negocio (multi-tenant)
- `Espaco` e `workspace` sao a mesma entidade (preferencia por nome simples para usuario final).
- Superadmin gerencia todos os espacos, com escopo inicial de: criar espacos; criar usuarios no espaco; excluir/inativar usuarios por espaco.
- Usuario pertence a apenas 1 espaco (sem multi-espaco por usuario).
- Sem subdominio por espaco no inicio; cada espaco tera identificador proprio (path/token) para segregacao.
- White-label parcial por espaco: logo e cor de tema configuraveis pelo admin do espaco.
- Superadmin tera visao financeira de assinaturas (receitas de assinatura).
- Isolamento de dados por espaco e obrigatorio (seguranca + LGPD).
- Espaco pode ser inativado (ex.: inadimplencia) sem exclusao imediata de dados.
- Superadmin nao cadastra produtos; produtos ficam sob responsabilidade do admin/usuarios do espaco com papeis apropriados.
- Onboarding inicial guiado e desejavel.

#### Bloco 2 - Plano, cobranca e limites
- Modelo comercial inicial: assinatura.
- Sem agente de IA: cobranca fixa.
- Com agente de IA: franquia de uso + excedente por uso apos limite.
- Trial de 7 dias.
- Inadimplencia: bloqueio total do espaco ao vencer.
- Gateway sugerido para avaliacao inicial: `Asaas`.
- Sem cupom/desconto no inicio.
- Upgrade/downgrade nao automatico; alteracao apenas sob solicitacao do cliente.
- Regra de consumo: alerta em 80% do limite; ao atingir limite, cobrar excedente por uso.
- Necessario historico financeiro para o cliente emitir comprovantes/recibos de pagamento.
- Diferencas detalhadas entre planos e metricas de uso de IA: ainda em definicao.

#### Bloco 3 - Perfis e permissoes
- Papeis minimos iniciais: `dono (admin)`, `caixa`, `entregador`.
- Modelo de autorizacao: `RBAC`.
- Cancelamento de pedido: permitido para `admin` e `caixa`.
- Descontos: fora do MVP inicial (avaliar em upgrade futuro).
- Estorno: somente `admin`.
- Reimpressao: `admin` e `caixa`.
- 2FA nao obrigatorio no inicio.
- Sessao por dispositivo e logout remoto: obrigatorios.
- Confirmacao adicional por senha de gerente: inicialmente apenas para estorno.
- Trilha de auditoria: desejavel/fortemente recomendada.

#### Bloco 4 - Canais de venda e origem do pedido (parcial)
- Canais MVP informados: `consumo` (balcao), `mesa`, `whatsapp`.
- WhatsApp com integracao via API/bot.
- Identificacao automatica de cliente recorrente por telefone: sim.
- Pedido nao nasce como orcamento; nasce diretamente como pedido.
- Todo pedido exige cliente identificado (nome + telefone).
- Fila unica de pedidos com filtros: sim.
- SLA por canal para relatorios: sim.
- Fora de horario nao permite novos pedidos.
- Pedido agendado para horario futuro: sim.
- Prioridade manual de pedido habilitada: `admin` e `caixa` podem priorizar pedidos na fila operacional.

### Sessao 003 - Complemento
- Confirmado: na prioridade manual de pedidos (furar fila), os papeis autorizados sao `admin` e `caixa`.

### Sessao 004 - Respostas consolidadas (Blocos 5 e 6)

#### Bloco 5 - Fluxo operacional (PDV, comanda, retirada, entrega)
- Consumo local sera por `comanda` com campo livre para mesa (sem cadastro fixo de mesas).
- Comanda individual por cliente na mesma mesa: permitido.
- Transferencia de itens entre comandas: permitida.
- Divisao de conta: por pessoa; no fechamento pode dividir por igual ou valor informado por cada cliente.
- Comanda nao fecha sem pagamento total; pagamento parcial ocorre apenas no contexto de divisao no fechamento.
- Edicao de pedido apos envio: permitida se ainda nao entrou efetivamente em producao (caixa avalia janela de tempo).
- Fluxo de status definido: `Em analise` -> `Em producao` -> `Pronto para entrega` -> `Finalizado`.
- Retirada sem token/PIN; confirmacao por nome no cupom/pedido.
- Despacho de entrega suporta entregador interno e externo.
- Entregador interno: cadastro com nome e numero; randomizacao de corridas.
- Entregador nao aceita/rejeita corrida; apenas recebe atribuicao.
- Metricas de tempo por etapa: desejavel (para indicadores de producao).
- Nao incluir modulo de pizzaria/metade-metade neste momento.
- Observacoes por item e por pedido: ambas necessarias.
- PDV com pedido rapido/produtos favoritos: necessario.
- Fila de espera: necessaria.

#### Bloco 6 - Cardapio, produtos e preco
- Estrutura: `categorias > produtos > variacoes/adicionais`.
- Tamanhos com precos diferentes: suportado.
- Limite min/max em grupos de adicionais: nao obrigatorio no inicio.
- Escolhas obrigatorias por produto (ex.: ponto da carne): suportado e configurado no cadastro.
- Combos/promocoes: suportado se o estabelecimento quiser criar.
- Sem preco por canal; diferenca apenas por taxa de entrega quando aplicavel.
- Sem preco por dia/horario no inicio.
- Indisponibilidade temporaria manual de produto: necessaria (inclui pausa de venda via bot).
- Estoque no MVP: nao; apenas indisponibilidade manual.
- Midia do produto: ate 2 fotos por produto, limite de 20MB cada.
- Multiidioma: nao.
- Alergenicos/nutricional: nao no inicio.
- Taxas configuraveis por admin do espaco: taxa de entrega e taxa de servico (com possibilidade de remover no fechamento conforme regra legal).

#### Pontos de atencao detectados
- O status `Pronto para entrega` pode gerar ambiguidade para pedidos de consumo local/retirada; avaliar nome neutro (ex.: `Pronto`) com comportamento por canal.
- Confirmar futuramente regra exata de `randomizacao` de entregas (round-robin, fila, disponibilidade, distancia).
- Validar limite de upload (2x20MB por produto) com impacto em custo/armazenamento e performance em rede movel.

#### Pontos de atencao detectados
- Foi mencionada a ideia de `path/token` por espaco para login/segregacao; definir modelo tecnico (slug, codigo do espaco, URL unica, etc.) para evitar ambiguidade de UX e seguranca.
- Confirmar se `mesa` representa consumo local separado de `consumo` (balcao), mantendo ambos como canais distintos no produto.

### Sessao 005 - Respostas consolidadas (Bloco 7 parcial)

#### Bloco 7 - Cozinha, producao e impressao
- Operacao com impressora termica (referencia de prototipo com `QZ Tray` para impressao automatica).
- Regras de vias de impressao:
  - Pedido normal via WhatsApp: 2 vias (`cozinha` + `balcao`).
  - Pedido retirada: 3 vias (`cozinha` + `balcao` + `cliente`).
- Reimpressao sem exigencia obrigatoria de motivo.
- Cozinha atualiza status no sistema; impressao ocorre quando pedido e aprovado.
- Controle de itens de saida rapida/parciais no pedido: necessario (ex.: refrigerante lata pode sair antes).
- Criterio automatico de prioridade da fila de cozinha: nao definido como obrigatorio no momento (mantem fluxo simples, com apoio da prioridade manual ja definida para admin/caixa).
- Sem alerta automatico de atraso de preparo no inicio.
- Pedido cancelado apos impressao nao precisa gerar cupom de cancelamento.
- Cupom de producao sem QR code/codigo de barras no inicio.

#### Pendencias especificas do Bloco 7
- Aviso sonoro/visual de pedido pronto: nao necessario no inicio.
- Estrategia de cozinha definida: operacao com `impressao termica apenas` (sem KDS).

### Sessao 006 - Fechamento do Bloco 7
- Confirmado: fluxo de cozinha sera exclusivamente por impressao (sem KDS).
- Confirmado: nao havera alerta sonoro/visual de pedido pronto no MVP.

### Sessao 007 - Respostas consolidadas (Bloco 8 parcial)

#### Bloco 8 - Pagamentos, caixa e fiscal
- Pagamento MVP principal: `PIX` (espaco cadastra chave, tipo e banco).
- Multiplas formas no mesmo pedido: permitido apenas em `balcao/consumo`.
- Regra por canal:
  - `WhatsApp`: apenas um pagamento por pedido e foco em PIX no fluxo do sistema.
  - `Credito/debito` em entrega: considerado operacionalmente via maquininha levada pelo entregador (fora de integracao inicial).
- Controle de troco: obrigatorio.
- Abertura/fechamento de caixa por turno/operador: adiado para `V2`.
- Sangria/suprimento com justificativa: nao obrigatorio no MVP.
- Estorno/cancelamento financeiro: permitido apos o dia; alternativa de converter em credito.
- Emissao fiscal (NFC-e/SAT): depois do MVP.
- Integracao TEF/POS no inicio: nao.
- Taxas de adquirente em relatorio de margem: nao no inicio.
- Taxa de servico/gorjeta como item separado no caixa: nao no inicio.
- Pedido nao pode ser finalizado sem pagamento (sem fiado/pendente).

#### Pendencias especificas do Bloco 8
- Conciliacao de pagamentos no MVP: `manual`.

### Sessao 008 - Fechamento do Bloco 8
- Confirmado: conciliacao de pagamentos sera manual no MVP para simplificar operacao inicial.

### Sessao 009 - Respostas consolidadas (Bloco 9 parcial)

#### Bloco 9 - Entrega e logistica
- Modalidade inicial de entrega: `propria` (sem terceirizada no MVP).
- Regra de taxa de entrega: principal por `bairro`, com opcao configuravel para `km/raio` ou `fixa`.
- Pedido minimo para entrega: nao.
- Tempo estimado: fixo por tipo de atendimento, com tempos distintos para `retirada` e `entrega` (nao por regiao).
- Roteirizacao automatica de multiplas entregas: fora do MVP (usuario organiza manualmente).
- Prova de entrega (foto/assinatura/PIN): nao no inicio.
- Entregador sem app proprio no MVP; quando atribuido, recebe mensagem com dados do pedido e endereco.
- Relatorios devem separar valor de vendas e valor de taxa/servico de entrega.
- Cliente nao acompanha trajeto por link; apenas recebe status de `saiu para entrega`.

#### Pendencias especificas do Bloco 9
- Esclarecer item 95 (area de entrega por mapa/poligono) para confirmar se fica fora do MVP.

### Sessao 010 - Respostas consolidadas (Bloco 10)

#### Bloco 10 - CRM, cliente e fidelizacao
- Cadastro de cliente: obrigatorio.
- Campos obrigatorios de cliente: `nome`, `sobrenome`, `telefone`.
- Historico por cliente: manter apenas os `3 ultimos pedidos` no fluxo operacional.
- Programa de fidelidade (pontos/cashback): nao no MVP.
- Cupons promocionais: nao no MVP.
- Campanhas (WhatsApp/SMS/e-mail): nao no MVP.
- Bloqueio/blacklist de cliente: necessario.
- LGPD: necessario prever consentimento e fluxo de exclusao de dados.
- Cliente com multiplos enderecos salvos: sim.
- Classificacao VIP: nao no MVP.

#### Observacao de modelagem
- Embora a visualizacao operacional mostre os 3 ultimos pedidos, avaliar manter historico completo em banco para auditoria/relatorios/LGPD, com exibicao limitada na interface.

### Sessao 011 - Respostas consolidadas (Bloco 11)

#### Bloco 11 - Relatorios, indicadores e gestao
- KPI obrigatorios (a definir com sugestao inicial):
  - Total de vendas (dia/semana/mes).
  - Quantidade de pedidos por status e por canal.
  - Ticket medio.
  - Tempo medio de preparo.
  - Tempo medio total do pedido (abertura ate finalizacao/entrega).
  - Top produtos vendidos.
  - Taxa de cancelamento.
  - Receita de entrega (separada da venda de produtos).
- Relatorios no MVP: visualizacao no sistema com filtros por `canal`, `produto`, `forma de pagamento` e demais filtros ja definidos no discovery.
- Exportacao (CSV/Excel/PDF): fora do MVP.
- DRE simplificada: fora do MVP.
- Ranking de produtos e horario de pico: necessario.
- Visao do superadmin entre espacos: foco em metricas de uso/plataforma (trafego, uso de API de chat/IA), e nao benchmarking comercial detalhado neste momento.
- Dashboard em tempo real: necessario.
- Alertas automaticos: necessario.
- Metas de vendas com acompanhamento: necessario.
- Auditoria de alteracao de precos/cardapio: necessaria.

#### Pendencias especificas do Bloco 11
- Confirmar conjunto final de KPIs obrigatorios do MVP (base sugerida nesta sessao).

### Sessao 012 - Respostas consolidadas (Bloco 12)

#### Bloco 12 - Integracoes, tecnologia e operacao
- KPIs sugeridos para o MVP foram aceitos pelo usuario.
- Integracao inicial prioritaria: `WhatsApp` (API nao oficial), incluindo fluxo dentro do sistema para:
  - criar instancia,
  - conectar numero,
  - operar por espaco.
- Necessidade futura/mapeada: modulo de configuracao do agente de IA (prompt e parametros), com discussao dedicada em sessao separada.
- API publica para terceiros: sim.
- Webhooks dedicados do produto: nao como foco inicial; eventos ja serao tratados por fluxo `n8n` padrao.
- Requisito arquitetural: n8n multi-tenant/shared para varios restaurantes, evitando fluxo exclusivo por restaurante.
- Multiunidade/franquias por espaco: fora do MVP (feature futura).
- Operacao offline: nao.
- Backup/retencao: necessario, mas ainda pendente de definicao detalhada.
- SLA de disponibilidade: pendente de definicao (usuario solicitou esclarecimento do conceito).
- Suporte de dispositivos: responsivo para desktop e celular.
- Localizacao inicial: apenas `pt-BR`.
- Ordem de prioridade de construcao (macro):
  - `Pedidos`.
  - `Cadastro de produtos`.
  - `Pagamento`.
  - `Configuracao de WhatsApp e agente de IA`.
  - `Configuracao geral do restaurante` (layout de cupom, conexao com impressora termica).
  - `Configuracao de horario de funcionamento`.
  - `Usuarios e tipos/permissoes`.

#### Pendencias especificas do Bloco 12
- Definir SLA alvo de disponibilidade.
- Definir politica de backup e retencao (frequencia, janela, restauracao).
- Abrir sessao dedicada para escopo do modulo de agente de IA.

### Sessao 013 - Direcionamento de documentacao de execucao
- Usuario aprovou SLA inicial sugerido de `99,5%` para MVP.
- Usuario solicitou criacao de 4 documentos para acelerar execucao:
  - Escopo MVP v1.
  - Handoff de frontend (Lovable) com telas, menus e comportamento.
  - Documento tecnico de backend/banco/APIs.
  - Roadmap de implantacao.
- Estrategia aprovada: usar Lovable para construcao de telas e UX, e concentrar aqui as definicoes de logica, dados, backend e integracoes.

### Sessao 014 - Definicao de arquitetura WhatsApp + IA + n8n
- Confirmada arquitetura operacional:
  - sistema recebe webhook,
  - sistema enriquece/mastiga contexto,
  - sistema envia payload pronto para n8n,
  - n8n executa agente com tools,
  - n8n envia resposta final ao cliente.
- Usuario prefere manter logica de tools no n8n (AI Agent node) com APIs internas fixas e bem descritas no system prompt.
- Criado documento dedicado `05_whatsapp_agente_ia_n8n.md` com:
  - arquitetura e responsabilidades,
  - tela de configuracao simplificada da IA,
  - montagem de prompt por blocos,
  - payload enriquecido backend -> n8n,
  - lista de tools fixas,
  - guardrails, fallback e observabilidade.

### Sessao 015 - Seguranca de autenticacao das tools do agente
- Definido uso de `x-api-key temporaria` por evento para chamadas de tools do agente no n8n.
- Validade da chave temporaria: `2 minutos (120s)`.
- Cada evento enviado para o n8n gera uma nova chave temporaria.
- Definido tambem um `token fixo` de integracao, visivel inicialmente apenas para superadmin.
- Regra de gate antes de enviar evento ao n8n:
  - nao enviar se espaco inativo,
  - nao enviar se modulo de agente IA bloqueado,
  - nao enviar se limite de uso atingido.
- Regra de dupla validacao:
  - mesmo com token valido, todas as tools revalidam status de espaco/modulo/limite no backend.

### Sessao 016 - Fechamento do contrato da tool criar-cliente
- Endpoint fechado: `POST /agent-tools/criar-cliente`.
- Ajustes de payload definidos:
  - `cliente.nome` unico (sem `sobrenome`),
  - `cliente.telefone` no formato numerico limpo (ex.: `551188887777`).
- `request_id` confirmado como obrigatorio e propagado em todo fluxo (webhook -> n8n -> tools -> logs).
- `numero_recebedor` confirmado no payload para auditoria/roteamento por numero de WhatsApp do restaurante.
- Usuario solicitou seguir para detalhamento do endpoint `POST /agent-tools/editar-cliente`.

### Sessao 017 - Fechamento do contrato da tool editar-cliente
- Endpoint fechado: `POST /agent-tools/editar-cliente`.
- Escopo confirmado:
  - atualiza apenas dados basicos do cliente,
  - nao altera endereco por esta API.
- Campos de atualizacao aprovados no MVP: `nome` e `telefone`.
- `telefone` segue formato numerico limpo (ex.: `5511999997777`).
- Validacoes acordadas:
  - cliente deve existir no espaco,
  - payload nao pode vir sem alteracoes,
  - telefone deve ser unico por `espaco_id` em caso de mudanca.
- Usuario aprovou e solicitou avancar para `POST /agent-tools/gerar-link-endereco`.

### Sessao 018 - Fechamento do contrato da tool gerar-link-endereco
- Endpoint fechado: `POST /agent-tools/gerar-link-endereco`.
- Decisao de arquitetura confirmada:
  - agente nao cadastra endereco diretamente,
  - agente apenas gera link,
  - cliente preenche/atualiza endereco no sistema web,
  - fluxo retorna ao agente com contexto atualizado.
- `contexto.motivo` definido como enum controlada, escolhida pelo agente conforme contexto (sem valores livres).
- Lista final de motivos aprovada para prompt e contrato da tool:
  - `primeiro_cadastro`
  - `endereco_inexistente`
  - `endereco_desatualizado`
  - `cliente_solicitou_troca`
  - `endereco_nao_atendido`
  - `reconfirmacao_endereco`
- Confirmado que os 6 cenarios entram no prompt do agente para orientar selecao do motivo.

### Sessao 019 - Fechamento da tool resolver-id
- Endpoint fechado: `POST /agent-tools/resolver-id`.
- Payload aprovado com campos: `espaco_id`, `tipo_id`, `texto_busca` (e `top_k` opcional).
- `tipo_id` aprovado para MVP com os seguintes valores:
  - `produto`
  - `adicional`
  - `variacao`
  - `categoria`
  - `bairro`
- Estrategia de busca aprovada: hibrida (exata + trigram + semantica em fallback).
- Regra operacional aprovada: em caso ambiguo, agente pede confirmacao antes de acionar APIs de pedido.

### Sessao 020 - Fechamento do fluxo de APIs de pedido do agente
- Decisao final: fluxo de pedido do agente sera consolidado em 3 APIs:
  - `POST /agent-tools/criar-pedido`
  - `POST /agent-tools/atualizar-pedido` (com `action`)
  - `POST /agent-tools/fechar-pedido`
- `criar-pedido` cria pedido em status tecnico `Rascunho` (nao entra em `Em analise` nesse momento).
- `Em analise` passa a ocorrer apenas no `fechar-pedido`.
- Confirmado que `atualizar-pedido` deve sempre retornar pedido completo atualizado com validacoes e pendencias.
- Actions aprovadas para `atualizar-pedido` e seus cenarios de uso:
  - `set_tipo_atendimento`
  - `set_forma_pagamento`
  - `set_endereco_entrega`
  - `set_observacao_geral`
  - `add_item`
  - `remove_item`
  - `update_item_quantidade`
  - `set_item_observacao`
  - `add_item_adicional`
  - `remove_item_adicional`
- Regra operacional: mesmo com mensagem do cliente contendo multiplos produtos, agente chama `add_item` um por vez.
- Regra de confiabilidade: agente deve usar `resolver-id` para IDs sensiveis quando necessario.

### Sessao 021 - Schemas por action da atualizar-pedido
- Foram definidos os schemas de `payload` para cada action da `POST /agent-tools/atualizar-pedido`.
- Actions com schema fechado:
  - `set_tipo_atendimento`
  - `set_forma_pagamento`
  - `set_endereco_entrega`
  - `set_observacao_geral`
  - `add_item`
  - `remove_item`
  - `update_item_quantidade`
  - `set_item_observacao`
  - `add_item_adicional`
  - `remove_item_adicional`
- Foi definido quais campos sao obrigatorios, opcionais e regras de validacao por action.
- Foi definido que todos os exemplos de payload por action ficam documentados em `05_whatsapp_agente_ia_n8n.md`.

### Sessao 022 - Consolidacao da lista final de tools do agente (MVP)
- Lista final mantida no MVP:
  - `POST /agent-tools/criar-cliente`
  - `POST /agent-tools/editar-cliente`
  - `POST /agent-tools/gerar-link-endereco`
  - `POST /agent-tools/resolver-id`
  - `POST /agent-tools/criar-pedido`
  - `POST /agent-tools/atualizar-pedido`
  - `POST /agent-tools/fechar-pedido`
  - `POST /agent-tools/cancelar-pedido`
  - `POST /agent-tools/listar-cardapio-disponivel`
- APIs removidas/substituidas no MVP:
  - `POST /agent-tools/adicionar-endereco` (substituida por link de endereco + sistema web)
  - `POST /agent-tools/adicionar-item-pedido` (substituida por `atualizar-pedido` + `action`)
  - `POST /agent-tools/remover-item-pedido` (substituida por `atualizar-pedido` + `action`)
  - `POST /agent-tools/atualizar-item-pedido` (substituida por `atualizar-pedido` + `action`)
  - `POST /agent-tools/confirmar-pedido` (substituida por `fechar-pedido`)

### Sessao 023 - Fechamento da tool listar-cardapio-disponivel
- Endpoint fechado: `POST /agent-tools/listar-cardapio-disponivel`.
- Funcao principal confirmada:
  - retornar cardapio oficial/disponivel do espaco para orientar conversa do agente.
- Busca por `texto_busca` definida como hibrida:
  - exata/normalizada,
  - trigram,
  - semantica (fallback).
- Decisao importante:
  - RAG nao e fonte final de preco/ID,
  - fonte final e sempre a API estruturada de cardapio.
- Cadastro de produto com `aliases` (apelidos/sinonimos) aprovado como opcional para melhorar entendimento de nomes comerciais.
  - Exemplo de uso: cliente pede "hotdog duplo" e produto oficial pode ter nome criativo.
- Confirmado que nao deve retornar catalogo completo por padrao; usar filtros e limites.

### Sessao 024 - Remocao da tool consultar-status-pedido
- Endpoint removido do conjunto de tools do agente no MVP: `POST /agent-tools/consultar-status-pedido`.
- Justificativa definida:
  - status do pedido sera enviado no proprio contexto do evento para o n8n,
  - pedidos abertos serao encerrados diariamente a meia-noite, reduzindo necessidade de consulta ativa de status no agente.
- Usuario solicitou seguir para detalhamento de `POST /agent-tools/cancelar-pedido`.

### Sessao 025 - Identificador de pedido para tools + cancelar-pedido
- Decisao aprovada: nas tools do agente, usar `numero_pedido` (sequencial do negocio) em vez de `id` interno de banco.
- Regras definidas:
  - `numero_pedido` e unico por `espaco_id`,
  - backend resolve internamente `numero_pedido` para `id` tecnico.
- Contrato de `POST /agent-tools/cancelar-pedido` fechado com:
  - identificacao por `numero_pedido`,
  - sem campo `motivo` em enum,
  - uso de `detalhe_motivo` como texto obrigatorio,
  - cancelamento permitido no MVP apenas em `Rascunho` e `Em analise`.

### Sessao 026 - Fechamento final da API fechar-pedido
- Endpoint confirmado: `POST /agent-tools/fechar-pedido`.
- Payload final aprovado sem `confirmacao_cliente`.
- Campos obrigatorios confirmados:
  - `request_id`
  - `espaco_id`
  - `origem`
  - `numero_pedido`
- `meta` mantido como opcional para rastreabilidade (`canal`, `numero_recebedor`, `numero_cliente`).
- Validacao por `numero_pedido` confirmada:
  - pedido deve existir,
  - pedido deve pertencer ao `espaco_id`.

### Sessao 027 - Fechamento final da API cancelar-pedido
- Endpoint confirmado: `POST /agent-tools/cancelar-pedido`.
- Payload final aprovado com:
  - `numero_pedido` como identificador de negocio,
  - `detalhe_motivo` obrigatorio,
  - sem `confirmacao_cliente`.
- Erros de validacao registrados para o contrato:
  - `DETALHE_MOTIVO_OBRIGATORIO`
  - `DETALHE_MOTIVO_MUITO_LONGO`
  - `NUMERO_PEDIDO_INVALIDO`
  - `PEDIDO_NAO_ENCONTRADO`
  - `PEDIDO_NAO_CANCELAVEL_STATUS`
  - `TOKEN_INVALIDO` / `TOKEN_EXPIRADO`
  - `ESPACO_INATIVO` / `MODULO_IA_BLOQUEADO` / `LIMITE_IA_ATINGIDO` / `RATE_LIMIT_EXCEDIDO`

### Sessao 028 - Matriz de erros da API atualizar-pedido por action
- Foi registrada matriz detalhada de erros por action para `POST /agent-tools/atualizar-pedido`.
- Actions contempladas:
  - `set_tipo_atendimento`
  - `set_forma_pagamento`
  - `set_endereco_entrega`
  - `set_observacao_geral`
  - `add_item`
  - `remove_item`
  - `update_item_quantidade`
  - `set_item_observacao`
  - `add_item_adicional`
  - `remove_item_adicional`
- Tambem foram definidos erros transversais comuns a todas as actions:
  - `ACTION_INVALIDA`
  - `TOKEN_INVALIDO`
  - `TOKEN_EXPIRADO`
  - `ESPACO_INATIVO`
  - `MODULO_IA_BLOQUEADO`
  - `LIMITE_IA_ATINGIDO`
  - `RATE_LIMIT_EXCEDIDO`

### Sessao 029 - Orquestracao UAZAPI + pausa de atendimento IA
- Arquitetura aprovada:
  - backend recebe webhook,
  - backend decide encaminhamento para n8n,
  - n8n fica focado em processar agente e responder cliente.
- Regra de controle de atendimento:
  - status `ia_ativa` por conversa/numero,
  - se `ia_ativa = false`, nao encaminhar para n8n.
- Regra de pausa automatica:
  - quando restaurante enviar mensagem manual para cliente, pausar IA (`ia_ativa = false`).
- Painel simples aprovado:
  - listar numeros com status de conexao e status da IA,
  - opcao de ativar IA.
- Regra de billing aprovada:
  - contabilizar apenas mensagens que passaram pela IA (`ia_ativa = true` e despacho ao n8n).
  - nao contabilizar atendimento humano/pausado.
- Usuario solicitou avancar para desenho das APIs de integracao UAZAPI (criar instancia, conectar numero, etc.).

### Sessao 030 - Fechamento inicial da criacao de instancia UAZAPI
- Regras comerciais aprovadas para instancias por plano:
  - plano basico: 1 numero/instancia,
  - plano medio: 2,
  - plano avancado: 3.
- Confirmado que `admintoken` da UAZAPI sera fixo via ambiente.
- Confirmado que webhook do n8n sera fixo via ambiente.
- Endpoint de referencia para criacao de instancia registrado (`/instance/create`).
- Estados de instancia considerados no MVP:
  - `disconnected`,
  - `connecting`,
  - `connected`.
- Erros informados do provider registrados:
  - `401` token invalido/expirado,
  - `404` instancia nao encontrada,
  - `500` erro interno.
- Mapeamento recomendado registrado na documentacao tecnica:
  - `401` -> `502 PROVIDER_AUTH_INVALID`
  - `404` -> `502 PROVIDER_RESOURCE_NOT_FOUND`
  - `500` -> `502 PROVIDER_INTERNAL_ERROR`
- Pendencia registrada: definir valores finais de variaveis de ambiente da integracao UAZAPI e n8n.

### Sessao 031 - Conexao de instancia por QR code
- Endpoint de conexao do provider registrado: `POST /instance/connect` com `token` da instancia.
- Decisao aprovada para MVP: usar apenas QR code (sem pareamento por `phone`).
- Endpoint de status registrado: `GET /instance/status`.
- Fluxo aprovado:
  - iniciar conexao,
  - polling de status ate retorno de `qrcode`,
  - manter polling ate `connected`.
- Parametros operacionais aprovados:
  - polling sugerido de 2s,
  - timeout de conexao QR em 120s,
  - erro interno mapeado para timeout (`CONEXAO_TIMEOUT_QR`) quando nao conectar no prazo.
- Erros do provider registrados para conexao:
  - `401` token invalido/expirado,
  - `404` instancia nao encontrada,
  - `429` limite de conexoes simultaneas,
  - `500` erro interno.

### Sessao 032 - Desconexao e reconexao de instancia
- Requisito aprovado:
  - se instancia for desconectada fora do sistema (via WhatsApp), sistema deve detectar e refletir no painel.
- Requisito aprovado:
  - se usuario do restaurante desconectar no sistema, status deve atualizar e permitir reconexao posterior.
- Estrategia registrada:
  - deteccao preferencial por webhook do provider,
  - fallback por polling periodico de status.
- APIs internas previstas:
  - `POST /integracoes/whatsapp/instancias/{id}/desconectar`
  - `POST /integracoes/whatsapp/instancias/{id}/reconectar`
- Pendencia aberta:
  - validar/registrar endpoints oficiais da UAZAPI para desconectar/reconectar.

### Sessao 033 - Fechamento dos endpoints UAZAPI para status/desconectar
- Endpoints oficiais confirmados:
  - `GET /instance/status` para monitorar estado da instancia,
  - `POST /instance/disconnect` para desconexao manual.
- Reconexao confirmada via endpoint ja adotado `POST /instance/connect` (QR-only).
- Regra de monitoramento aprovada:
  - polling de status a cada `5 minutos` para detectar desconexao externa.
- Comportamento aprovado:
  - ao detectar `disconnected`, atualizar painel e sinalizar necessidade de reconexao.
  - enquanto desconectado, nao encaminhar eventos para n8n.
- Erros do provider confirmados para status/disconnect:
  - `401` token invalido/expirado,
  - `404` instancia nao encontrada,
  - `500` erro interno.
- Mapeamento interno registrado:
  - `401` -> `502 PROVIDER_AUTH_INVALID`
  - `404` -> `502 PROVIDER_RESOURCE_NOT_FOUND`
  - `500` -> `502 PROVIDER_INTERNAL_ERROR`
  - timeout local de reconexao -> `408 CONEXAO_TIMEOUT_QR`

### Sessao 034 - Contratos das APIs internas de desconectar/reconectar/status
- Foram definidos os contratos internos para operacao no painel:
  - `POST /integracoes/whatsapp/instancias/{instancia_id}/desconectar`
  - `POST /integracoes/whatsapp/instancias/{instancia_id}/reconectar`
  - `GET /integracoes/whatsapp/instancias/{instancia_id}/status`
- Foram registrados exemplos de request/response e lista de erros esperados para cada endpoint.
- Foi definido retorno de status unificado para frontend com campos de conexao e QR (`status`, `connected`, `logged_in`, `jid`, `qrcode`).

### Sessao 035 - Fechamento da matriz de eventos do webhook UAZAPI
- Payloads reais recebidos e validados:
  - `message_in` texto,
  - `message_in` audio,
  - `message_in` imagem,
  - `message_in` documento,
  - `message_in` texto citando mensagem,
  - `message_out` manual (`fromMe = true`, `wasSentByApi = false`).
- Decisao confirmada para monitoramento de conexao:
  - nao usar evento `connection` por webhook,
  - usar apenas `GET /instance/status` com polling de 5 minutos.
- Regras aprovadas para midias inbound (`audio`, `image`, `document`):
  - chamar `POST /message/download` com `message.messageid`,
  - parametros fixos: `return_link=true`, `return_base64=false`, `generate_mp3=false`, `transcribe=false`, `download_quoted=false`.
- Regra aprovada para `message_out` manual:
  - pausar IA da conversa (`ia_ativa=false`, `motivo_pausa=manual_restaurante`),
  - nao encaminhar para n8n.
- Regras transversais consolidadas:
  - idempotencia por `token_instancia + message.messageid`,
  - manter filtros no webhook: `wasSentByApi` e `isGroupYes`.

### Sessao 036 - Webhook Contract v1 (especificacao curta)
- Foi gerada e registrada especificacao tecnica curta do webhook inbound em `05_whatsapp_agente_ia_n8n.md`.
- Escopo do contrato:
  - endpoint `POST /webhooks/uazapi/inbound`,
  - pipeline unico de processamento,
  - regras por tipo de mensagem,
  - padrao de download de midia,
  - envelope unico do evento para n8n,
  - mapeamento de campos origem -> normalizado,
  - regras de idempotencia e resiliencia.

### Sessao 037 - Ajuste de documentacao para uso no Lovable
- Usuario solicitou que os arquivos fiquem mais entendiveis para implementacao no Lovable.
- Foi criado guia de leitura e execucao: `00_lovable_guia_execucao.md`.
- Foram adicionadas orientacoes de uso direto no Lovable em:
  - `01_escopo_mvp.md`
  - `02_handoff_lovable_frontend.md`
  - `05_whatsapp_agente_ia_n8n.md`
- Foram incluidos criterios de pronto de interface no handoff frontend.

## Pendencias abertas
- Definir diferencas entre planos (limites por usuarios, pedidos, modulos e IA).
- Definir metricas e unidade de cobranca de uso de IA (mensagens, tokens, acoes, etc.).
- Definir detalhe do identificador por espaco (path/token/slug) no login.
- Definir nomenclatura final de status para todos os canais (consumo, mesa, whatsapp, entrega, retirada).
- Definir se havera area de entrega por mapa/poligono (Bloco 9.95) ou apenas tabela de bairros/km.
- Confirmar se item 95 (mapa/poligono) fica fora do MVP.
- Definir politica de backup/retencao (Bloco 12.126).
- Definir valores finais de `UAZAPI_BASE_URL`, `UAZAPI_ADMIN_TOKEN`, `UAZAPI_SYSTEM_NAME`, `UAZAPI_WEBHOOK_URL` e `N8N_AGENT_WEBHOOK_URL`.
