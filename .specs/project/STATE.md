# STATE - feedagg

## Snapshot
- Estado: inicializado para workflow spec-driven.
- Data base: 2026-04-15.

## Decisoes
- Escopo inicial mantido em agregacao de conteudo + assinatura premium.
- pt-BR segue como lingua padrao da experiencia.
- BFF Next.js segue como camada de borda para API externa.

## Blockers
- Nenhum blocker tecnico critico registrado na inicializacao.

## Riscos observados
- Divergencia potencial de contrato HTTP entre BFF e backend em endpoints de validacao.
- Fluxos OAuth YouTube exigem rigor de redirecionamento e manutencao de estado.

## TODOs de curto prazo
- Validar contratos endpoint a endpoint entre feedagg e backend.
- Definir suite minima de testes para rotas /api criticas.
- Priorizar backlog de onboarding e premium para proxima iteracao.

## Backlog diferido
- Personalizacao avancada de recomendacoes.
- Camada analitica mais robusta de comportamento in-app.

## Preferencias
- Evitar sobreengenharia; priorizar incremento pequeno com verificacao rapida.
