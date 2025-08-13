# Correção do Redirecionamento para /offline no Mobile

## Problema Identificado

Após implementar as medidas de segurança OAuth, a aplicação estava redirecionando automaticamente para a página `/offline` no mobile, mesmo quando havia conexão de internet.

## Causa Raiz

O problema estava na configuração do **Service Worker PWA** (arquivo `scripts/build-sw.mjs`):

1. **navigateFallback agressivo**: Estava configurado para redirecionar para `/offline` quando qualquer navegação falhasse
2. **Conflito com rotas de auth**: As novas rotas `/auth/callback` estavam sendo interceptadas pelo service worker
3. **Timeout muito baixo**: NetworkFirst com apenas 3 segundos de timeout no mobile

## Soluções Implementadas

### 1. Service Worker - Exclusões Específicas
```javascript
navigateFallbackDenylist: [
  /\\.\w+$/, // assets with file extensions
  new RegExp("^" + runtimeBase + "/_next"),
  new RegExp("^" + runtimeBase + "/api"),
  new RegExp("^" + runtimeBase + "/auth/callback"), // ✅ Novo
  /\/auth\/.*/, // ✅ Novo - Excluir todas rotas de auth
],
```

### 2. Estratégia NetworkOnly para Auth
```javascript
// Auth routes - always network, no cache
{
  urlPattern: ({ url }) => url.pathname.startsWith(runtimeBase + "/auth"),
  handler: "NetworkOnly", // ✅ Sem cache para rotas de autenticação
},
```

### 3. Middleware - Skip PWA Files
```javascript
// Skip middleware for service worker and PWA files
if (
  request.nextUrl.pathname === "/sw.js" ||
  request.nextUrl.pathname === "/manifest.webmanifest" ||
  request.nextUrl.pathname === "/offline" ||
  request.nextUrl.pathname.startsWith("/_next/")
) {
  return response;
}
```

### 4. Matcher atualizado
```javascript
"/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|offline|robots.txt|sitemap.xml).*)"
```

### 5. Callback Page - Correção de Hook
- Removido uso do `useSecureAuth` que estava causando loop
- Voltou a usar `router.replace()` diretamente
- Redirecionamento correto para `/feeds` após login

### 6. Componentes de UX Offline
- **OnlineStatusIndicator**: Barra de status quando offline
- **Página /offline aprimorada**: Melhor UX com detecção de reconexão
- **Auto-redirect**: Redirecionamento automático quando conexão volta

## Arquivos Modificados

1. **scripts/build-sw.mjs** - Configuração do service worker
2. **middleware.ts** - Exclusão de rotas PWA
3. **app/auth/callback/page.tsx** - Correção do hook
4. **app/layout.tsx** - Indicador de status online
5. **app/offline/page.tsx** - Página offline aprimorada
6. **components/online-status.tsx** - Novo componente

## Resultado

- ✅ **Não redireciona mais para /offline** indevidamente no mobile
- ✅ **Auth callback funciona** corretamente
- ✅ **Tokens ainda são limpos** da URL (segurança mantida)
- ✅ **PWA continua funcionando** offline quando necessário
- ✅ **UX melhorada** com indicadores visuais de status

## Como Testar

1. **Mobile/Desktop**: Fazer login OAuth - deve ir para `/feeds`
2. **Offline real**: Desconectar internet - deve ir para `/offline` 
3. **Reconexão**: Conectar internet - deve redirecionar automaticamente
4. **Auth flow**: OAuth Google/Microsoft deve funcionar sem loops

A correção mantém todas as funcionalidades PWA e de segurança, mas resolve o problema de redirecionamento indevido no mobile.
