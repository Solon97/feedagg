# FeedAgg Frontend - AI Coding Agent Instructions

## Project Overview

FeedAgg is a **Portuguese-first PWA** (Progressive Web App) for aggregating RSS feeds and YouTube channels. Built with **Next.js 15 App Router**, **TypeScript**, **Tailwind CSS**, and **Supabase** for authentication. The app emphasizes **offline-first PWA capabilities** with sophisticated caching strategies.

## Key Architecture Patterns

### PWA-First Design

- **Service Worker**: Generated via `scripts/build-sw.mjs` using Workbox - NEVER use next-pwa (conflicts with App Router)
- **Custom build process**: `pnpm build` runs Next.js build then generates SW automatically
- **Caching strategies**: CacheFirst for static assets, NetworkFirst for navigation with `/offline` fallback
- **Update notifications**: `SwUpdater` component with aggressive cache clearing on updates

### API Architecture

- **Proxy pattern**: Frontend `/api` routes proxy to external API (`EXTERNAL_API_URL`)
- **Consistent error handling**: Use `lib/api-middleware.ts` with `withApiLogging()`, `makeExternalApiCall()`, `handleExternalApiResponse()`
- **Authentication flow**: Supabase JWT tokens forwarded to external API
- **No direct database access**: All data operations go through external API

### Security Implementation

- **OAuth token cleanup**: Automatic URL cleaning via `lib/url-security.ts` and `middleware.ts`
- **Dedicated callback**: `/auth/callback` page handles OAuth returns securely
- **Multi-layer protection**: Middleware, AuthContext, and useSecureAuth hook all clean sensitive URLs
- **All API routes authenticated**: No public endpoints - all `/api/*` routes require authentication

## Development Workflows

### Essential Commands

```bash
pnpm dev                    # Development with hot reload
pnpm build                  # Production build + SW generation
pnpm start                  # Production server
export NEXT_PUBLIC_PWA_DISABLE=1 pnpm dev  # Disable PWA in dev
```

### PWA Testing

- Build required for SW: `pnpm build && pnpm start`
- Test offline: DevTools → Network → Offline
- Install test: Chrome shows install button, mobile shows "Add to Home Screen"

### API Development

- All new API routes must use `lib/api-middleware.ts` pattern
- External API calls go through `makeExternalApiCall()` for logging/error handling
- Supabase auth tokens automatically forwarded with `Bearer` header

## Project-Specific Conventions

### File Organization

- `app/` - Next.js App Router (pages, APIs, auth)
- `components/` - React components (use shadcn/ui in `components/ui/`)
- `contexts/` - React Context providers (AuthProvider, SelectedItemProvider)
- `hooks/` - Custom hooks (use- prefix, handle loading/error states)
- `lib/` - Utilities (api, supabase, logger, security)
- `docs/` - Comprehensive technical documentation

### Component Patterns

- **Authentication**: Use `useAuth()` hook, wrap protected content with auth checks
- **API calls**: Use `apiService` from `lib/api.ts`, handle loading/error states in components
- **Internationalization**: Use `useLocalizedTranslations()` hook, store messages in `messages/`
- **PWA updates**: Register SW in root layout with `SwUpdater` component

### Styling Conventions

- **Dark theme default**: Slate color palette, theme provider with system support
- **Mobile-first**: Responsive design with special mobile classes in globals.css
- **CSS variables**: Use shadcn/ui CSS custom properties for theming
- **Utility classes**: Custom animations like `animate-fade-in`, `animate-bounce-subtle`

## Critical Integration Points

### Stripe Integration

- **Dynamic pricing**: Fetch from `/api/stripe/prices`, display in `PricingCard` components
- **Checkout flow**: Create session via `/api/stripe/checkout`, redirect to Stripe hosted checkout
- **Success/cancel pages**: Handle post-checkout redirects at `/subscription/success|cancel`

### External API Communication

- **Base URL**: Configure `EXTERNAL_API_URL` environment variable
- **Authentication**: Forward Supabase JWT tokens with every request
- **Error handling**: Use `ExternalApiError` class for proper error propagation
- **Logging**: All external calls logged via structured logging in `lib/logger.ts`

### Authentication Flow

- **OAuth providers**: Google, Microsoft via Supabase
- **Callback security**: OAuth tokens cleaned from URLs immediately after processing
- **Session management**: Handled by AuthContext, persisted across app restarts
- **YouTube integration**: Special OAuth flow for channel subscriptions

## Environment Variables

```bash
# Required
EXTERNAL_API_URL=https://api.feedagg.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional
NEXT_PUBLIC_PWA_DISABLE=1        # Disable PWA in development
NEXT_PUBLIC_BASE_PATH=/subpath   # Deploy to subdirectory
```

## Common Pitfalls to Avoid

- Don't use `next-pwa` package (breaks App Router)
- Don't create public API endpoints - all `/api/*` routes require authentication
- Don't expose OAuth tokens in URLs (automatic cleanup handles this)
- Don't bypass `api-middleware.ts` for external API calls
- Don't forget to handle loading/error states in components
- Don't hardcode strings - use i18n system even for dev work

## Key Files to Reference

- `scripts/build-sw.mjs` - PWA service worker configuration
- `lib/api-middleware.ts` - API proxy and error handling patterns
- `contexts/auth-context.tsx` - Authentication state management
- `docs/PWA.md` - Comprehensive PWA implementation guide
- `docs/STRIPE_INTEGRATION.md` - Payment flow documentation
