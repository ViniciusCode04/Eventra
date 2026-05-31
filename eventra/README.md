# Eventra — Frontend

Painel de monitoramento de jobs do **JobProcessor**, com identidade visual cyberpunk (azul ciano + roxo).

## Stack

- React 18 + Vite + TypeScript
- Tailwind CSS
- Framer Motion
- TanStack Query (React Query)
- React Router DOM
- Axios
- Recharts

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- API JobProcessor rodando em `http://localhost:5000`

## Como rodar

```bash
cd eventra
npm install
npm run dev
```

Acesse: **http://localhost:5173**

## Configuração

Copie `.env.example` para `.env`:

```env
VITE_API_URL=http://localhost:5000
```

## Páginas

| Rota | Descrição |
|------|-----------|
| `/` | Dashboard com contadores, gráfico e últimos jobs |
| `/jobs` | Tabela completa com filtros e modal de criação |
| `/jobs/:id` | Detalhe do job com status em tempo real |

## CORS

O backend JobProcessor já está configurado para aceitar requisições de `http://localhost:5173`.

## Subir tudo junto (Docker)

Na pasta `JobProcessor/`:

```bash
docker-compose up --build --scale worker=2
```

| Serviço | URL |
|---------|-----|
| **Eventra (frontend)** | http://localhost:5173 |
| API | http://localhost:5000 |
| Swagger | http://localhost:5000/swagger |
| RabbitMQ UI | http://localhost:15672 (guest/guest) |

O container **eventra** usa nginx e faz proxy de `/api` para o serviço **api** — sem CORS no browser.

## Desenvolvimento local (sem Docker no front)

```bash
cd eventra
npm install
npm run dev
```

Configure `.env` com `VITE_API_URL=http://localhost:5000` e garanta que a API aceita CORS em `http://localhost:5173`.
