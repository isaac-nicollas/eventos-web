# Plataforma de Eventos — Web e API (Next.js)

Sistema web para gerenciamento de eventos e API REST consumida pelo aplicativo mobile
[eventos-mobile](https://github.com/isaac-nicollas/eventos-mobile) (React Native + Expo).

O **administrador** cadastra e gerencia os eventos pelo painel web. Os **usuários** consultam os eventos e
fazem inscrições pelo aplicativo mobile.

> Atividade avaliativa de Desenvolvimento Mobile — IFMA, Campus Timon.
> **Autores:** Isaac Nicollas e Ismael Lucas

## Tecnologias

- [Next.js](https://nextjs.org/) (App Router) — painel web e API REST
- [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM](https://www.prisma.io/) — banco de dados, relacionamentos e migrations
- [JWT](https://jwt.io/) (`jsonwebtoken`) e `bcryptjs` — autenticação e hash de senhas
- [zod](https://zod.dev/) — validação dos dados enviados à API
- Tailwind CSS — estilo do painel

## Funcionalidades

**Painel web (administrador)**
- Login restrito a administradores
- Cadastrar, listar, visualizar detalhes, editar e excluir eventos

**API REST**
- Cadastro e login de usuários (token JWT)
- CRUD de eventos (escrita apenas para administradores)
- Inscrição em eventos, listagem e cancelamento das inscrições do usuário

## Pré-requisitos

- Node.js 20 ou superior
- PostgreSQL em execução (local ou Docker)

Subindo o PostgreSQL com Docker:

```bash
docker run --name eventos-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=eventos \
  -p 5432:5432 -d postgres:16
```

Se o container já existir, basta `docker start eventos-db`.

## Como executar

```bash
# 1. Instalar as dependências
npm install

# 2. Criar o arquivo de variáveis de ambiente
cp .env.example .env          # Windows: copy .env.example .env

# 3. Aplicar as migrations, gerar o Prisma Client e criar o administrador
npm run db:migrate
npm run db:generate
npm run db:seed

# 4. Iniciar o servidor
npm run dev
```

O servidor sobe em `http://localhost:3000` e escuta em todas as interfaces (`0.0.0.0`), para que o celular
na mesma rede Wi-Fi consiga acessar a API.

### Acesso ao painel

Abra `http://localhost:3000` e entre com o administrador criado pelo seed:

| E-mail | Senha |
|---|---|
| `admin@eventos.com` | `admin123` |

Os valores podem ser alterados com `ADMIN_EMAIL` e `ADMIN_PASSWORD` no `.env` antes de rodar o seed.
Contas criadas pelo aplicativo mobile são de usuários comuns e **não** acessam o painel.

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão do PostgreSQL |
| `JWT_SECRET` | Chave usada para assinar os tokens (obrigatória em produção) |
| `ADMIN_EMAIL` | E-mail do administrador criado pelo seed (opcional) |
| `ADMIN_PASSWORD` | Senha do administrador criado pelo seed (opcional) |

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` / `npm start` | Gera o build e inicia em modo produção |
| `npm run db:migrate` | Aplica as migrations no banco |
| `npm run db:generate` | Gera o Prisma Client |
| `npm run db:seed` | Cria o administrador e eventos de exemplo |
| `npm run lint` | Executa o ESLint |

## Modelo de dados

```
User 1 ──── N Registration N ──── 1 Event
```

- **User:** `id`, `name`, `email` (único), `password` (hash), `isAdmin`
- **Event:** `id`, `title`, `description`, `date`, `time` (`HH:mm`), `location`, `image` (URL)
- **Registration:** `id`, `userId`, `eventId`

Regras no banco: `@@unique([userId, eventId])` impede inscrição duplicada, e `onDelete: Cascade` remove as
inscrições quando um evento ou usuário é excluído. As migrations ficam em `prisma/migrations/`.

## Endpoints da API

| Método | Endpoint | Descrição | Acesso |
|---|---|---|---|
| GET | `/api/events` | Listar eventos | Público |
| GET | `/api/events/:id` | Consultar evento | Público |
| POST | `/api/events` | Criar evento | Administrador |
| PUT | `/api/events/:id` | Atualizar evento | Administrador |
| DELETE | `/api/events/:id` | Excluir evento | Administrador |
| POST | `/api/auth/register` | Cadastrar usuário | Público |
| POST | `/api/auth/login` | Login (retorna `{ user, token }`) | Público |
| GET | `/api/registrations` | Listar inscrições do usuário | Autenticado |
| POST | `/api/events/:id/registrations` | Inscrever usuário no evento | Autenticado |
| DELETE | `/api/registrations/:id` | Cancelar inscrição | Autenticado |

**Autenticação:** rotas protegidas exigem o header `Authorization: Bearer <token>`.

**Erros:** as respostas de erro têm o formato `{ "error": "mensagem" }` com os status:

| Status | Significado |
|---|---|
| 400 | Dados inválidos (validação com zod) |
| 401 | Sem token, token inválido ou expirado |
| 403 | Sem permissão (ação exclusiva de administrador) |
| 404 | Recurso não encontrado |
| 409 | Conflito (e-mail já cadastrado, inscrição repetida) |

O arquivo `api.http` traz exemplos de todas as requisições (extensão **REST Client** do VS Code).

## Estrutura do projeto

```
prisma/
  schema.prisma          modelos e relacionamentos
  migrations/            histórico de migrations
  seed.mjs               cria o administrador e eventos de exemplo
src/
  app/
    api/                 rotas da API (auth, events, registrations)
    page.tsx             painel: lista de eventos
    login/               login do administrador
    events/              novo evento, detalhes e edição
  components/            AdminShell (proteção de rota) e EventForm
  lib/
    prisma.ts            cliente Prisma
    auth.ts              JWT: assinatura, leitura do token, checagem de admin
    validations.ts       schemas de validação (zod)
    http.ts              tratamento padronizado de erros
    client-api.ts        chamadas à API feitas pelo painel
```

## Integração com o aplicativo mobile

No app, configure `EXPO_PUBLIC_API_URL` com o endereço desta API terminando em `/api`:

- Celular físico: `http://<IP-do-computador>:3000/api` (mesma rede Wi-Fi)
- Emulador Android: `http://10.0.2.2:3000/api`
- Simulador iOS: `http://localhost:3000/api`

## Solução de problemas

| Problema | Solução |
|---|---|
| `Can't reach database server` | Confirme que o PostgreSQL está rodando e que o `DATABASE_URL` está correto |
| Erro sobre `PrismaClient` | Rode `npm run db:generate` |
| Painel diz "sem permissão" | Rode `npm run db:seed` e entre com o administrador |
| App não conecta à API | Teste `http://<IP>:3000/api/events` no navegador do celular e libere a porta 3000 no firewall |
