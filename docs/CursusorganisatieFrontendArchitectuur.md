# Course Organization — Frontend Architecture

This document provides an overview of the frontend architecture of the **Course Organization** tool (backend module `CourseManagement`, source directory `assets/spa-tools/course_management/`). It covers the overall architecture, the build patterns used, and the programming patterns. For in-depth details, it consistently refers to the existing documentation within the SPA itself.

## Table of Contents

1. [Context](#1-context)
2. [High-level architecture](#2-high-level-architecture)
3. [Directory structure](#3-directory-structure)
4. [Build patterns](#4-build-patterns)
5. [Programming patterns](#5-programming-patterns)
6. [Further documentation](#6-further-documentation)

---

## 1. Context

Course Organization is one of the tools built according to the general SPA pattern (see [FrontendPatterns.md](FrontendPatterns.md), section 3). It is the **actively developed reference implementation**: new SPA patterns are tried out and documented here first, before they flow through to other tools.

- **Twig launcher:** [templates/course_management/index.html.twig](../templates/course_management/index.html.twig) — extends `base.html.twig`, injects bootstrap data via a `<script id="app-config" type="application/json">` block, and mounts the SPA on `<div id="app">`.
- **Backend module:** `src/CourseManagement/` (Symfony) — see [CodeArchitectuur.md](CodeArchitectuur.md) for the general backend structure.
- **Dev port:** `5174` (`assets/spa-tools/tools.json`).

## 2. High-level architecture

```
Twig-launcher                     Vue 3 SPA (assets/spa-tools/course_management/)
─────────────────                 ────────────────────────────────────────────────
index.html.twig                   main.js
  └─ app-config JSON  ──bootstrap──▶ appConfig → repositories → domain services
                                        → router → App.vue → mount('#app')
```

**Bootstrap order** (`src/main.js`):

1. `getAppConfig()` reads the `app-config` JSON block (feature flags, API base URIs, LTI session token, user roles, …) and makes it available via `provideAppConfig()`.
2. `configureRepositories(appConfig)` initializes the HTTP repositories with the correct base URIs and auth headers.
3. `createAppRouter()` builds the Vue Router instance.
4. `autoProvideServices(app, services)` automatically registers each domain service (see [5.1](#51-domain-services-no-pinia)) on the Vue app via `app.provide()` — no manual per-service registration needed.
5. PrimeVue, ToastService, ConfirmationService, and the `v-tooltip` directive are added, and the app is mounted.

**Three backends, three repositories** (`shared/api/repositories/`):

| Repository | Backend | Auth |
|---|---|---|
| `OrganisatiebeheerRepository` | Container API (create/manage course containers) | `Authorization: Bearer <token>` |
| `HogentRepository` | HOGENT academic data API | `X-LTI-Session` header |
| `DloRepository` | DLO backend (this application) | `X-LTI-Session` header |

All HTTP traffic runs through a shared `Client` (`shared/lib/client/Client.js`) with uniform error classes (`NetworkError`, `HTTPError`, `SessionExpiredError`, `ParseError`) — components and services never catch `fetch` exceptions directly.

**Editor architecture:** the course editor works with a three-tier panel hierarchy (Course → Course Group → Group Set), each with an isolated editable copy that is only diffed against the original on save. See `module-frontend-architecture.md` (section "Editor Panel Layout" and following) for the full flow diagram.

## 3. Directory structure

```
src/
├── main.js                # Bootstrap: appConfig → repositories → services → router → mount
├── app/                   # Root shell (App.vue, ContentRegistry, AppTheme)
├── router/                 # Vue Router (createWebHistory, navigation guards)
├── services/
│   ├── domain/             # Domain services — business logic + reactive state
│   ├── core/                # createService()/useLazyService() factory
│   └── contexts/            # DependencyContext wiring
├── entities/                # Domain models (Course, CourseGroup, GroupSet, User, …) + associated UI
├── features/                 # Feature modules: overview, editor, detail, picker, registration, action-requests
└── shared/
    ├── api/repositories/     # HTTP clients per backend
    ├── components/            # Generic UI primitives
    ├── composables/           # Reusable Composition API logic
    ├── config/                # AppConfig / useAppConfig
    ├── content-registry/      # RegistryKey, useDynamicContainer
    └── lib/                    # client/, container/, diff/
```

This structure follows the **feature-first** principle: shared building blocks (`shared/`, `entities/`) are decoupled from the features that use them (`features/`), and each feature bundles its own `components/`, `composables/`, and `pages/`.

## 4. Build patterns

The build runs on **Vite**, via the project-wide factory in [vite.base.config.js](../vite.base.config.js). See [FrontendBuild.md](FrontendBuild.md) for the full dev/production story (`bin/fe`, entrypoints.json/manifest.json, Vite Status Toolbar).

**Tool-specific config** ([vite.config.js](../assets/spa-tools/course_management/vite.config.js)) only calls `createToolConfig('course_management', { plugins, manualChunks })`:

- **`unplugin-vue-components` + `PrimeVueResolver`** — auto-import of PrimeVue components with a `P` prefix (`<PButton>`, …); no manual `app.component()` registrations needed. Generates `src/components.d.ts` for IDE support.
- **Extra chunk splitting:** `@fortawesome/*` gets its own `vendor-fontawesome` chunk, on top of the project-wide `vendor-vue`/`vendor-primevue` chunks from `vendorChunks()`.
- **Aliases:** `@` → `src/`, `@shared` → `assets/spa-tools/shared/` (from the base config).
- **Tailwind CSS 4** via `@tailwindcss/vite`, no separate Tailwind config needed.

**Caching:** vendor code (Vue ecosystem, PrimeVue, FontAwesome) is built into separate, long-term cached chunks — only `main-[hash].js` changes with each deploy of application code.

**Testing:** Vitest, configured separately (`vitest.config.js`), runs in the node container via `npm run test:course_management`.

## 5. Programming patterns

Course Organization is the reference for the patterns described in `assets/spa-tools/course_management/doc/patterns.md`. In brief:

### 5.1 Domain services (no Pinia)

State and business logic live in injectable service singletons, created via `createService()` (`services/core/`):

```js
export const CoursesService = createService('CoursesService', initialState, defineCoursesServiceMethods);

// in a component:
const { state, service } = CoursesService.use();
```

`autoProvideServices()` registers each service automatically at app startup. Components **never** hold business state — that belongs in the relevant domain service. **No Pinia/Vuex** is used, by deliberate choice.

### 5.2 ContentRegistry (dynamic modals/drawers)

Pickers and panels (`OlodPicker`, `UserPicker`, `CourseGroupParametersPanel`, …) are opened via a key-based registry (`RegistryKey` + `useDynamicContainer()`), without features becoming coupled to one another. Components are registered centrally in `app/content-registry/ContentRegistry.js`.

### 5.3 Edit-session isolation

Edit flows clone the entity (`editableCourse`, `editableCourseGroup`, …) before it becomes editable. Changes never touch the original (`dependencyDefaultContext`) until a deliberate save; `EntityBuilder.prepareForUpdate()` then computes the minimal diff payload. When a dirty session is cancelled, a `SaveGuardDialog` intercepts the action.

### 5.4 Composition API + composables

All SPA components use `<script setup>` (Composition API). Reusable logic is extracted from components into composables (e.g. `useCourseEditor`, `usePanelTransition`, `useFieldValidation`), each with a clear, single responsibility — in line with the SOLID principles from [CodeArchitectuur.md](CodeArchitectuur.md#24-solid-principe).

### 5.5 Validation

Form validation runs through `useFieldValidation` (reactive `isFormValid`, `errors`, debounced `validateField`); DTO/entity validation based on `zod` schemas.

### 5.6 Feature flags

Flags come from `app-config.featureFlags` and are evaluated per environment (`development < test < staging < production`) via `AppService.useService().isFeatureEnabled('flag')`.

### 5.7 Autosave

Changes made during an active edit session are debounced (300 ms) and written to `localStorage` (`useCourseEditorAutosave`), so that a crash or accidentally closing the tab does not lose any work. Corrupt or unreadable autosave payloads are cleaned up silently.

## 6. Further documentation

This document is an introductory overview. For detailed work, use the following reference documents in `assets/spa-tools/course_management/doc/`:

| Document | Content |
|---|---|
| `CLAUDE.md` | Directory overview + pattern references (where do I find an example of X) |
| `patterns.md` | The core patterns from section 5, with code examples |
| `module-frontend-architecture.md` | Full elaboration of the three-tier editor panel model, component hierarchy, save sequences |
| `domain-services.md` | Catalog of all domain services |
| `routing-and-backends.md` | Vue Router routes and HTTP backends in detail |
| `component-specs.md` | Per-component reference (props, events, slots) |
| `user-flows.md` | User roles and end-to-end flows |
| `save-status.md` / `save-ux.md` | Dirty-tracking and save-UX verification |

Project-wide (non-tool-specific) frontend documentation lives in this `doc/` folder: [FrontendPatterns.md](FrontendPatterns.md) (SPA vs. MPA), [FrontendBuild.md](FrontendBuild.md) (Vite pipeline), and [CodeArchitectuur.md](CodeArchitectuur.md) (general backend/frontend architecture and SOLID).
