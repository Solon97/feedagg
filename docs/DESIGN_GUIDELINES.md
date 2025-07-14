# FeedAgg - Design Guidelines

Este documento contém instruções de design para o app **FeedAgg**, com base nas telas atuais. Siga estas diretrizes ao criar ou modificar componentes da UI.

---

## 🎨 Paleta de Cores

| Elemento             | Cor (aproximada)       | Exemplo                            |
| -------------------- | ---------------------- | ---------------------------------- |
| Fundo principal      | `#0F172A` (Slate 900)  | Fundo do app                       |
| Cartões/feed cards   | `#1E293B` (Slate 800)  | Cards de feed e detalhes de artigo |
| Texto primário       | `#F8FAFC` (Slate 50)   | Títulos, descrições principais     |
| Texto secundário     | `#94A3B8` (Slate 400)  | Metadados, datas                   |
| Botões primários     | `#14B8A6` (Teal 500)   | Botões como “Add Feed”, “Refresh”  |
| Fundo do ícone ativo | `#0EA5E9` (Sky 500)    | Feed ativo, status, etc            |

---

## 🧱 Layouts

### 1. **Dashboard / Tela "Your Feed"**

- Layout em duas colunas:
  - Esquerda: filtros (`Search by title`, `Filter by feed`, `Filter by type`)
  - Direita: lista de artigos/cards
- Cada card de artigo possui:
  - Título (clique para abrir o detalhe)
  - Tags (e.g. "The Startup", "YouTube")
  - Data de publicação
  - Ícone de feed (ex: TED, YouTube)
  - Resumo com início do conteúdo
  - Link externo (`<a target="_blank">`) no canto superior direito

### 2. **Tela de Detalhe do Artigo**

- Header com botão **Back to Feed** e botão verde “Read Original”
- Imagem de capa centralizada e com bordas arredondadas
- Corpo do artigo com:
  - Título
  - Sub-informações (autor, data)
  - Tempo estimado de leitura
  - Corpo formatado em Markdown com ênfase, títulos e negrito
- Rodapé com autor e avatar (centralizado)

### 3. **Tela de Vídeo (YouTube)**

- Título em destaque, com tag vermelha “YouTube Short” se aplicável
- Embed de vídeo YouTube responsivo (usando `<iframe>`)
- Descrição do vídeo abaixo com botão “Show More”
- Botão verde “Watch on YouTube” no topo direito

### 4. **Gerenciador de Feeds**

- Campo de entrada para nova URL de feed (RSS ou canal YouTube)
- Botão “+ Add Feed” visível ao lado direito do campo
- Lista de feeds com:
  - Nome do feed
  - Status (Active / Inactive)
  - Último fetch
  - Ações: Mutar, Desativar ou Remover

---

### Botão

- **Botões primários:** Cor teal com texto branco, arredondado, sem sombra
- **Botões secundários:** Borda branca/transparente, ícones simples

---

## 🔠 Tipografia

| Elemento            | Fonte | Peso     | Tamanho (aprox.) |
| ------------------- | ----- | -------- | ---------------- |
| Título principal    | Inter | Bold     | 24px+            |
| Subtítulo/meta info | Inter | Medium   | 14px             |
| Corpo do artigo     | Inter | Regular  | 16px             |
| Tags/labels         | Inter | Semibold | 12px             |

---

## ✅ Checklist para Novos Componentes

- [ ] Compatível com tema escuro
- [ ] Suporta responsividade
- [ ] Usa cores e tipografia padrão
- [ ] Links externos com ícone/link visível
