# ROADMAP - feedagg

## Fase 0 - Baseline concluido
- App Router com paginas de auth, dashboard, feeds e assinatura.
- BFF em rotas /api para feed, topicos, subscriptions e stripe.
- Fundacao PWA (manifest, sw, offline).

## Fase 1 - Confiabilidade de contratos
Objetivo: reduzir friccao entre frontend e API externa.
- Consolidar contratos HTTP/metodos e payloads dos endpoints BFF.
- Padronizar respostas e erros no client API service.
- Cobrir fluxos criticos com testes de integracao de rotas /api.

## Fase 2 - Experiencia de onboarding
Objetivo: aumentar ativacao inicial.
- Melhorar fluxo de primeira inscricao de feed e selecao de topico.
- Guiar usuario sem feeds para primeiro resultado com menos passos.
- Instrumentar eventos de onboarding.

## Fase 3 - Premium e conversao
Objetivo: melhorar upgrade e gerenciamento de assinatura.
- Refinar UX da pagina de assinatura e estados de sucesso/cancel.
- Evidenciar limites do plano gratuito no momento certo.
- Monitorar funil de checkout ate retorno do usuario.

## Fase 4 - Leitura e retencao
Objetivo: aumentar tempo de uso e recorrencia.
- Melhorar pagina de item para leitura continua e contexto de origem.
- Fortalecer filtros e persistencia de preferencias de consulta.
- Otimizar carregamento incremental e feedback de estados.

## Fase 5 - PWA avancado
Objetivo: experiencia mobile resiliente.
- Ajustar estrategias de cache por tipo de recurso.
- Melhorar UX de reconexao e sincronizacao pos-offline.
- Medir impacto de atualizacoes de SW sem friccao.

## Dependencias externas continuas
- API de backend (rss-feed-processor)
- Supabase Auth
- Stripe
- APIs Google/YouTube
