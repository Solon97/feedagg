# ARCHITECTURE - feedagg

## Visao de alto nivel
- Camada UI (App Router pages + components)
- Camada de estado cliente (contexts + hooks)
- Camada BFF (app/api) para autenticacao/forward seguro
- API externa como fonte de dados de dominio

## Fluxo principal
1. Usuario autentica com Supabase
2. Cliente obtem token de sessao
3. Hooks chamam lib/api -> /api/* local
4. Rotas /api validam Authorization e repassam para API externa
5. Dados retornam para hooks e componentes

## Modulos relevantes
- app/*: paginas e route handlers
- components/*: componentes de UI e fluxo
- contexts/*: auth, dashboard, item selecionado
- hooks/*: consumo de API e estado de negocio
- lib/*: api client, middleware helpers, seguranca URL

## Fronteiras
- Frontend nao processa feed bruto; delega para backend.
- Regras de assinatura final ficam no backend; frontend reflete status.
