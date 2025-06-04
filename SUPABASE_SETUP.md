# Configuração do Supabase para Digestly

Este documento descreve como configurar o Supabase para o projeto Digestly.

## Pré-requisitos

1. Conta no [Supabase](https://supabase.com)
2. Projeto Next.js configurado
3. Dependências do Supabase já instaladas

## Configuração Inicial

### 1. Criar Projeto no Supabase

1. Acesse o [dashboard do Supabase](https://app.supabase.com)
2. Clique em "New Project"
3. Escolha sua organização
4. Defina nome do projeto e senha do banco
5. Selecione uma região próxima aos seus usuários

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Preencha as variáveis com os dados do seu projeto Supabase:

```env
# Encontre estes valores em Settings > API do seu projeto Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

# Configure um secret aleatório para NextAuth
NEXTAUTH_SECRET=seu-secret-aleatorio
NEXTAUTH_URL=http://localhost:3000
```

### 3. Executar o Schema do Banco

1. No dashboard do Supabase, vá para "SQL Editor"
2. Copie todo o conteúdo do arquivo `database/schema.sql`
3. Cole no editor e execute

Isso criará:
- Todas as tabelas necessárias
- Índices para performance
- Políticas RLS (Row Level Security)
- Triggers automáticos
- Função para criação automática de perfis

### 4. Configurar Autenticação

1. No dashboard, vá para "Authentication > Settings"
2. Configure os providers desejados (Email, Google, etc.)
3. Defina as URLs de redirecionamento:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://seu-dominio.com/auth/callback`

## Estrutura do Banco de Dados

### Tabelas Principais

- **profiles**: Perfis de usuário (estende auth.users)
- **content_sources**: Fontes de conteúdo dos usuários
- **content_items**: Itens de conteúdo coletados
- **saved_content**: Conteúdo salvo pelos usuários
- **digest_history**: Histórico de digests enviados
- **user_preferences**: Preferências dos usuários

### Relacionamentos

```
auth.users (Supabase Auth)
    ↓
profiles (1:1)
    ↓
content_sources (1:N)
    ↓
content_items (1:N)
    ↑
saved_content (N:N)
```

## Segurança

### Row Level Security (RLS)

Todas as tabelas têm políticas RLS configuradas que garantem:
- Usuários só acessam seus próprios dados
- Operações são validadas no nível do banco
- Proteção contra acesso não autorizado

### Validação de Dados

- Constraints de banco garantem integridade
- Validação de tipos no TypeScript
- Sanitização de inputs nas APIs

## APIs Disponíveis

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/auth/logout` - Logout

### Perfil
- `GET /api/profile` - Buscar perfil
- `PUT /api/profile` - Atualizar perfil

### Fontes de Conteúdo
- `GET /api/content-sources` - Listar fontes
- `POST /api/content-sources` - Criar fonte
- `GET /api/content-sources/[id]` - Buscar fonte
- `PUT /api/content-sources/[id]` - Atualizar fonte
- `DELETE /api/content-sources/[id]` - Deletar fonte

### Conteúdo Salvo
- `GET /api/saved-content` - Listar salvos
- `POST /api/saved-content` - Salvar conteúdo
- `GET /api/saved-content/[id]` - Buscar salvo
- `PUT /api/saved-content/[id]` - Atualizar salvo
- `DELETE /api/saved-content/[id]` - Deletar salvo

### Itens de Conteúdo
- `GET /api/content-items` - Listar conteúdo

## Hooks React Disponíveis

- `useAuth()` - Gerenciamento de autenticação
- `useContentSources()` - Gerenciamento de fontes
- `useSavedContent()` - Gerenciamento de salvos
- `useContentItems()` - Busca de conteúdo

## Desenvolvimento

### Testando a Configuração

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Acesse `http://localhost:3000`
3. Teste o registro/login de usuários
4. Verifique se os dados são criados no Supabase

### Debugando

- Use o dashboard do Supabase para monitorar queries
- Logs estão disponíveis em "Logs & Analytics"
- Use `console.log` nas APIs para debug local

## Produção

### Variáveis de Ambiente

Configure as mesmas variáveis no seu provedor de hosting:
- Vercel: Project Settings > Environment Variables
- Netlify: Site Settings > Environment Variables

### URLs de Callback

Atualize as URLs de callback no Supabase para seu domínio de produção.

### Monitoramento

Configure alertas no Supabase para:
- Uso de banco de dados
- Autenticações
- Erros de API

## Próximos Passos

1. Implementar coleta automática de feeds RSS
2. Adicionar sistema de digests por email
3. Configurar cache para performance
4. Implementar analytics de uso
