# STRUCTURE - feedagg

## Diretorios de dominio
- app/: paginas App Router e API routes
- components/: UI e blocos de funcionalidade
- contexts/: estado compartilhado da aplicacao
- hooks/: logica de consumo e estado derivado
- lib/: utilitarios de integracao, auth e seguranca
- messages/: internacionalizacao
- public/: assets PWA e service worker
- scripts/: automacoes de build (ex.: SW)

## Rotas de produto
- / (dashboard)
- /feeds (gestao de feeds)
- /item/[id] (detalhe)
- /subscribe (planos)
- /auth/* (login/register/callback)

## BFF
- app/api/feeds/*
- app/api/topics/*
- app/api/subscriptions/*
- app/api/stripe/*
- app/api/youtube/*
