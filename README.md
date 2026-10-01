# Just Do It

Just Do It is a personal life organizer with a responsive React interface for daily tasks, habits, health routines, study, career planning, hobbies, and goals.

## Current architecture

The application is being moved from browser-only storage to an authenticated API. The account/session, profile, task, habit, hydration, supplement, self-care, and hobby paths are currently server-backed:

```text
React feature modules → AppContext → domain repositories → API client
  → Express REST API → Prisma 7 → PostgreSQL
```

Theme preference remains local to the browser. Several other feature domains still use the existing `StorageService` and localStorage repositories; their API migration and legacy-data import are not yet complete. Do not treat the application as fully synchronized across devices until those domains have been migrated.

## Technology

- React 19, TypeScript, and Vite 8
- Express 5 REST API
- Prisma 7 with the PostgreSQL adapter
- PostgreSQL 17 (Docker Compose is provided for local development)
- Zod request validation, bcrypt password hashing, database-backed opaque sessions
- Vitest and Supertest for API tests

## Requirements

- Node.js 24 or newer
- npm
- Docker Compose (or a separately managed PostgreSQL 17 database)

## Local development

1. Install dependencies:

   ```bash
   npm install
   npm --prefix backend install
   ```

2. Start PostgreSQL, then configure the API:

   ```bash
   docker compose up -d postgres
   cp backend/.env.example backend/.env
   ```

   Update `DATABASE_URL` in `backend/.env` if your PostgreSQL credentials or port differ.

3. Create the schema and generate the Prisma client:

   ```bash
   npm run db:migrate
   ```

4. Start the API and frontend in separate terminals:

   ```bash
   npm run dev:api
   npm run dev
   ```

The Vite development server proxies `/api` to `http://localhost:4000`. The API health check is available at `http://localhost:4000/api/health` and checks database connectivity.

## Environment variables

For local development, copy `backend/.env.example` to `backend/.env`. Production values are separate; `backend/.env.production.example` contains placeholders only and must not be used as a committed secrets file.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `NODE_ENV` | `development`, `test`, or `production` |
| `PORT` | API listen port (default `4000`) |
| `FRONTEND_ORIGINS` | Comma-separated exact browser origins allowed by CORS |
| `SESSION_COOKIE_NAME` | HttpOnly session cookie name |
| `SESSION_TTL_DAYS` | Database session lifetime, 1–90 days |
| `SESSION_COOKIE_SAME_SITE` | `lax`, `strict`, or `none`; defaults to `lax` |
| `PASSWORD_MIN_LENGTH` | Minimum password length, at least 12 |
| `TRUST_PROXY_HOPS` | Number of trusted reverse proxies, 0–2 |

### Netlify/frontend

Netlify must provide `VITE_API_URL=<public HTTPS URL of the deployed backend API>` in its production environment (for example, `https://api.example.com`; origin only, without `/api`). Netlify injects it when building the frontend. The build warns but proceeds if it is missing; the deployed app requires this setting for production API requests. If set, the build rejects insecure, localhost, or malformed API origins. API requests include credentials.

### Backend service

Set these in the Node.js API host's production environment:

| Variable | Production value |
| --- | --- |
| `NODE_ENV` | `production` |
| `PORT` | Use the port assigned by the API host; defaults to `4000` |
| `DATABASE_URL` | Private PostgreSQL connection string supplied by the database provider, using TLS as that provider requires |
| `FRONTEND_ORIGINS` | Exact HTTPS Netlify origin(s), comma-separated, e.g. `https://example.netlify.app,https://www.example.com`; no paths or trailing slash |
| `SESSION_COOKIE_SAME_SITE` | `none` when Netlify and API are on different sites; `lax` works for same-site custom domains such as `app.example.com` and `api.example.com` |
| `SESSION_COOKIE_NAME` | Optional; defaults to `jid_session` |
| `SESSION_TTL_DAYS` | Optional; defaults to 30 (allowed 1–90 days) |
| `PASSWORD_MIN_LENGTH` | Optional; defaults to 12 (allowed 12–128) |
| `TRUST_PROXY_HOPS` | Set to the API host's trusted proxy hop count (commonly `1`) |

The backend rejects production startup if `DATABASE_URL` or `FRONTEND_ORIGINS` is missing. Production cookies are always `Secure` and `HttpOnly`. `SameSite=None` is needed for cross-site Netlify/API domains; browsers can restrict third-party cookies, so a shared custom registrable domain for frontend and API is preferable when available. CORS only permits exact configured origins, with credentials enabled. Never commit `.env` files or credentials.

## Production deployment (Netlify + hosted API + PostgreSQL)

Netlify serves only the static React/Vite frontend. It does not run this Express server. Deploy `backend/` as a Node.js service and use a managed PostgreSQL database reachable from that service. The API health endpoint is `/api/health`.

1. Provision a PostgreSQL database and obtain its private connection URL. Do not reset or recreate an existing production database.
2. Deploy `backend/` to a Node.js API host with `backend/` as its service root directory. Use build command `npm ci && npm run build` and start command `npm start`. (If the provider builds from the repository root instead, use `npm --prefix backend ci && npm --prefix backend run build` and `npm --prefix backend start`.) Set the backend production variables above in that host. Keep credentials there, never in Netlify.
3. Before publishing the API, apply pending committed migrations with the production `DATABASE_URL` securely set: `npm run db:deploy` from the repository root, or `npm run db:deploy` with `backend/` as the working directory. It runs `prisma migrate deploy` and does not reset data. Never use `npm run db:migrate` against production.
4. In Netlify, connect the repository root, set `VITE_API_URL` to the API's HTTPS origin, and deploy. The checked-in `netlify.toml` sets Node 24, validates the API origin when supplied, runs `npm run build:web`, publishes `dist`, and adds the SPA fallback to `index.html`.
5. Set the backend `FRONTEND_ORIGINS` to the exact Netlify production origin (and any custom frontend domain). Add a deploy-preview origin only if preview access is required. Restart/redeploy the API after changing environment variables.
6. Verify `https://<api-host>/api/health`, then create an account and sign in through the deployed Netlify site. Confirm requests go to the API host, registration/login return `jid_session` with `Secure; HttpOnly`, and the browser sends that cookie on `/api/auth/me`.

To inspect migration status without applying changes, run `cd backend && npx prisma migrate status` with the production `DATABASE_URL` supplied securely. This repository has no production database credentials or selected cloud provider, so production connectivity and migration status must be verified during deployment.

## Database and seed

- `npm run db:migrate` runs Prisma's development migration workflow; use locally only.
- `npm run db:deploy` applies committed migrations in deployment environments (production-safe; no reset).
- `npm run db:seed` is a no-op unless all three seed variables are provided: `SEED_USER_EMAIL`, `SEED_USER_NAME`, and `SEED_USER_PASSWORD` (12–72 UTF-8 bytes). The seed password is hashed before storage.
- `npm --prefix backend run db:generate` regenerates the Prisma client.

The initial migration is in `backend/prisma/migrations/`. The schema models the existing application domains and ownership relationships. Only the account, profile, task, habit, hydration, supplement, self-care, and hobby routes are currently wired into the frontend/API path.

## Authentication and data handling

Registration and login use bcrypt-hashed passwords. The API stores only a hash of each random session token; the browser receives the token in an `HttpOnly`, `Secure` production cookie whose `SameSite` value is configured for the frontend/API domain relationship. Authenticated routes derive the user ID from that session and scope owned records on the server.

Existing browser data is not deleted by account registration or login. However, a guided import of legacy localStorage and IndexedDB data into an account has not yet been implemented. Remaining browser-backed repositories continue to use the local `StorageService`; browser exports are not a backup of PostgreSQL account data.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite frontend |
| `npm run dev:api` | Start the API with file watching |
| `npm run build:web` | Type-check and build the frontend |
| `npm run build:api` | Generate Prisma client and compile the API |
| `npm run build` | Build frontend and API |
| `npm run start:api` | Start the compiled API |
| `npm run test:api` | Run backend unit and route tests |
| `npm run lint` | Run Oxlint |
| `npm run preview` | Preview the frontend production build locally |

## Tests and known limitations

API tests cover session token handling, auth input validation, registration/session cookies, task ownership and pagination, supplement, self-care, and hobby ownership/validation, and hydration authentication/validation. Route tests use a mocked Prisma layer; they do not replace integration tests against a live PostgreSQL database. The current environment did not have a running PostgreSQL server or Docker, so migrations, seed execution, and live database connectivity have not been verified here.

The migration is in progress: workouts, academic and career records, goals, inspiration, and schedule are still browser-backed. There is not yet a complete data-import flow or end-to-end browser test suite. The frontend production build currently emits a Vite warning because its main JavaScript chunk exceeds 500 kB.

## Project layout

```text
src/                 React UI, contexts, types, and repositories
backend/src/         Express app, auth, validation, and API routes
backend/prisma/      Prisma schema, SQL migrations, and optional seed
compose.yaml         Local PostgreSQL service
```
# JUST-DO-IT
