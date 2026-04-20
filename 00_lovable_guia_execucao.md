# Guia Rapido para Lovable (MVP v1)

## Objetivo
Este guia existe para facilitar a implementacao no Lovable sem ambiguidade.

## Ordem de leitura recomendada
1. `01_escopo_mvp.md` (o que entra e o que nao entra)
2. `02_handoff_lovable_frontend.md` (telas, menus e comportamento)
3. `05_whatsapp_agente_ia_n8n.md` (integracao WhatsApp + agente + eventos)
4. `03_backend_banco_api.md` (contratos tecnicos e APIs)

## Fonte de verdade por assunto
- Escopo funcional: `01_escopo_mvp.md`
- Telas e UX: `02_handoff_lovable_frontend.md`
- Regras do agente IA e webhook: `05_whatsapp_agente_ia_n8n.md`
- Banco e API: `03_backend_banco_api.md`

## Regras obrigatorias para implementacao no Lovable
- Usar termo `Espaco` na interface (nao usar `workspace`).
- Implementar responsivo para desktop e celular.
- Respeitar papeis e permissoes na UI (`admin`, `caixa`, `entregador`).
- Esconder acoes nao permitidas por perfil.
- Considerar pedidos do WhatsApp como fluxo principal do agente IA.
- Nao implementar itens marcados como fora do MVP.

## Fora do MVP (nao implementar agora)
- KDS (tela de cozinha).
- Emissao fiscal.
- Fidelidade e cupons.
- Multiunidade/franquias.
- Exportacao CSV/Excel/PDF.

## Checklist final para o Lovable
- Mapa de telas completo implementado.
- Estados de UI implementados (vazio, loading, erro, sucesso).
- Fluxos de pedido/comanda/fechamento funcionando na interface.
- Tela de configuracao WhatsApp com status de conexao.
- Tela de status da IA por conversa/numero (ativa/pausada).
- Componentes prontos para integrar com APIs definidas.
