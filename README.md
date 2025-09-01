# FeedAgg - Agregador de Blogs/YouTube

*Um PWA moderno para gerenciar seus Blogs e canais do YouTube*

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-green?style=for-the-badge)](https://web.dev/progressive-web-apps/)

## Overview

FeedAgg é um Progressive Web App (PWA) que permite agregar e gerenciar seus Blogs e canais do YouTube em um só lugar. Construído com Next.js 15, App Router, TypeScript e Tailwind CSS.

## 🚀 Recursos PWA

- ✅ **Installable**: Pode ser instalado como app nativo em dispositivos móveis e desktop
- ✅ **Offline**: Funciona offline com cache inteligente usando Workbox
- ✅ **Updates**: Notificações automáticas de atualização via service worker
- ✅ **Mobile-first**: Interface otimizada para dispositivos móveis
- ✅ **Fast**: Cache estratégico para performance otimizada

## 🛠 Desenvolvimento

### Pré-requisitos

- Node.js 18+
- pnpm (recomendado) ou npm

### Instalação

```bash
# Clone o repositório
git clone <repository-url>
cd front

# Instale dependências  
pnpm install

# Configure variáveis de ambiente
cp .env.example .env.local
# Configure EXTERNAL_API_URL e outras variáveis necessárias
```

### Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev

# Build de produção (inclui geração do service worker)
pnpm build

# Iniciar servidor de produção
pnpm start

# Gerar ícones PWA (requer: pnpm install canvas)
pnpm icons

# Linting
pnpm lint
```

### PWA - Build e Deploy

O service worker é gerado automaticamente durante o build:

```bash
pnpm build
```

Para desativar o PWA durante desenvolvimento:

```bash
export NEXT_PUBLIC_PWA_DISABLE=1
pnpm dev
```

## 📱 PWA - Estratégias de Cache

- **Arquivos estáticos** (`/_next/static/**`, fontes Google, imagens locais): `CacheFirst` com revisionamento automático
- **Imagens externas**: `StaleWhileRevalidate` com expiração de 30 dias (max 100 itens)  
- **Navegação/HTML**: `NetworkFirst` com timeout 3s e fallback para `/offline`
- **APIs internas**: Nunca cacheadas (todas requerem autenticação)
- **Feeds externos** (RSS/Atom/JSON): `NetworkFirst` com cache de 24h

## 🔧 Tecnologias

- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **Estilo**: Tailwind CSS + shadcn/ui
- **PWA**: Workbox Build + Workbox Window
- **Estado**: React Context + Hooks
- **Autenticação**: Supabase
- **Formulários**: React Hook Form + Zod

## 📁 Estrutura do Projeto

```
app/                    # App Router (Next.js 15)
├── api/               # API routes
├── auth/              # Autenticação (login/register)
├── feeds/             # Listagem de feeds
├── subscribe/         # Página de assinatura
└── offline/           # Página offline (PWA)

components/            # Componentes React
├── ui/               # shadcn/ui components  
└── ...               # Componentes do app

lib/                   # Utilitários
├── register-sw.ts    # Registro do service worker
└── ...

scripts/              # Scripts de build
├── build-sw.mjs      # Geração do service worker
└── generate-icons.mjs # Geração de ícones PWA

public/               # Assets estáticos
├── manifest.webmanifest # Manifest PWA
├── sw.js             # Service worker (gerado automaticamente)
└── icons/            # Ícones PWA
```

## 🌐 URLs Importantes

- **App**: `/` - Página principal
- **Feeds**: `/feeds` - Listagem de feeds
- **Assinatura**: `/subscribe` - Planos premium
- **Manifest PWA**: `/manifest.webmanifest`  
- **Service Worker**: `/sw.js`
- **Offline**: `/offline` - Fallback offline

## ✅ Lighthouse PWA Checklist

Para passar no audit PWA do Lighthouse, o app possui:

- ✅ Manifest com `name`, `short_name`, `start_url`, `display: "standalone"`
- ✅ Ícones 192x192 e 512x512 pixels (+ maskable icons)
- ✅ Service worker registrado e funcional
- ✅ Funciona offline (página `/offline` como fallback)
- ✅ HTTPS em produção (required for PWA)
- ✅ Viewport mobile-friendly
- ✅ Theme color configurado via `viewport` export
- ✅ Apple touch icon e metas iOS/Android
- ✅ Cache estratégico respeitando headers HTTP

## 🚀 Deploy

O projeto é compatível com:

- **Vercel** (recomendado para Next.js)
- **Netlify** 
- **Railway**
- Qualquer plataforma que suporte Next.js

### Variáveis de Ambiente Necessárias

```bash
# API Externa (required)
EXTERNAL_API_URL=https://api.feedagg.com

# Supabase (required)  
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# PWA (optional)
NEXT_PUBLIC_PWA_DISABLE=0  # Set to 1 to disable PWA
NEXT_PUBLIC_BASE_PATH=     # If deploying to subpath
```

## 📝 Notas Técnicas

- Compatible com **App Router** do Next.js 15
- Mantém **SSR** ativo (não é um SPA)
- Não usa `next-pwa` (conflitos com App Router)
- Service worker via **Workbox Build** (estratégia manual)
- Headers de segurança via **middleware.ts**
- Cache-Control headers otimizados para APIs

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch  
5. Abra um Pull Request

---

*Built with ❤️ using Next.js, TypeScript, and Workbox*
