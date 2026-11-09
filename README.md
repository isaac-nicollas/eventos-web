# Plataforma de Eventos — Web e API (Next.js)

Painel web para o administrador cadastrar e gerenciar eventos, e a API REST consumida pelo
[aplicativo mobile](https://github.com/isaac-nicollas/eventos-mobile) (React Native + Expo).

**Tecnologias:** Next.js (App Router), PostgreSQL, Prisma ORM, JWT (jsonwebtoken), bcryptjs, zod, Tailwind CSS.

## Pré-requisitos

- Node.js 20+
- PostgreSQL em execução (local ou Docker)

Exemplo com Docker:

```bash
docker run --name eventos-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=eventos -p 5432:5432 -d postgres:16
```

## Como executar

```bash
npm install
cp .env.example .env        # ajuste DATABASE_URL e JWT_SECRET se necessário
npm run db:migrate          # aplica as migrations no banco
npm run db:generate         # gera o Prisma Client
npm run db:seed             # cria o administrador e eventos de exemplo
npm run dev                 # http://localhost:3000
```

O servidor sobe em `0.0.0.0` para que o celular na mesma rede Wi-Fi consiga acessar a API.

**Painel web:** abra `http://localhost:3000` e entre com o administrador do seed
(padrão: `admin@eventos.com` / `admin123`, configurável em `ADMIN_EMAIL` e `ADMIN_PASSWORD` no `.env`).
No painel é possível cadastrar, listar, ver detalhes, editar e excluir eventos.

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão do PostgreSQL |
| `JWT_SECRET` | Chave de assinatura dos tokens (obrigatória em produção) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credenciais do administrador criado pelo seed |

## Modelo de dados (Prisma)

- **User** (`id`, `name`, `email` único, `password` com hash, `isAdmin`)
- **Event** (`id`, `title`, `description`, `date`, `time`, `location`, `image`)
- **Registration** (`id`, `userId`, `eventId`) — relaciona usuários e eventos; `@@unique([userId, eventId])`
  impede inscrição duplicada e `onDelete: Cascade` remove as inscrições ao excluir um usuário ou evento.

Migrations em `prisma/migrations/`.

## Endpoints

| Método | Endpoint | Descrição | Acesso |
|---|---|---|---|
| GET | `/api/events` | Listar eventos | Público |
| GET | `/api/events/:id` | Consultar evento | Público |
| POST | `/api/events` | Criar evento | Admin |
| PUT | `/api/events/:id` | Atualizar evento | Admin |
| DELETE | `/api/events/:id` | Excluir evento | Admin |
| POST | `/api/auth/register` | Cadastrar usuário | Público |
| POST | `/api/auth/login` | Login (devolve `{ user, token }`) | Público |
| GET | `/api/registrations` | Listar inscrições do usuário | Usuário autenticado |
| POST | `/api/events/:id/registrations` | Inscrever usuário no evento | Usuário autenticado |
| DELETE | `/api/registrations/:id` | Cancelar inscrição | Usuário autenticado |

Rotas autenticadas exigem o header `Authorization: Bearer <token>`.
Os dados enviados são validados com **zod** (`src/lib/validations.ts`); erros retornam `{ "error": "mensagem" }`
com status 400 (dados inválidos), 401 (sem token/token inválido), 403 (sem permissão), 404 e 409 (conflito).

O arquivo `api.http` contém exemplos de todas as requisições.

## Estrutura

```
prisma/               schema.prisma, migrations/ e seed.mjs
src/lib/              prisma.ts, auth.ts (JWT), validations.ts (zod), http.ts, client-api.ts, format.ts
src/app/api/          rotas da API (auth, events, registrations)
src/app/              painel web: / (lista), /login, /events/new, /events/[id], /events/[id]/edit
src/components/       AdminShell (proteção de rota) e EventForm
```

## Integração com o app mobile

No app, defina `EXPO_PUBLIC_API_URL` com o IP da máquina onde esta API roda
(ex.: `http://192.168.0.10:3000/api`). No emulador Android, use `http://10.0.2.2:3000/api`.
