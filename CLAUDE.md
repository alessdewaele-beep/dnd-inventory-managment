# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A D&D inventory management app. Players track items; DMs view their campaign's players' inventories; Admins manage everything. Monorepo with two independent apps: `backend/` (Express 5 + MySQL) and `frontend/` (Vue 3 + Vite). Code comments and user-facing strings are in English.

## Commands

Frontend (`cd frontend`):
- `npm run dev` — Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the built bundle

Backend (`cd backend`):
- `npm start` — runs `node src/server.js` (port 3000, or `PORT`). No watch/dev script; restart manually after changes.

Full stack via Docker (uses prebuilt images `alessdw2003/{frontend,backend}:latest`, not local source):
- `docker-compose up` — frontend :8020, backend :3000, MySQL :3307, phpMyAdmin :8030

There are **no tests and no linter** configured in either app.

## Backend architecture

Strict layered pattern, one directory per layer under `backend/src/`. A request flows:

```
routes → controllers → services → repositories → database (mysql2 pool)
```

- **routes/** — Express routers, mounted in `server.js` (`/items`, `/users`, `/campaigns`). Attach `authenticate`/`authorize` middleware here. Controllers are bound with `.bind(controller)` because they're class methods.
- **controllers/** — HTTP concerns only (parse `req`, set status, shape `res`). Exported as **singleton instances** (`module.exports = new ItemController()`).
- **services/** — business logic and authorization checks (e.g. `itemService.canViewInventory`). Also singletons — **except** `UserService`, which exports the class (`module.exports = UserService`).
- **repositories/** — raw parameterized SQL via the shared `mysql2/promise` pool. Singletons.
- **models/** — plain data classes.

Cross-cutting:
- `database.js` — single connection pool. Reads `DB_*` env vars; `DB_SSL_CA` (PEM string, `\n`-escaped) enables SSL for the Aiven production DB.
- `config.js` — loads `JWT_SECRET` (throws on startup if missing) and `JWT_EXPIRES_IN` (default `1h`).
- `middleware/auth.js` — `authenticate` verifies the `Bearer` JWT into `req.user`; `authorize(...roles)` gates by `req.user.role`.
- Schema: `sql/schema.sql`. Note `items.userId` is camelCase (unusual for SQL here); most other columns are snake_case (`password_hash`, `created_at`, `dungeon_master_id`, `campaign_id`).

## Frontend architecture

Vue 3 (Composition API) under `frontend/src/`, organized by Clean-Architecture-style layers. The `@` alias maps to `src/`.

Data-access is a layered chain (dependency inversion):

```
Component → domain service → UseCase → ApiRepository → Client → fetch
                                        (extends DnDRepository, the abstract contract)
```

- **entities/** — domain classes (`User`, `Item`, `Roles`).
- **features/{feature}/** — `pages/`, `components/`, and `useCases/`. A UseCase is a class constructed with a repository and exposing `execute()` (single responsibility per operation).
- **shared/services/domain/** — domain services (`authService`, `itemsService`, …). These are the **stateful singletons**: each holds a Vue `reactive()` `state` object plus action functions, and wires up its UseCases with an `ApiRepository`. Components import the service and read/mutate `service.state`.
- **shared/api/repositories/** — `DnDRepository` (abstract; methods throw "not implemented") and `ApiRepository` (concrete; maps domain calls to `Client` HTTP calls).
- **shared/lib/client/Client.js** — fetch wrapper. Attaches the JWT from `localStorage` (`JWT_token`), throws typed errors (`NetworkError`/`HTTPError`/`ParseError`), and on a `401` **with a token present** clears the token and redirects to `#/`.
- **shared/composables/** — `useTheme`, `useNavigation`, `useRightManager`.

Key conventions:
- **Auth is client-decoded**: `authService` reads role/id/username by `jwtDecode`-ing the token in `localStorage`; there is no server round-trip for identity. Login stores the token; `isLoggedIn()` checks `exp`.
- **Routing** (`router/index.js`) uses **hash history** (`createWebHashHistory`). Route meta `requiresAuth` and `requiredRole` are enforced in a global `beforeEach` guard via `authService` + `useRightManager`.
- **PrimeVue** is the UI kit. Components are globally registered in `main.js` with a `p-` prefix (`p-datatable`, `p-button`, …). Theme is a custom `GoldAura` preset (gold `#d9b44a` primary) with dark mode via the `.dark` selector. Styling also uses Tailwind CSS v4 (`@tailwindcss/vite`).
- `VITE_API_URL` sets the backend base URL (defaults to `http://localhost:3000`).

### ⚠️ Role naming is inconsistent — verify before relying on it

Role strings differ across the codebase and are a live source of bugs:
- Backend/JWT and route guards use `"Admin"`, `"Player"`, and DM is expressed implicitly (a user is a campaign's `dungeon_master_id`).
- `frontend/src/entities/user/Roles.js` defines `ADMIN: "Admin"`, `PLAYER: "Player"`, `DM: "DM"`.
- `useRightManager.js` keys its hierarchy on `Player`/`DM`/`Admin`.

When touching authorization, check the exact string each side actually compares against rather than assuming consistency.

## Deployment

- `render.yaml` — Render deploys the backend as a Node web service (`rootDir: backend`, health check `/health`) and the frontend as a static site (`rootDir: frontend`, publishes `dist/`). All secrets (`DB_*`, `JWT_SECRET`, `VITE_API_URL`) are `sync: false` — set in the Render dashboard.
- Each app has its own `Dockerfile`. `docker-compose.yml` also defines `phpmyadmin-aiven` for inspecting the production Aiven MySQL (reads `backend/.env`).
