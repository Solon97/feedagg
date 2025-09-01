# PWA (Progressive Web App)

O FeedAgg é um PWA completo que pode ser instalado em dispositivos móveis e desktop.

## Recursos PWA

- ✅ **Installable**: Pode ser instalado como app nativo
- ✅ **Offline**: Funciona offline com cache inteligente  
- ✅ **Updates**: Notificações automáticas de atualização
- ✅ **Mobile-first**: Interface otimizada para mobile
- ✅ **Fast**: Cache estratégico para performance

## Desenvolvimento

### Build com PWA
```bash
npm run build
```
O service worker é gerado automaticamente após o build do Next.js.

### Desativar PWA (desenvolvimento)
```bash
export NEXT_PUBLIC_PWA_DISABLE=1
npm run dev
```

### Gerar ícones
```bash
npm install canvas  # dependência opcional
node scripts/generate-icons.mjs
```

## Estratégias de Cache

- **Estáticos** (`/_next/static/**`, fontes, imagens locais): `CacheFirst` com revisionamento
- **Imagens externas**: `StaleWhileRevalidate` com expiração de 30 dias
- **HTML/Navegação**: `NetworkFirst` com timeout de 3s e fallback `/offline`
- **APIs internas**: Nunca cacheadas (todas requerem autenticação)
- **Feeds externos**: `NetworkFirst` com cache de 24h

## URLs Importantes

- **Manifest**: `/manifest.webmanifest`
- **Service Worker**: `/sw.js` (gerado automaticamente)
- **Página Offline**: `/offline`

## Lighthouse PWA

Para passar no audit PWA do Lighthouse:
- ✅ Manifest com ícones 192px e 512px
- ✅ Service worker registrado
- ✅ Funciona offline (página `/offline`)
- ✅ HTTPS em produção
- ✅ Viewport mobile-friendly
- ✅ Theme color e meta tags

## Notas Técnicas

- Compatible com App Router do Next.js 15
- Mantém SSR ativo
- Não usa `next-pwa` (conflitos com App Router)
- Service worker via Workbox Build
- Cache-Control headers respeitados
