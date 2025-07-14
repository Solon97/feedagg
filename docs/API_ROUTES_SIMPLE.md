# API de Tópicos e Feeds - Documentação das Rotas

## 🏷️ Rotas de Tópicos

### 1. Criar Tópico
- **Rota:** `POST /topics`
- **Autenticação:** JWT obrigatório
- **Body:**
  ```json
  {
    "name": "string (1-50 caracteres, obrigatório)",
    "color": "string (hex color, opcional, ex: #FF5733)"
  }
  ```
- **Resposta (201):**
  ```json
  {
    "id": "uuid",
    "name": "string",
    "color": "string|null",
    "created_at": "ISO date",
    "updated_at": "ISO date"
  }
  ```

### 2. Listar Tópicos
- **Rota:** `GET /topics`
- **Autenticação:** JWT obrigatório
- **Parâmetros:** Nenhum
- **Resposta (200):** Array de tópicos

## 📡 Rotas de Feeds

### 3. Subscrever a Feed
- **Rota:** `POST /feed/subscribe`
- **Autenticação:** JWT obrigatório
- **Body:**
  ```json
  {
    "url": "string (URL válida, obrigatório)",
    "topic_id": "string (UUID, obrigatório)"
  }
  ```
- **Resposta (200):**
  ```json
  {
    "feed": { "id": "uuid", "name": "string", "url": "string", ... },
    "userFeed": { "user_id": "uuid", "feed_id": "uuid", "topic_id": "uuid", ... },
    "message": "string"
  }
  ```

### 4. Listar Feeds do Usuário
- **Rota:** `GET /feed/user-feeds`
- **Autenticação:** JWT obrigatório
- **Parâmetros:** Nenhum
- **Resposta (200):** Array de feeds do usuário

### 5. Atualizar Status do Feed
- **Rota:** `PUT /feed/user-feeds/:feed_id/status`
- **Autenticação:** JWT obrigatório
- **Parâmetros URL:** `feed_id` (UUID)
- **Body:**
  ```json
  {
    "is_active": "boolean"
  }
  ```

### 6. Cancelar Subscrição
- **Rota:** `DELETE /feed/user-feeds/:feed_id`
- **Autenticação:** JWT obrigatório
- **Parâmetros URL:** `feed_id` (UUID)
- **Resposta (200):** Mensagem de sucesso

### 7. Buscar Items de Feeds (com filtros)
- **Rota:** `GET /feed/user-feed-items`
- **Autenticação:** JWT obrigatório
- **Query Parameters:**
  - `limit` (número, opcional, 1-100, padrão: 20)
  - `offset` (número, opcional, mínimo: 0, padrão: 0)
  - `sort` (string, opcional, valores: `created_at|published_at`, padrão: `published_at`)
  - `order` (string, opcional, valores: `asc|desc`, padrão: `desc`)
  - `title` (string, opcional, busca no título)
  - `feed_id` (UUID, opcional, filtrar por feed específico)
  - `feed_type` (string, opcional, valores: `rss|youtube`)
  - `topic_id` (UUID, opcional, filtrar por tópico)

**Exemplos de uso:**
```
GET /feed/user-feed-items?topic_id=uuid&feed_type=rss&limit=10
GET /feed/user-feed-items?title=javascript&sort=created_at&order=asc
GET /feed/user-feed-items?feed_id=uuid&offset=20
```

## 🔐 Autenticação

Todas as rotas requerem JWT Bearer Token no header:
```
Authorization: Bearer <jwt_token>
```

## 📝 Validações

### Nome do Tópico
- Obrigatório
- 1-50 caracteres
- Único por usuário

### Cor do Tópico
- Opcional
- Formato hexadecimal (#RRGGBB)

### URL do Feed
- Obrigatório
- Formato de URL válida com protocolo

### Topic ID
- Obrigatório ao criar feed
- Deve existir e pertencer ao usuário

## ⚠️ Códigos de Erro

- `400` - Dados inválidos
- `401` - Não autenticado
- `404` - Recurso não encontrado
- `409` - Conflito (ex: tópico duplicado)

## 🔄 Fluxo Típico

1. **Criar tópicos** para organizar feeds
2. **Subscrever a feeds** associando a um tópico
3. **Filtrar items** por tópico para visualização organizada
4. **Gerenciar feeds** (ativar/desativar/remover)
