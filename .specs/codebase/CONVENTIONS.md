# CONVENTIONS - feedagg

## Organizacao
- Alias de import com @/*.
- Separacao por responsabilidade: page/component/hook/lib/context.

## API interna
- Cliente em lib/api centraliza chamadas.
- Route handlers em app/api atuam como BFF.
- Header Authorization Bearer requerido para rotas protegidas.

## UX
- Fluxos autenticados usam ProtectedRoute.
- Mensagens de loading/error seguem padrao visual com componentes UI.

## Internacionalizacao
- defaultLocale pt-BR; suporte en.
- Textos de interface em messages/*.json.

## Seguranca
- Middleware define headers de seguranca.
- Tokens em URL sao limpos/redirecionados para callback.
