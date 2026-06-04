# TESTING - feedagg

## Estado atual observado
- Nao ha suite de testes claramente padronizada no root do frontend.

## Estrategia recomendada
- Priorizar testes de integracao para route handlers /api criticos:
  - feeds/user-feed-items
  - feeds/subscribe
  - stripe/checkout
  - topics (GET/POST/DELETE)
- Cobrir hooks de negocio com foco em comportamento:
  - use-dashboard-data
  - use-feeds
  - use-subscription

## Gate minimo sugerido
- Lint verde
- Testes de contrato BFF para endpoints criticos
- Validacao manual dos fluxos auth + checkout em ambiente dev
