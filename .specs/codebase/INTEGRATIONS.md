# INTEGRATIONS - feedagg

## Supabase
- Uso para auth/session e OAuth providers.
- Token de sessao propagado para BFF e backend externo.

## Backend de dominio
- EXTERNAL_API_URL aponta para API do rss-feed-processor.
- BFF faz proxy autenticado e normaliza erro/resposta.

## Stripe
- Precos e checkout via /api/stripe/*.
- Redirecionamento para sucesso/cancel no frontend.

## YouTube API
- Endpoints locais para like/subscribe usam provider token OAuth.

## PWA
- Workbox para cache e atualizacao de service worker.
