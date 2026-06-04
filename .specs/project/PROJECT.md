# PROJECT - feedagg

## Visao
Feedagg e um PWA focado em consolidar atualizacoes de blogs e canais do YouTube em um unico painel limpo, rapido e sem distracoes.

## Problema
Usuarios acompanham conteudo em varias fontes e perdem contexto entre apps, com ruido de interfaces e baixa organizacao por interesse.

## Objetivo do Produto
Entregar uma experiencia unica para descobrir, filtrar e consumir atualizacoes relevantes com organizacao por topicos, suporte a mobile/PWA e monetizacao por assinatura premium.

## Objetivos de Negocio
- Aumentar retencao de usuarios recorrentes via dashboard centralizado.
- Converter usuarios free para premium com limite de feeds ativos no plano gratuito.
- Garantir experiencia confiavel em cenarios de conectividade instavel via recursos PWA.

## Objetivos Tecnicos
- Manter frontend em Next.js App Router com BFF em rotas /api.
- Encapsular autenticacao e propagacao segura de token para API externa.
- Preservar localizacao pt-BR e en, com padrao pt-BR.

## Escopo Inicial (In)
- Autenticacao social com Supabase.
- Dashboard de itens agregados com filtros e paginacao.
- Gestao de feeds e topicos do usuario.
- Integracao Stripe Checkout para assinaturas.
- Acoes YouTube (like e subscribe) com token OAuth do provedor.
- PWA com fallback offline e atualizacao de service worker.

## Fora de Escopo Inicial (Out)
- Motor de processamento RSS no frontend.
- Painel administrativo multi-tenant.
- Recomendacao por ML.

## Personas
- Leitor heavy de conteudo tecnico e noticias.
- Criador/consumidor de conteudo no YouTube que quer menos ruido.

## Restricoes
- Dependencia de API externa para dados de feed e assinatura.
- Dependencia de Supabase para sessao e OAuth.
- Dependencia de Stripe para pagamento.

## Sinais de Sucesso
- Tempo para primeiro feed ativo baixo.
- Uso recorrente do dashboard.
- Conversao de free para premium.
- Queda de erros de autenticacao e de chamadas API no BFF.
