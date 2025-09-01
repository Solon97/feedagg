# Otimizações de API - Dashboard

Este documento descreve as otimizações implementadas para reduzir drasticamente as chamadas à API na rota raiz da aplicação.

## Problemas Identificados

Antes das otimizações, a aplicação fazia múltiplas chamadas simultâneas:

1. **useFeeds()** - busca feeds do usuário
2. **useSubscription()** na Navbar - busca status da subscription  
3. **useTopics()** no DashboardFilter - busca tópicos com has_active_feeds=true
4. **useTopics()** no TopicSelection - busca tópicos com has_active_feeds=true (DUPLICADO)
5. Múltiplas chamadas HEAD para verificar mudanças nos feeds
6. Múltiplas chamadas GET subsequentes após as verificações HEAD

## Soluções Implementadas

### 1. Hook Unificado (`use-dashboard-data.ts`)

Criado um hook unificado que busca todos os dados necessários em uma única chamada paralela:

```typescript
// Busca tudo em paralelo
const [feedsResponse, topicsResponse, subscriptionResponse] = await Promise.allSettled([
  apiService.getUserFeeds(),
  apiService.getTopics(true),
  userId ? apiService.getUserSubscriptionStatus(userId) : Promise.resolve(null)
]);
```

**Benefícios:**
- ✅ 3 chamadas paralelas ao invés de múltiplas sequenciais
- ✅ Gerenciamento centralizado de estados de loading
- ✅ Tratamento unificado de erros
- ✅ Uma única fonte de verdade para os dados

### 2. Context Provider (`dashboard-context.tsx`)

Implementado um contexto React para compartilhar dados entre componentes:

```typescript
<DashboardProvider>
  <DashboardContent />
</DashboardProvider>
```

**Benefícios:**
- ✅ Elimina chamadas duplicadas
- ✅ Dados compartilhados entre Navbar, DashboardFilter e TopicSelection
- ✅ Sincronização automática de estados

### 3. Cache de API (`api-cache.ts`)

Sistema de cache inteligente com TTL para evitar chamadas redundantes:

```typescript
// Verifica cache primeiro
const cachedData = apiCache.get(cacheKey, 30000); // 30s TTL
if (cachedData) {
  // Usa dados do cache
  return cachedData;
}
```

**Benefícios:**
- ✅ Evita chamadas repetitivas em curto período
- ✅ TTL configurável (30s por padrão)
- ✅ Prevenção de requisições concorrentes
- ✅ Cache invalidado em refresh/mutations

### 4. Throttling de API (`use-api-throttle.ts`)

Hook para throttle de chamadas frequentes:

```typescript
const throttledCallback = useAPIThrottle(fetchData, 3000); // 3s
```

**Benefícios:**
- ✅ Previne spam de requisições
- ✅ Otimiza performance
- ✅ Reduz carga no servidor

### 5. Props Drilling Inteligente

Os componentes agora recebem dados como props ao invés de fazer suas próprias chamadas:

```typescript
// DashboardFilter recebe topics como prop
<DashboardFilter topics={topics} />

// TopicSelection recebe topics como prop  
<TopicSelection topics={topics} topicsLoading={loading} />
```

**Benefícios:**
- ✅ Elimina chamadas duplicadas nos componentes filhos
- ✅ Dados sempre sincronizados
- ✅ Loading states centralizados

### 6. Navbar Otimizada

A Navbar agora tenta usar dados do contexto da Dashboard quando disponível:

```typescript
// Tenta usar contexto primeiro
try {
  subscriptionData = useSubscriptionFromDashboard();
} catch {
  // Fallback para hook individual se não estiver no contexto
  subscriptionData = useSubscription(user?.id);
}
```

**Benefícios:**
- ✅ Reutiliza dados já carregados
- ✅ Fallback graceful para outras páginas
- ✅ Compatibilidade mantida

## Resultados Esperados

### Antes (Múltiplas Chamadas):
```
[HEAD] /feed/user-feeds
[GET] /feed/user-feeds
[GET] /subscriptions/user/{id}/active  
[GET] /topics?has_active_feeds=true (DashboardFilter)
[GET] /topics?has_active_feeds=true (TopicSelection) # DUPLICADA
[HEAD] /feed/user-feeds (refresh automático)
[GET] /topics?has_active_feeds=true (refresh automático)
... (mais chamadas repetitivas)
```

### Depois (Otimizado):
```
# Carregamento inicial - paralelo
[GET] /feed/user-feeds ──┐
[GET] /topics?has_active_feeds=true ──┤ (Promise.allSettled)
[GET] /subscriptions/user/{id}/active ──┘

# Próximas interações - cache/contexto
(sem chamadas adicionais por 30s)
```

## Melhorias de Performance

- **Redução de ~70% nas chamadas à API**
- **Carregamento inicial mais rápido** (chamadas paralelas)
- **Menor latência** (cache + throttling)
- **Melhor UX** (estados de loading centralizados)
- **Menos carga no servidor**

## Como Testar

1. Abra as DevTools > Network
2. Navegue para a rota raiz (`/`)
3. Compare o número de requisições:
   - **Antes**: 6-10+ requisições simultâneas/sequenciais
   - **Depois**: 3 requisições paralelas iniciais apenas

## Manutenção Futura

- O cache pode ser configurado via TTL conforme necessário
- Novos dados podem ser facilmente adicionados ao hook unificado
- O contexto é extensível para novas funcionalidades
- Sistema de invalidação de cache já implementado
