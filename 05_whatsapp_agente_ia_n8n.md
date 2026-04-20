# WhatsApp + Agente IA + n8n - Arquitetura e Operacao (MVP v1)

## Nota para uso no Lovable
- Este documento define comportamento de integracao e eventos do WhatsApp.
- Para construcoes de tela, usar em conjunto com `02_handoff_lovable_frontend.md`.
- Para contratos de API e backend, usar em conjunto com `03_backend_banco_api.md`.

## 1. Objetivo
Definir a arquitetura operacional do atendimento via WhatsApp com IA usando n8n como orquestrador principal do agente, mantendo o backend responsavel por contexto, seguranca e regras de negocio.

## 2. Decisao arquitetural (definida)
- O sistema recebe webhook do WhatsApp.
- O sistema "mastiga" o contexto (cliente, espaco, cardapio, politicas, status operacional).
- O sistema envia payload enriquecido para o n8n.
- O n8n executa o AI Agent com tools (APIs internas fixas).
- O n8n chama tools quando necessario.
- O n8n envia a resposta final ao cliente no WhatsApp.

## 3. Motivacao da decisao
- Reduz complexidade no n8n (menos consultas para descobrir contexto).
- Mantem regras sensiveis centralizadas no backend.
- Aproveita o node de AI Agent do n8n para tool-calling.
- Facilita evolucao do prompt por configuracao do espaco sem depender de deploy.

## 4. Limites de responsabilidade
## 4.1 Backend
- Receber e validar webhook de entrada.
- Resolver `espaco_id` por numero/instancia.
- Resolver/identificar cliente por telefone.
- Buscar dados operacionais necessarios.
- Montar payload final para IA.
- Disponibilizar APIs internas (tools) com contrato fixo.
- Auditar eventos criticos.

## 4.2 n8n
- Executar fluxo do agente.
- Aplicar prompt final com blocos dinamicos.
- Chamar tools quando necessario.
- Tomar decisao de resposta da conversa.
- Enviar mensagem de saida para o WhatsApp.

## 5. Fluxo ponta a ponta
1. Mensagem do cliente chega no WhatsApp provider.
2. Provider aciona webhook do sistema.
3. Backend valida assinatura e deduplica evento.
4. Backend resolve contexto (espaco, cliente, cardapio, horario, regras).
5. Backend gera `agent_context_payload`.
6. Backend envia payload para endpoint de entrada do n8n.
7. n8n executa AI Agent com tools disponiveis.
8. n8n chama APIs internas conforme necessidade.
9. n8n envia resposta ao cliente.
10. n8n envia callback opcional para registro de telemetria no sistema.

## 6. Estrutura da tela de configuracao IA (admin do espaco)
Objetivo: configuracao simples, sem prompt livre complexo no MVP.

Campos sugeridos:
- `genero_atendente`: `feminino` | `masculino`.
- `tom_voz`: `amigavel` | `profissional` | `objetivo` | `vendedor`.
- `nivel_formalidade`: `baixo` | `medio` | `alto`.
- `modo_venda`: `neutro` | `upsell_leve` | `upsell_ativo`.
- `politicas_fixas` (checkbox):
  - confirmar pedido antes de fechar,
  - nao inventar preco,
  - nao inventar item,
  - validar endereco para entrega,
  - respeitar horario de funcionamento.
- `mensagem_boas_vindas` (opcional, curto).
- `mensagem_fora_horario` (opcional, curto).
- `instrucoes_adicionais` (texto livre curto com limite de caracteres).

## 7. Montagem do prompt por blocos
O backend monta o prompt final concatenando blocos versionados.

Blocos:
- `B1_persona`: identidade e estilo.
- `B2_tom`: tom de voz e formalidade.
- `B3_regras_negocio`: politicas fixas + horario + taxa entrega + restricoes.
- `B4_fluxo_conversa`: perguntar objetivo, coletar dados, confirmar resumo.
- `B5_tools`: quando e como chamar cada API.
- `B6_segurança`: nunca inventar dados, lidar com incerteza, fallback humano.

Estrutura sugerida:
```
system = B1 + B2 + B3 + B4 + B5 + B6 + instrucoes_adicionais
```

## 8. Payload enriquecido enviado para o n8n
Exemplo de estrutura:
```json
{
  "request_id": "uuid",
  "timestamp": "2026-04-20T12:00:00Z",
  "espaco": {
    "id": "esp_123",
    "nome": "Lanchonete Exemplo",
    "timezone": "America/Sao_Paulo",
    "horario_funcionamento": {
      "aberto_agora": true,
      "mensagem_fora_horario": "Estamos fechados no momento."
    }
  },
  "canal": {
    "origem": "whatsapp",
    "numero_recebedor": "+5511999999999",
    "numero_cliente": "+5511888888888",
    "mensagem": "Quero 2 x-burger"
  },
  "cliente": {
    "id": "cli_123",
    "nome": "Joao",
    "sobrenome": "Silva",
    "blacklist": false,
    "enderecos": []
  },
  "contexto_operacional": {
    "taxa_entrega_modelo": "bairro",
    "tempo_estimado_retirada_min": 20,
    "tempo_estimado_entrega_min": 45
  },
  "cardapio_resumo": {
    "categorias": ["Lanches", "Bebidas"],
    "itens_disponiveis": 42,
    "ultima_atualizacao": "2026-04-20T11:00:00Z"
  },
  "agente": {
    "auth": {
      "token_tipo": "x-api-key-temporaria",
      "token_expira_em_segundos": 120,
      "token": "tmp_..."
    },
    "config": {
      "genero_atendente": "feminino",
      "tom_voz": "amigavel",
      "modo_venda": "upsell_leve"
    },
    "prompt_final": "...",
    "tools_disponiveis": [
      "criar_cliente",
      "editar_cliente",
      "gerar_link_endereco",
      "resolver_id",
      "criar_pedido",
      "atualizar_pedido",
      "fechar_pedido",
      "cancelar_pedido",
      "listar_cardapio_disponivel"
    ]
  }
}
```

## 9. Tool APIs fixas para o agente
As tools sao chamadas pelo n8n em endpoints internos do backend.

Lista MVP:
- `criar_cliente`
- `editar_cliente`
- `gerar_link_endereco`
- `resolver_id`
- `criar_pedido`
- `atualizar_pedido`
- `fechar_pedido`
- `cancelar_pedido`
- `listar_cardapio_disponivel`

Regras gerais para tools:
- Sempre enviar `espaco_id` e `request_id`.
- Validacao de schema obrigatoria antes de processar.
- Retorno padrao com `success`, `data`, `error`.
- Erro de negocio com codigo semantico (ex.: `ITEM_INDISPONIVEL`).

## 9.1 Modelo de autenticacao das tools (definido)
- Cada evento enviado ao n8n carrega uma `x-api-key temporaria` exclusiva do espaco.
- Validade da chave temporaria: `120 segundos`.
- A cada novo evento recebido do WhatsApp, uma nova chave temporaria e emitida.
- A chave e usada apenas para chamadas de tools do agente no n8n.
- A chave temporaria e enviada em bloco tecnico do payload (`agente.auth`) e nao deve ser incluida no texto/prompt do modelo.

Token fixo adicional:
- Existe tambem um `token fixo` de integracao (visivel inicialmente apenas para superadmin).
- Uso recomendado do token fixo: autenticacao do canal sistema <-> n8n (ingest/callback), nao para tool-call do agente.
- O token fixo nao deve ser exposto para usuarios de espaco no MVP.

Gate de seguranca antes de enviar para n8n:
- Se `espaco` estiver inativo, nao enviar evento.
- Se modulo de agente IA do espaco estiver bloqueado/inativo, nao enviar evento.
- Se limite de uso de IA for atingido, nao enviar evento.

Segunda barreira de seguranca (na tool API):
- Revalidar status do espaco/modulo/limite em toda chamada de tool, mesmo com token valido.

## 10. RAG de cardapio
Estrategia definida:
- Atualizacao automatica por evento de produto (`create/update/delete`).
- Indexacao por `espaco_id`.
- O agente recebe resumo + pode consultar detalhes via tool quando necessario.

Fluxo:
1. Produto alterado no sistema.
2. Evento publicado.
3. Worker atualiza indice vetorial do espaco.
4. n8n/agente consulta contexto atualizado.

## 11. Guardrails do agente
- Nao inventar itens, preco, taxa ou prazo.
- Nao confirmar pedido sem resumo final validado pelo cliente.
- Nao chamar tool sem dados minimos obrigatorios.
- Em ambiguidade, perguntar objetivamente ao cliente.
- Em erro repetido de tool, cair para fallback de atendimento humano.

## 12. Confiabilidade e seguranca
- Idempotencia por `message_id` para evitar duplicidade.
- Lock por conversa (telefone + espaco).
- Timeout por tool com retentativa controlada.
- Logging estruturado com `request_id`, `espaco_id`, `cliente_id`.
- Rate limit por espaco e por numero.

## 13. Falhas e fallback
- Se n8n indisponivel: registrar pendencia e notificar operador.
- Se tool falhar: resposta de contingencia sem perder contexto.
- Se cliente estiver em blacklist: interromper fluxo com resposta padrao.
- Se fora do horario: responder com mensagem configurada.

## 14. Observabilidade
Metricas minimas:
- tempo total por atendimento,
- quantidade de chamadas por tool,
- taxa de erro por tool,
- custo de IA por espaco,
- taxa de conversao conversa -> pedido confirmado.

## 15. O que entra no MVP desta frente
- Tela de configuracao de IA simplificada.
- Montagem de prompt por blocos versionados.
- Payload enriquecido backend -> n8n.
- n8n respondendo diretamente ao cliente.
- Tools fixas de pedido/cliente/cardapio.
- Guardrails essenciais.

## 16. O que fica para fase posterior
- Editor visual avancado de fluxo conversacional.
- A/B test de prompts.
- Memoria longa entre conversas.
- Orquestracao multiagente.
- Recomendacao proativa por perfil de cliente.

## 17. Proximo passo imediato
Detalhar contrato de cada API/tool (request/response, campos obrigatorios, erros, exemplos) em documento tecnico dedicado.

## 18. Contratos das tools (detalhamento em andamento)
## 18.1 POST /agent-tools/criar-cliente (fechado)
Objetivo:
- Criar cliente quando nao existir no espaco.
- Se ja existir por telefone no espaco, retornar cliente existente (idempotente).

Request (padrao acordado):
```json
{
  "request_id": "uuid",
  "espaco_id": "esp_123",
  "origem": "n8n-agent",
  "cliente": {
    "nome": "Joao",
    "telefone": "551188887777"
  },
  "meta": {
    "canal": "whatsapp",
    "numero_recebedor": "5511999999999"
  }
}
```

Decisoes de contrato:
- `nome` unico (sem obrigatoriedade de sobrenome).
- `telefone` em formato numerico limpo (`5511...`), sem `+`, sem espacos e sem caracteres especiais.
- `request_id` obrigatorio e propagado ponta a ponta (backend -> n8n -> tools -> logs).
- `numero_recebedor` mantido para auditoria e rastreabilidade multi-numero.

Resposta de sucesso:
- `success: true` com `cliente_id` e flag `criado` (true/false).

Erros de negocio esperados:
- `INVALID_PAYLOAD`
- `TELEFONE_INVALIDO`
- `TOKEN_INVALIDO`
- `ESPACO_INATIVO`
- `MODULO_IA_BLOQUEADO`
- `LIMITE_IA_ATINGIDO`

## 18.2 POST /agent-tools/editar-cliente (fechado)
Objetivo:
- Atualizar dados basicos de cliente existente durante o fluxo de atendimento.
- Nao altera endereco (endereco fica no fluxo de link dedicado).

Request (padrao acordado):
```json
{
  "request_id": "uuid",
  "espaco_id": "esp_123",
  "origem": "n8n-agent",
  "cliente_id": "cli_789",
  "atualizacoes": {
    "nome": "Joao Pedro",
    "telefone": "5511999997777"
  },
  "meta": {
    "canal": "whatsapp",
    "numero_recebedor": "5511999999999"
  }
}
```

Decisoes de contrato:
- Campos permitidos em `atualizacoes` no MVP: `nome`, `telefone`.
- `telefone` no formato numerico limpo (`5511...`).
- `atualizacoes` deve conter ao menos 1 campo valido.
- Validar unicidade de telefone por `espaco_id` quando houver alteracao.

Resposta de sucesso:
- `success: true` com `cliente_id`, `atualizado: true` e dados finais.

Erros de negocio esperados:
- `INVALID_PAYLOAD`
- `CLIENTE_NAO_ENCONTRADO`
- `TELEFONE_INVALIDO`
- `TELEFONE_JA_CADASTRADO`
- `SEM_ALTERACOES`
- `TOKEN_INVALIDO`
- `ESPACO_INATIVO`
- `MODULO_IA_BLOQUEADO`
- `LIMITE_IA_ATINGIDO`

## 18.3 POST /agent-tools/gerar-link-endereco (fechado)
Objetivo:
- Gerar link seguro e temporario para cliente cadastrar, corrigir ou confirmar endereco fora da conversa.
- Fluxo de endereco fica no sistema web; agente apenas solicita o link.

Request (padrao acordado):
```json
{
  "request_id": "uuid",
  "espaco_id": "esp_123",
  "origem": "n8n-agent",
  "cliente_id": "cli_789",
  "contexto": {
    "motivo": "primeiro_cadastro"
  },
  "meta": {
    "canal": "whatsapp",
    "numero_recebedor": "5511999999999",
    "numero_cliente": "551188887777"
  }
}
```

Decisoes de contrato:
- `contexto.motivo` sera escolhido pelo agente com base na conversa, mas limitado a enum fixa (sem valores livres).
- Lista oficial de `motivo`:
  - `primeiro_cadastro`
  - `endereco_inexistente`
  - `endereco_desatualizado`
  - `cliente_solicitou_troca`
  - `endereco_nao_atendido`
  - `reconfirmacao_endereco`
- Esses 6 cenarios devem constar no bloco de prompt de tools para orientar escolha do motivo.
- Link e temporario e vinculado a `espaco_id + cliente_id + numero_cliente`.

Resposta de sucesso:
- `success: true` com `link_endereco`, `expira_em_segundos` e `token_id`.

Erros de negocio esperados:
- `INVALID_PAYLOAD`
- `MOTIVO_INVALIDO`
- `CLIENTE_NAO_ENCONTRADO`
- `CLIENTE_BLACKLIST`
- `TOKEN_INVALIDO`
- `ESPACO_INATIVO`
- `MODULO_IA_BLOQUEADO`
- `LIMITE_IA_ATINGIDO`

## 18.4 POST /agent-tools/resolver-id (fechado)
Objetivo:
- Resolver IDs de entidades de cardapio/entrega a partir de texto da conversa.
- Reduzir risco de alucinacao de IDs no agente.

Request (padrao acordado):
```json
{
  "request_id": "uuid",
  "espaco_id": "esp_123",
  "origem": "n8n-agent",
  "tipo_id": "adicional",
  "texto_busca": "bacon",
  "top_k": 5,
  "meta": {
    "canal": "whatsapp",
    "numero_recebedor": "5511999999999"
  }
}
```

Decisoes de contrato:
- `tipo_id` (enum MVP):
  - `produto`
  - `adicional`
  - `variacao`
  - `categoria`
  - `bairro`
- Estrategia de busca: hibrida (`match exato/normalizado` + `fuzzy trigram` + `semantica` como fallback).
- Retorno deve indicar se houve match unico, multiplos matches ou sem match.
- Se retorno for ambiguo, agente deve solicitar confirmacao do cliente antes de chamar tools de pedido.

Response de sucesso (exemplo):
```json
{
  "success": true,
  "data": {
    "match_status": "single_match",
    "candidatos": [
      {
        "id": "add_45",
        "nome": "Bacon",
        "score": 0.97,
        "estrategia": "exact+trigram"
      }
    ]
  },
  "error": null,
  "meta": {
    "request_id": "uuid"
  }
}
```

Erros de negocio esperados:
- `INVALID_PAYLOAD`
- `TIPO_ID_INVALIDO`
- `SEM_RESULTADO`
- `TOKEN_INVALIDO`
- `ESPACO_INATIVO`
- `MODULO_IA_BLOQUEADO`
- `LIMITE_IA_ATINGIDO`

## 18.5 Fluxo de pedido via agente (consolidado e fechado)
Decisao final para reduzir risco e simplificar n8n:
- Usar 3 APIs de pedido no MVP:
  - `POST /agent-tools/criar-pedido`
  - `POST /agent-tools/atualizar-pedido` (acao unica por chamada via `action`)
  - `POST /agent-tools/fechar-pedido`
- Pedido e criado em status tecnico `Rascunho`.
- Status `Em analise` so ocorre no `fechar-pedido`.
- `atualizar-pedido` deve sempre retornar o pedido completo atualizado.

Identificador de pedido para tools:
- Para integracao com agente, usar `numero_pedido` (numero sequencial visivel no negocio) como identificador principal.
- `id` interno de banco permanece privado no backend.
- O backend resolve `numero_pedido` -> `id` internamente.
- Regra de unicidade do `numero_pedido`: unica por `espaco_id`.

### 18.5.1 POST /agent-tools/criar-pedido (fechado)
Objetivo:
- Criar a "bandeja" do pedido para montagem gradual (sem depender de endereco no inicio).

Request (padrao acordado):
```json
{
  "request_id": "uuid",
  "espaco_id": "esp_123",
  "origem": "n8n-agent",
  "cliente_id": "cli_789",
  "pedido": {
    "canal": "whatsapp",
    "tipo_atendimento": null,
    "forma_pagamento": null,
    "endereco_id": null,
    "agendado_para": null,
    "observacao_geral": null
  },
  "meta": {
    "numero_recebedor": "5511999999999",
    "numero_cliente": "551188887777",
    "idempotency_key": "wa-msg-001"
  }
}
```

Resposta de sucesso:
- `success: true` com `numero_pedido` e `status: Rascunho`.

Erros de negocio esperados:
- `INVALID_PAYLOAD`
- `CLIENTE_NAO_ENCONTRADO`
- `CLIENTE_BLACKLIST`
- `TOKEN_INVALIDO`
- `ESPACO_INATIVO`
- `MODULO_IA_BLOQUEADO`
- `LIMITE_IA_ATINGIDO`

### 18.5.2 POST /agent-tools/atualizar-pedido (fechado)
Objetivo:
- Aplicar mudancas incrementais no pedido (cabecalho, itens e adicionais) com `action`.

Request base:
```json
{
  "request_id": "uuid",
  "espaco_id": "esp_123",
  "origem": "n8n-agent",
  "numero_pedido": 10231,
  "action": "add_item",
  "payload": {}
}
```

Actions MVP aprovadas:
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

Cenarios de uso das actions:
- `set_tipo_atendimento`: cliente define/muda entre entrega, retirada ou consumo_local.
- `set_forma_pagamento`: cliente informa ou altera forma de pagamento.
- `set_endereco_entrega`: vincula `endereco_id` quando for entrega.
- `set_observacao_geral`: observacao para o pedido inteiro.
- `add_item`: adiciona produto ao pedido (um por chamada).
- `remove_item`: remove item ja adicionado.
- `update_item_quantidade`: ajusta quantidade de item existente.
- `set_item_observacao`: define/altera observacao de item especifico.
- `add_item_adicional`: inclui adicional em item existente.
- `remove_item_adicional`: remove adicional de item existente.

Regras operacionais:
- Uma unica `action` por chamada.
- Agente deve usar `resolver-id` antes de enviar IDs sensiveis quando necessario.
- Adicionais podem ser incluidos no momento do `add_item` ou depois via action dedicada.

Schemas por action (`payload`):

- `set_tipo_atendimento`
  - Obrigatorios: `tipo_atendimento`
  - Enum: `entrega` | `retirada` | `consumo_local`
  - Exemplo:
  ```json
  {
    "tipo_atendimento": "entrega"
  }
  ```

- `set_forma_pagamento`
  - Obrigatorios: `forma_pagamento`
  - Enum MVP: `pix` | `dinheiro` | `credito` | `debito`
  - Exemplo:
  ```json
  {
    "forma_pagamento": "pix"
  }
  ```

- `set_endereco_entrega`
  - Obrigatorios: `endereco_id`
  - Regras: endereco deve pertencer ao cliente do pedido e ao espaco
  - Exemplo:
  ```json
  {
    "endereco_id": "end_456"
  }
  ```

- `set_observacao_geral`
  - Obrigatorios: `observacao_geral`
  - Limite sugerido: 300 caracteres
  - Exemplo:
  ```json
  {
    "observacao_geral": "Nao tocar campainha"
  }
  ```

- `add_item`
  - Obrigatorios: `produto_id`, `quantidade`
  - Opcionais: `observacao`, `variacao_id`, `adicionais[]`
  - `adicionais[]`: lista de objetos com `adicional_id` e `quantidade`
  - Exemplo:
  ```json
  {
    "produto_id": "prd_10",
    "quantidade": 1,
    "variacao_id": "var_2",
    "observacao": "Sem tomate",
    "adicionais": [
      {
        "adicional_id": "add_1",
        "quantidade": 2
      }
    ]
  }
  ```

- `remove_item`
  - Obrigatorios: `pedido_item_id`
  - Opcionais: `motivo`
  - Exemplo:
  ```json
  {
    "pedido_item_id": "pit_77",
    "motivo": "cliente_desistiu"
  }
  ```

- `update_item_quantidade`
  - Obrigatorios: `pedido_item_id`, `quantidade`
  - Regra: `quantidade` >= 1
  - Exemplo:
  ```json
  {
    "pedido_item_id": "pit_77",
    "quantidade": 2
  }
  ```

- `set_item_observacao`
  - Obrigatorios: `pedido_item_id`, `observacao`
  - Exemplo:
  ```json
  {
    "pedido_item_id": "pit_77",
    "observacao": "Ponto bem passado"
  }
  ```

- `add_item_adicional`
  - Obrigatorios: `pedido_item_id`, `adicional_id`, `quantidade`
  - Regra: se adicional ja existir no item, soma quantidade
  - Exemplo:
  ```json
  {
    "pedido_item_id": "pit_77",
    "adicional_id": "add_1",
    "quantidade": 1
  }
  ```

- `remove_item_adicional`
  - Obrigatorios: `pedido_item_id`, `adicional_id`
  - Opcionais: `quantidade`
  - Regra:
    - sem `quantidade`: remove adicional inteiro
    - com `quantidade`: decrementa e remove se chegar a zero
  - Exemplo:
  ```json
  {
    "pedido_item_id": "pit_77",
    "adicional_id": "add_1",
    "quantidade": 1
  }
  ```

Matriz de erros por action:

- `set_tipo_atendimento`
  - `INVALID_PAYLOAD`
  - `TIPO_ATENDIMENTO_INVALIDO`
  - `PEDIDO_NAO_ENCONTRADO`
  - `PEDIDO_NAO_EDITAVEL`

- `set_forma_pagamento`
  - `INVALID_PAYLOAD`
  - `FORMA_PAGAMENTO_INVALIDA`
  - `PEDIDO_NAO_ENCONTRADO`
  - `PEDIDO_NAO_EDITAVEL`

- `set_endereco_entrega`
  - `INVALID_PAYLOAD`
  - `ENDERECO_INVALIDO`
  - `ENDERECO_NAO_PERTENCE_CLIENTE`
  - `ENDERECO_FORA_COBERTURA`
  - `TIPO_ATENDIMENTO_NAO_ENTREGA`
  - `PEDIDO_NAO_ENCONTRADO`
  - `PEDIDO_NAO_EDITAVEL`

- `set_observacao_geral`
  - `INVALID_PAYLOAD`
  - `OBSERVACAO_MUITO_LONGA`
  - `PEDIDO_NAO_ENCONTRADO`
  - `PEDIDO_NAO_EDITAVEL`

- `add_item`
  - `INVALID_PAYLOAD`
  - `PRODUTO_NAO_ENCONTRADO`
  - `PRODUTO_INDISPONIVEL`
  - `VARIACAO_INVALIDA`
  - `ADICIONAL_NAO_ENCONTRADO`
  - `ADICIONAL_INVALIDO_PARA_PRODUTO`
  - `QUANTIDADE_INVALIDA`
  - `PEDIDO_NAO_ENCONTRADO`
  - `PEDIDO_NAO_EDITAVEL`

- `remove_item`
  - `INVALID_PAYLOAD`
  - `ITEM_NAO_ENCONTRADO`
  - `PEDIDO_NAO_ENCONTRADO`
  - `PEDIDO_NAO_EDITAVEL`

- `update_item_quantidade`
  - `INVALID_PAYLOAD`
  - `ITEM_NAO_ENCONTRADO`
  - `QUANTIDADE_INVALIDA`
  - `PEDIDO_NAO_ENCONTRADO`
  - `PEDIDO_NAO_EDITAVEL`

- `set_item_observacao`
  - `INVALID_PAYLOAD`
  - `ITEM_NAO_ENCONTRADO`
  - `OBSERVACAO_MUITO_LONGA`
  - `PEDIDO_NAO_ENCONTRADO`
  - `PEDIDO_NAO_EDITAVEL`

- `add_item_adicional`
  - `INVALID_PAYLOAD`
  - `ITEM_NAO_ENCONTRADO`
  - `ADICIONAL_NAO_ENCONTRADO`
  - `ADICIONAL_INVALIDO_PARA_PRODUTO`
  - `QUANTIDADE_INVALIDA`
  - `PEDIDO_NAO_ENCONTRADO`
  - `PEDIDO_NAO_EDITAVEL`

- `remove_item_adicional`
  - `INVALID_PAYLOAD`
  - `ITEM_NAO_ENCONTRADO`
  - `ADICIONAL_NAO_ENCONTRADO`
  - `ADICIONAL_NAO_EXISTE_NO_ITEM`
  - `QUANTIDADE_INVALIDA`
  - `PEDIDO_NAO_ENCONTRADO`
  - `PEDIDO_NAO_EDITAVEL`

Erros transversais (todas as actions):
- `ACTION_INVALIDA`
- `TOKEN_INVALIDO`
- `TOKEN_EXPIRADO`
- `ESPACO_INATIVO`
- `MODULO_IA_BLOQUEADO`
- `LIMITE_IA_ATINGIDO`
- `RATE_LIMIT_EXCEDIDO`

Resposta de sucesso (obrigatoria, sempre completa):
- Retornar pedido completo atualizado com:
  - `numero_pedido`, `status`, `tipo_atendimento`, `forma_pagamento`, `endereco_id`.
  - `itens` com `pedido_item_id`, produto, quantidade, observacao e adicionais.
  - `resumo_valores` (`subtotal`, `taxa_entrega`, `total`).
  - `validacoes` com `pode_fechar` e `pendencias[]`.

Erros de negocio esperados:
- `INVALID_PAYLOAD`
- `ACTION_INVALIDA`
- `PEDIDO_NAO_ENCONTRADO`
- `PEDIDO_NAO_EDITAVEL`
- `ITEM_NAO_ENCONTRADO`
- `ADICIONAL_NAO_ENCONTRADO`
- `PRODUTO_INDISPONIVEL`
- `FORMA_PAGAMENTO_INVALIDA`
- `TIPO_ATENDIMENTO_INVALIDO`
- `ENDERECO_INVALIDO`
- `TOKEN_INVALIDO`
- `ESPACO_INATIVO`
- `MODULO_IA_BLOQUEADO`
- `LIMITE_IA_ATINGIDO`

### 18.5.3 POST /agent-tools/fechar-pedido (fechado)
Objetivo:
- Realizar validacao final e mover pedido de `Rascunho` para `Em analise`.

Request (padrao acordado):
```json
{
  "request_id": "uuid",
  "espaco_id": "esp_123",
  "origem": "n8n-agent",
  "numero_pedido": 10231,
  "meta": {
    "canal": "whatsapp",
    "numero_recebedor": "5511999999999",
    "numero_cliente": "551188887777"
  }
}
```

Validacoes minimas antes de fechar:
- Pedido precisa ter ao menos 1 item valido.
- `tipo_atendimento` definido.
- `forma_pagamento` definida.
- Se `tipo_atendimento = entrega`, exige `endereco_id` valido e taxa de entrega aplicada.
- `numero_pedido` deve existir e pertencer ao `espaco_id`.

Resposta de sucesso:
- `success: true` com status final `Em analise` e resumo final do pedido.

Erros de negocio esperados:
- `INVALID_PAYLOAD`
- `PEDIDO_NAO_ENCONTRADO`
- `PEDIDO_SEM_ITENS`
- `TIPO_ATENDIMENTO_OBRIGATORIO`
- `FORMA_PAGAMENTO_OBRIGATORIA`
- `ENDERECO_OBRIGATORIO_ENTREGA`
- `PEDIDO_NAO_EDITAVEL`
- `TOKEN_INVALIDO`
- `ESPACO_INATIVO`
- `MODULO_IA_BLOQUEADO`
- `LIMITE_IA_ATINGIDO`

## 18.6 Observacoes de prompt para o fluxo de pedido
- Ordem sugerida para o agente:
  1. `criar-pedido`
  2. `atualizar-pedido` (sequencia de actions conforme conversa)
  3. verificar `validacoes.pode_fechar`
  4. confirmacao formal com cliente
  5. `fechar-pedido`
- Mesmo que cliente envie varios itens na mesma mensagem, aplicar `add_item` um por vez.
- Nunca inventar IDs; usar `resolver-id` quando necessario.

## 18.9 POST /agent-tools/cancelar-pedido (fechado)
Objetivo:
- Cancelar pedido por solicitacao do cliente com auditoria textual.

Request (padrao acordado):
```json
{
  "request_id": "uuid",
  "espaco_id": "esp_123",
  "origem": "n8n-agent",
  "numero_pedido": 10231,
  "detalhe_motivo": "Cliente pediu cancelamento via WhatsApp",
  "meta": {
    "canal": "whatsapp",
    "numero_recebedor": "5511999999999",
    "numero_cliente": "551188887777"
  }
}
```

Campos obrigatorios:
- `request_id`
- `espaco_id`
- `numero_pedido`
- `detalhe_motivo`

Regras de negocio:
- Cancelar apenas em status cancelaveis (`Rascunho`, `Em analise`).
- Se pedido ja estiver `Em producao` ou adiante, bloquear no MVP.
- Registrar auditoria completa (quem, quando, detalhe).
- Se pedido ja estiver cancelado, retorno idempotente.

Resposta de sucesso:
- `success: true` com `numero_pedido`, `status_anterior`, `status_atual: Cancelado` e `cancelado_em`.

Erros de negocio esperados:
- `INVALID_PAYLOAD`
- `DETALHE_MOTIVO_OBRIGATORIO`
- `DETALHE_MOTIVO_MUITO_LONGO`
- `NUMERO_PEDIDO_INVALIDO`
- `PEDIDO_NAO_ENCONTRADO`
- `PEDIDO_NAO_CANCELAVEL_STATUS`
- `TOKEN_INVALIDO`
- `TOKEN_EXPIRADO`
- `ESPACO_INATIVO`
- `MODULO_IA_BLOQUEADO`
- `LIMITE_IA_ATINGIDO`
- `RATE_LIMIT_EXCEDIDO`

## 18.7 APIs substituidas/removidas no MVP
- `POST /agent-tools/adicionar-endereco`
  - Motivo: endereco passou a ser tratado via `gerar-link-endereco` + formulario web.
- `POST /agent-tools/adicionar-item-pedido`
  - Motivo: incorporada em `POST /agent-tools/atualizar-pedido` com `action: add_item`.
- `POST /agent-tools/remover-item-pedido`
  - Motivo: incorporada em `POST /agent-tools/atualizar-pedido` com `action: remove_item`.
- `POST /agent-tools/atualizar-item-pedido`
  - Motivo: incorporada em `POST /agent-tools/atualizar-pedido` por actions de item/adicional.
- `POST /agent-tools/confirmar-pedido`
  - Motivo: unificada em `POST /agent-tools/fechar-pedido`.
- `POST /agent-tools/consultar-status-pedido`
  - Motivo: status do pedido sera fornecido no contexto do evento ao n8n; pedidos abertos encerram diariamente.

## 18.8 POST /agent-tools/listar-cardapio-disponivel (fechado)
Objetivo:
- Retornar cardapio oficial e disponivel do espaco para orientar conversa do agente.
- Servir como fonte estruturada de nomes, precos, variacoes e adicionais (nao como fonte de verdade de RAG).

Request (padrao acordado):
```json
{
  "request_id": "uuid",
  "espaco_id": "esp_123",
  "origem": "n8n-agent",
  "filtros": {
    "categoria_id": null,
    "texto_busca": "hotdog duplo",
    "somente_disponiveis": true,
    "incluir_adicionais": true,
    "limite_por_categoria": 20
  },
  "meta": {
    "canal": "whatsapp",
    "numero_recebedor": "5511999999999"
  }
}
```

Decisoes de contrato:
- Esta API deve evitar retorno "catalogo completo" por padrao; usar filtros e limite para reduzir volume.
- `texto_busca` segue busca hibrida:
  - match exato/normalizado,
  - fuzzy por trigram,
  - semantica como fallback.
- RAG nao e fonte final de IDs/preco; fonte final e o dado estruturado retornado pela API.
- Produtos podem ter `aliases` (apelidos/sinonimos) opcionais no cadastro para melhorar entendimento do agente.
  - Exemplo: produto oficial `Hotwailer` com aliases `hotdog`, `cachorro-quente`, `hot dog duplo`.
- Preco, disponibilidade e IDs retornados por essa API sao os valores oficiais para uso no fluxo.

Response de sucesso (resumido):
```json
{
  "success": true,
  "data": {
    "atualizado_em": "2026-04-20T18:00:00Z",
    "categorias": [
      {
        "categoria_id": "cat_1",
        "nome": "Lanches",
        "itens": [
          {
            "produto_id": "prd_10",
            "nome": "Hotwailer",
            "preco_base": 22.0,
            "disponivel": true,
            "variacoes": [],
            "adicionais": []
          }
        ]
      }
    ]
  },
  "error": null,
  "meta": {
    "request_id": "uuid"
  }
}
```

Erros de negocio esperados:
- `INVALID_PAYLOAD`
- `TOKEN_INVALIDO`
- `ESPACO_INATIVO`
- `MODULO_IA_BLOQUEADO`
- `LIMITE_IA_ATINGIDO`

## 19. UAZAPI + Orquestracao de IA por conversa

### 19.1 Decisao de arquitetura
- O backend sera o orquestrador central do WhatsApp:
  - recebe webhook inbound,
  - decide se encaminha para n8n,
  - controla status `ia_ativa` por conversa/numero.
- O n8n fica dedicado ao processamento do agente e resposta ao cliente.

### 19.2 Regra de pausa/retomada da IA
- Se o restaurante/comercio enviar mensagem manual para o cliente, marcar `ia_ativa = false` para a conversa.
- Com `ia_ativa = false`, mensagens inbound nao sao encaminhadas ao n8n.
- Retomada via painel (toggle `Ativar IA`).
- Motivo da pausa deve ser registrado (`manual_restaurante`, `manual_painel`, `limite_plano`, etc.).

### 19.3 Painel operacional (simples)
- Lista de numeros/instancias por espaco com:
  - status da conexao WhatsApp (conectado/desconectado),
  - status de IA (ativa/pausada),
  - acao de ativar IA.

### 19.4 Regras de contabilizacao de uso (assinatura)
- Contabilizar consumo apenas quando mensagem passa por IA (`ia_ativa = true`) e e encaminhada ao n8n.
- Nao contabilizar quando `ia_ativa = false` (atendimento humano) ou bloqueio por plano/modulo.
- Eventos de billing recomendados:
  - `ia_dispatch_started`
  - `ia_dispatch_completed`
  - `ia_dispatch_blocked_reason`

### 19.5 Modelo minimo de estado por conversa
- `espaco_id`
- `numero_instancia_whatsapp`
- `numero_cliente`
- `ia_ativa` (bool)
- `motivo_pausa`
- `paused_at`
- `resumed_at`

## 20. UAZAPI - Criacao de instancia (fechado)

### 20.1 Regras aprovadas
- Quantidade de instancias por espaco deve ser controlada por plano (exemplo inicial: basico 1, medio 2, avancado 3).
- Webhook do n8n sera fixo e gerenciado por variavel de ambiente.
- `admintoken` da UAZAPI e fixo e deve ser gerenciado por variavel de ambiente.
- Ao criar instancia, provider retorna token unico da instancia; esse token deve ser persistido com protecao (criptografado).

### 20.2 Endpoint do provider (referencia)
- `POST https://factorai2.uazapi.com/instance/create`
- Headers:
  - `Accept: application/json`
  - `Content-Type: application/json`
  - `admintoken: <UAZAPI_ADMIN_TOKEN>`
- Body minimo:
  - `name` (obrigatorio)
  - `systemName` (recomendado)
  - `adminField01` (opcional)
  - `adminField02` (opcional)

### 20.3 Estado da instancia (provider)
- `disconnected`
- `connecting`
- `connected`

### 20.4 API interna recomendada
- `POST /integracoes/whatsapp/instancias`
- Fluxo:
  1. Validar limite de instancias do plano por `espaco_id`.
  2. Chamar provider UAZAPI `/instance/create`.
  3. Salvar instancia no banco com status inicial `disconnected`.
  4. Salvar token da instancia retornado pelo provider (criptografado).

### 20.5 Mapeamento de erros do provider para API interna
Erros reportados pela UAZAPI:
- `401` token invalido/expirado
- `404` instancia nao encontrada
- `500` erro interno

Mapeamento recomendado:
- UAZAPI `401` -> `502 PROVIDER_AUTH_INVALID`
- UAZAPI `404` -> `502 PROVIDER_RESOURCE_NOT_FOUND`
- UAZAPI `500` -> `502 PROVIDER_INTERNAL_ERROR`

Erros internos adicionais:
- `409 PLANO_LIMITE_INSTANCIAS_ATINGIDO`
- `403 ESPACO_INATIVO`
- `403 MODULO_WHATSAPP_BLOQUEADO`
- `500 PROVIDER_UNEXPECTED_RESPONSE`

### 20.6 Variaveis de ambiente pendentes
- `UAZAPI_BASE_URL`
- `UAZAPI_ADMIN_TOKEN`
- `UAZAPI_SYSTEM_NAME`
- `UAZAPI_WEBHOOK_URL`
- `N8N_AGENT_WEBHOOK_URL`

## 21. UAZAPI - Conexao por QR code e monitoramento (fechado)

### 21.1 Decisao de conexao
- No MVP, operar apenas com QR code (sem pareamento por `phone`).
- Fluxo usa:
  - `POST /instance/connect` (sem `phone`) para iniciar,
  - `GET /instance/status` para polling e monitoramento.

### 21.2 Fluxo operacional
1. Usuario clica em conectar no painel.
2. Backend chama provider `POST /instance/connect` com `token` da instancia.
3. Backend marca instancia como `connecting`.
4. Backend realiza polling em `GET /instance/status` (intervalo sugerido: 2s).
5. Quando `qrcode` estiver disponivel, exibir no frontend.
6. Continuar polling ate `instance.status = connected`.
7. Ao conectar, persistir estado final e dados basicos de conexao.

### 21.3 Timeouts e tentativas
- Sessao de conexao QR: 120s.
- Polling sugerido: a cada 2s.
- Maximo sugerido: 60 tentativas.
- Estouro de tempo: retornar `408 CONEXAO_TIMEOUT_QR` e manter/desfazer estado para `disconnected`.

### 21.4 APIs internas recomendadas
- `POST /integracoes/whatsapp/instancias/{instancia_id}/conectar`
  - inicia conexao da instancia (QR-only).
- `GET /integracoes/whatsapp/instancias/{instancia_id}/status`
  - retorna status interno + `qrcode` quando disponivel.
- `POST /integracoes/whatsapp/instancias/{instancia_id}/conexao/cancelar` (opcional)
  - encerra tentativa em andamento.

### 21.5 Mapeamento de erros (provider -> interno)
- UAZAPI `401` -> `502 PROVIDER_AUTH_INVALID`
- UAZAPI `404` -> `502 PROVIDER_RESOURCE_NOT_FOUND`
- UAZAPI `429` -> `429 PROVIDER_CONNECTION_LIMIT`
- UAZAPI `500` -> `502 PROVIDER_INTERNAL_ERROR`
- Timeout local de conexao -> `408 CONEXAO_TIMEOUT_QR`

### 21.6 Regras de seguranca
- Nunca expor token da instancia para o frontend.
- Frontend fala apenas com API interna.
- Backend fala com provider usando credenciais protegidas.

## 22. UAZAPI - Desconexao e reconexao (fechado)

### 22.1 Cenarios aceitos
- Desconexao externa: cliente desconecta pelo app WhatsApp/celular.
- Desconexao manual interna: usuario do restaurante desconecta pelo sistema.

### 22.2 Comportamento esperado
- Sistema deve detectar desconexao e refletir status `disconnected` no painel.
- Sistema deve sinalizar necessidade de reconexao.
- Enquanto desconectado, fluxo de IA/atendimento por WhatsApp deve ficar indisponivel para aquela instancia.

### 22.3 Estrategia de deteccao
- Monitoramento no MVP: polling periodico em `GET /instance/status` para convergencia do estado.
- Regra operacional aprovada para MVP: polling a cada `5 minutos` por instancia conectada.
- Se o provider retornar `disconnected`, atualizar painel e bloquear despacho ao n8n ate reconexao.

### 22.4 APIs internas previstas
- `POST /integracoes/whatsapp/instancias/{instancia_id}/desconectar`
- `POST /integracoes/whatsapp/instancias/{instancia_id}/reconectar`

Detalhe de comportamento:
- `desconectar`: chama provider `POST /instance/disconnect` usando `token` da instancia.
- `reconectar`: reutiliza fluxo de `POST /instance/connect` (QR-only) + polling em status.
- `status`: usa provider `GET /instance/status` para refletir `disconnected|connecting|connected`.

### 22.5 Endpoints do provider confirmados
- `GET /instance/status`
  - usado para monitorar estado atual, QR e dados de ultima desconexao.
- `POST /instance/disconnect`
  - encerra sessao atual e exige novo QR para reconectar.

### 22.6 Mapeamento de erros (status/disconnect)
- Provider `401` -> `502 PROVIDER_AUTH_INVALID`
- Provider `404` -> `502 PROVIDER_RESOURCE_NOT_FOUND`
- Provider `500` -> `502 PROVIDER_INTERNAL_ERROR`
- Timeout local no fluxo de reconexao QR -> `408 CONEXAO_TIMEOUT_QR`

Observacao:
- Reconexao permanece via endpoint de conexao (`POST /instance/connect`).
- Nao depender de webhook `connection` no MVP.

### 22.7 Contratos das APIs internas (painel)

#### POST /integracoes/whatsapp/instancias/{instancia_id}/desconectar
Objetivo:
- Encerrar sessao ativa do WhatsApp da instancia pelo sistema.

Request:
```json
{
  "request_id": "uuid",
  "espaco_id": "esp_123",
  "origem": "painel-admin",
  "detalhe_motivo": "Desconexao manual solicitada pelo restaurante"
}
```

Resposta de sucesso:
```json
{
  "success": true,
  "data": {
    "instancia_id": "wpp_123",
    "status_anterior": "connected",
    "status_atual": "disconnected",
    "desconectado_em": "2026-04-20T23:30:00Z"
  },
  "error": null,
  "meta": {
    "request_id": "uuid"
  }
}
```

Erros esperados:
- `INVALID_PAYLOAD`
- `INSTANCIA_NAO_ENCONTRADA`
- `INSTANCIA_NAO_PERTENCE_ESPACO`
- `PROVIDER_AUTH_INVALID`
- `PROVIDER_RESOURCE_NOT_FOUND`
- `PROVIDER_INTERNAL_ERROR`
- `ESPACO_INATIVO`

#### POST /integracoes/whatsapp/instancias/{instancia_id}/reconectar
Objetivo:
- Reiniciar conexao da instancia via QR code (reutiliza provider `/instance/connect`).

Request:
```json
{
  "request_id": "uuid",
  "espaco_id": "esp_123",
  "origem": "painel-admin"
}
```

Resposta de sucesso (inicio da reconexao):
```json
{
  "success": true,
  "data": {
    "instancia_id": "wpp_123",
    "status": "connecting",
    "qrcode": null,
    "expira_em_segundos": 120
  },
  "error": null,
  "meta": {
    "request_id": "uuid"
  }
}
```

Erros esperados:
- `INVALID_PAYLOAD`
- `INSTANCIA_NAO_ENCONTRADA`
- `INSTANCIA_NAO_PERTENCE_ESPACO`
- `PROVIDER_AUTH_INVALID`
- `PROVIDER_RESOURCE_NOT_FOUND`
- `PROVIDER_CONNECTION_LIMIT`
- `PROVIDER_INTERNAL_ERROR`
- `CONEXAO_TIMEOUT_QR`
- `ESPACO_INATIVO`

#### GET /integracoes/whatsapp/instancias/{instancia_id}/status
Objetivo:
- Retornar estado unificado da instancia para frontend/painel.

Resposta de sucesso:
```json
{
  "success": true,
  "data": {
    "instancia_id": "wpp_123",
    "status": "connecting",
    "connected": false,
    "logged_in": false,
    "jid": null,
    "qrcode": "data:image/png;base64,iVBORw0KGg...",
    "last_disconnect": "2026-04-20T22:50:00Z",
    "last_disconnect_reason": "Network error",
    "updated_at": "2026-04-20T23:31:00Z"
  },
  "error": null,
  "meta": {
    "request_id": "uuid"
  }
}
```

Erros esperados:
- `INSTANCIA_NAO_ENCONTRADA`
- `INSTANCIA_NAO_PERTENCE_ESPACO`
- `PROVIDER_AUTH_INVALID`
- `PROVIDER_RESOURCE_NOT_FOUND`
- `PROVIDER_INTERNAL_ERROR`

## 23. Matriz de eventos UAZAPI recebidos (fechado)

### 23.1 Escopo de eventos no webhook
- Evento utilizado no webhook: `messages`.
- Configuracao aprovada do webhook da instancia:
  - `events`: `messages`
  - `excludeMessages`: `wasSentByApi`, `isGroupYes`
- Estado de conexao da instancia sera controlado por polling em `GET /instance/status`.

### 23.2 message_in texto
Identificacao:
- `EventType = messages`
- `message.fromMe = false`
- `message.type = text`
- `message.wasSentByApi = false`

Acao:
- Se `ia_ativa = true`, encaminhar para n8n.
- Se `ia_ativa = false`, nao encaminhar.

Campos mapeados:
- `message_id`: `message.messageid`
- `numero_cliente`: derivado de `message.sender_pn`
- `texto`: `message.text` ou `message.content.text`

### 23.3 message_in audio
Identificacao:
- `EventType = messages`
- `message.fromMe = false`
- `message.type = media`
- `message.messageType = AudioMessage` (ou `mediaType = ptt`)

Acao:
1. Chamar `POST /message/download` com `id = message.messageid`.
2. Parametros aprovados no download:
   - `return_link = true`
   - `return_base64 = false`
   - `generate_mp3 = false`
   - `transcribe = false`
   - `download_quoted = false`
3. Encaminhar para n8n com `fileURL` e `mimetype`.

### 23.4 message_in imagem
Identificacao:
- `EventType = messages`
- `message.fromMe = false`
- `message.type = media`
- `message.messageType = ImageMessage` (ou `mediaType = image`)

Acao:
- Mesmo pipeline de download por `message.messageid`.
- Encaminhar para n8n com `mensagem_tipo = image`, `fileURL`, `mimetype`.

### 23.5 message_in documento
Identificacao:
- `EventType = messages`
- `message.fromMe = false`
- `message.type = media`
- `message.messageType = DocumentMessage` (ou `mediaType = document`)

Acao:
- Mesmo pipeline de download por `message.messageid`.
- Encaminhar para n8n com `mensagem_tipo = document`, `fileURL`, `mimetype`, `fileName` quando disponivel.

### 23.6 message_in texto citando mensagem
Identificacao:
- `EventType = messages`
- `message.fromMe = false`
- `message.type = text`
- `message.content.contextInfo` com `stanzaID`/`quotedMessage`

Acao:
- Encaminhar para n8n com contexto de citacao:
  - `is_reply = true`
  - `quoted_id`
  - `quoted_text` (quando existir)

### 23.7 message_out manual
Identificacao:
- `EventType = messages`
- `message.fromMe = true`
- `message.wasSentByApi = false`

Acao:
- Marcar conversa como `ia_ativa = false`.
- Definir `motivo_pausa = manual_restaurante`.
- Nao encaminhar para n8n.

### 23.8 Regras transversais
- Idempotencia por mensagem:
  - chave recomendada: `token_instancia + message.messageid`.
- Evitar loops:
  - manter `excludeMessages: wasSentByApi`.
- Ignorar grupos:
  - manter `excludeMessages: isGroupYes`.

## 24. Webhook Contract v1 (especificacao tecnica curta)

### 24.1 Objetivo
Padronizar o processamento inbound do webhook UAZAPI e o formato unico de evento encaminhado ao n8n.

### 24.2 Endpoint interno
- `POST /webhooks/uazapi/inbound`
- Escopo MVP: processar apenas `EventType = messages`.

### 24.3 Pipeline de processamento
1. Validar payload minimo (`EventType`, `token`, `message`).
2. Resolver instancia por `body.token` e obter `espaco_id`.
3. Aplicar idempotencia por `dedup_key = token_instancia + message.messageid`.
4. Ignorar grupos (`isGroup=true`) e loops (`wasSentByApi=true`).
5. Se `message_out` manual (`fromMe=true` e `wasSentByApi=false`): pausar IA da conversa e encerrar.
6. Se `message_in` e `ia_ativa=true`: normalizar evento e despachar para n8n.
7. Para `audio/image/document`: baixar midia via `POST /message/download` antes do despacho.

### 24.4 Regras de roteamento
- `message_in` texto: despacha para n8n.
- `message_in` audio/imagem/documento: download da midia + despacho para n8n.
- `message_in` com citacao (`contextInfo`): inclui `quoted_id`/`quoted_text` no evento.
- `message_out` manual: `ia_ativa=false`, `motivo_pausa=manual_restaurante`, sem despacho para n8n.

### 24.5 Download de midia (padrao aprovado)
Endpoint provider:
- `POST /message/download`

Parametros fixos no MVP:
- `id = message.messageid`
- `return_link = true`
- `return_base64 = false`
- `generate_mp3 = false`
- `transcribe = false`
- `download_quoted = false`

### 24.6 Envelope padrao para n8n
```json
{
  "request_id": "uuid",
  "received_at": "2026-04-21T00:00:00Z",
  "source": {
    "provider": "uazapi",
    "event_type": "messages"
  },
  "espaco": {
    "id": "esp_123",
    "ativo": true,
    "modulo_ia_ativo": true
  },
  "instancia": {
    "id_interno": "wpp_123",
    "nome": "iochain",
    "owner_numero": "5511936199026"
  },
  "conversa": {
    "chave": "esp_123:5511936199026:5511933851277",
    "ia_ativa": true,
    "numero_cliente": "5511933851277",
    "numero_recebedor": "5511936199026"
  },
  "cliente": {
    "id": "cli_789",
    "nome": "Alan Gomes",
    "telefone": "5511933851277"
  },
  "pedido_contexto": {
    "pedido_aberto": false,
    "numero_pedido": null,
    "status": null
  },
  "mensagem": {
    "id": "3B2716BBD72AC0479425",
    "id_unico": "5511936199026:3B2716BBD72AC0479425",
    "timestamp": 1776717886000,
    "direction": "in",
    "from_me": false,
    "tipo": "text",
    "texto": "oi",
    "reply": {
      "is_reply": false,
      "quoted_id": null,
      "quoted_text": null
    },
    "media": {
      "mimetype": null,
      "file_url": null,
      "file_name": null
    }
  },
  "agente": {
    "config": {},
    "prompt_final": "...",
    "tools_disponiveis": []
  },
  "meta": {
    "dedup_key": "token+messageid"
  }
}
```

### 24.7 Mapeamento de campos (origem -> normalizado)
- `body.token` -> `instancia.token_provider` (uso interno de resolucao)
- `body.instanceName` -> `instancia.nome`
- `body.owner` -> `instancia.owner_numero`
- `body.message.messageid` -> `mensagem.id`
- `body.message.id` -> `mensagem.id_unico`
- `body.message.sender_pn` -> `conversa.numero_cliente` (normalizado)
- `body.message.text` ou `body.message.content.text` -> `mensagem.texto`
- `body.message.content.mimetype` -> `mensagem.media.mimetype`
- `body.message.content.fileName` -> `mensagem.media.file_name`
- `body.message.content.contextInfo.stanzaID` -> `mensagem.reply.quoted_id`
- `body.message.content.contextInfo.quotedMessage.conversation` -> `mensagem.reply.quoted_text`

### 24.8 Erros e comportamento de resiliencia
- Em erro de parse/payload: registrar e responder `200` quando possivel para evitar tempestade de retries.
- Em erro de download de midia: registrar erro e manter processamento com fallback definido pela operacao.
- Em duplicidade de evento: responder `200` sem reprocessar.
