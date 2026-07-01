# Cursusorganisatie — Frontend Architectuur

Dit document geeft een overzicht van de frontend-architectuur van de **Cursusorganisatie**-tool (backend-module `CourseManagement`, bronmap `assets/spa-tools/course_management/`). Het behandelt de globale architectuur, de gehanteerde build-patronen en de programmeerpatronen. Voor diepgaande details wordt telkens doorverwezen naar de bestaande documentatie in de SPA zelf.

## Inhoudstafel

1. [Situering](#1-situering)
2. [Architectuur op hoog niveau](#2-architectuur-op-hoog-niveau)
3. [Mappenstructuur](#3-mappenstructuur)
4. [Build-patronen](#4-build-patronen)
5. [Programmeerpatronen](#5-programmeerpatronen)
6. [Verdere documentatie](#6-verdere-documentatie)

---

## 1. Situering

Cursusorganisatie is één van de tools die volgens het algemene SPA-patroon is opgebouwd (zie [FrontendPatterns.md](FrontendPatterns.md), sectie 3). Het is de **actief ontwikkelde referentie-implementatie**: nieuwe SPA-patronen worden hier het eerst uitgeprobeerd en gedocumenteerd, vooraleer ze naar andere tools doorstromen.

- **Twig-launcher:** [templates/course_management/index.html.twig](../templates/course_management/index.html.twig) — extends `base.html.twig`, injecteert bootstrapdata via een `<script id="app-config" type="application/json">`-blok, en mount de SPA op `<div id="app">`.
- **Backend-module:** `src/CourseManagement/` (Symfony) — zie [CodeArchitectuur.md](CodeArchitectuur.md) voor de algemene backend-opbouw.
- **Dev-poort:** `5174` (`assets/spa-tools/tools.json`).

## 2. Architectuur op hoog niveau

```
Twig-launcher                     Vue 3 SPA (assets/spa-tools/course_management/)
─────────────────                 ────────────────────────────────────────────────
index.html.twig                   main.js
  └─ app-config JSON  ──bootstrap──▶ appConfig → repositories → domain services
                                        → router → App.vue → mount('#app')
```

**Bootstrap-volgorde** (`src/main.js`):

1. `getAppConfig()` leest het `app-config` JSON-blok (feature flags, API base URIs, LTI-sessietoken, gebruikersrollen, …) en stelt het beschikbaar via `provideAppConfig()`.
2. `configureRepositories(appConfig)` initialiseert de HTTP-repositories met de juiste base-URI's en auth-headers.
3. `createAppRouter()` bouwt de Vue Router-instantie.
4. `autoProvideServices(app, services)` registreert elke domain service (zie [5.1](#51-domain-services-geen-pinia)) automatisch op de Vue-app via `app.provide()` — geen handmatige registratie per service nodig.
5. PrimeVue, ToastService, ConfirmationService en de `v-tooltip`-directive worden toegevoegd, en de app wordt gemount.

**Drie backends, drie repositories** (`shared/api/repositories/`):

| Repository | Backend | Auth |
|---|---|---|
| `OrganisatiebeheerRepository` | Container-API (cursuscontainers aanmaken/beheren) | `Authorization: Bearer <token>` |
| `HogentRepository` | HOGENT academische data-API | `X-LTI-Session` header |
| `DloRepository` | DLO-backend (deze applicatie) | `X-LTI-Session` header |

Alle HTTP-verkeer loopt via een gedeelde `Client` (`shared/lib/client/Client.js`) met uniforme foutklassen (`NetworkError`, `HTTPError`, `SessionExpiredError`, `ParseError`) — componenten en services vangen nooit rechtstreeks `fetch`-exceptions af.

**Editor-architectuur:** de cursus-editor werkt met een drieledige panel-hiërarchie (Cursus → Cursusgroep → Groepenset), telkens met een geïsoleerde bewerkkopie die pas bij opslaan wordt gediffed tegen het origineel. Zie `module-frontend-architecture.md` (sectie "Editor Panel Layout" e.v.) voor het volledige stroomdiagram.

## 3. Mappenstructuur

```
src/
├── main.js                # Bootstrap: appConfig → repositories → services → router → mount
├── app/                   # Root shell (App.vue, ContentRegistry, AppTheme)
├── router/                 # Vue Router (createWebHistory, navigatie-guards)
├── services/
│   ├── domain/             # Domain services — business logica + reactive state
│   ├── core/                # createService()/useLazyService()-fabriek
│   └── contexts/            # DependencyContext-wiring
├── entities/                # Domeinmodellen (Course, CourseGroup, GroupSet, User, …) + bijhorende UI
├── features/                 # Featuremodules: overview, editor, detail, picker, registration, action-requests
└── shared/
    ├── api/repositories/     # HTTP-clients per backend
    ├── components/            # Generieke UI-primitieven
    ├── composables/           # Herbruikbare Composition-API-logica
    ├── config/                # AppConfig / useAppConfig
    ├── content-registry/      # RegistryKey, useDynamicContainer
    └── lib/                    # client/, container/, diff/
```

Deze structuur volgt het **feature-first**-principe: gedeelde bouwstenen (`shared/`, `entities/`) staan los van de features die ze gebruiken (`features/`), en elke feature bundelt zijn eigen `components/`, `composables/` en `pages/`.

## 4. Build-patronen

De build draait op **Vite**, via de projectbrede fabriek in [vite.base.config.js](../vite.base.config.js). Zie [FrontendBuild.md](FrontendBuild.md) voor het volledige dev/productie-verhaal (`bin/fe`, entrypoints.json/manifest.json, Vite Status Toolbar).

**Toolspecifieke config** ([vite.config.js](../assets/spa-tools/course_management/vite.config.js)) roept enkel `createToolConfig('course_management', { plugins, manualChunks })` aan:

- **`unplugin-vue-components` + `PrimeVueResolver`** — auto-import van PrimeVue-componenten met `P`-prefix (`<PButton>`, …); geen handmatige `app.component()`-registraties nodig. Genereert `src/components.d.ts` voor IDE-ondersteuning.
- **Extra chunk-splitsing:** `@fortawesome/*` krijgt een eigen `vendor-fontawesome`-chunk, bovenop de projectbrede `vendor-vue`/`vendor-primevue`-chunks uit `vendorChunks()`.
- **Aliassen:** `@` → `src/`, `@shared` → `assets/spa-tools/shared/` (uit de basisconfig).
- **Tailwind CSS 4** via `@tailwindcss/vite`, geen aparte Tailwind-config nodig.

**Caching:** vendor-code (Vue-ecosysteem, PrimeVue, FontAwesome) wordt in aparte, langdurig gecachte chunks gebouwd — enkel `main-[hash].js` verandert bij elke deploy van applicatiecode.

**Testen:** Vitest, apart geconfigureerd (`vitest.config.js`), draait in de node-container via `npm run test:course_management`.

## 5. Programmeerpatronen

Cursusorganisatie is de referentie voor de patronen beschreven in `assets/spa-tools/course_management/doc/patterns.md`. Kort samengevat:

### 5.1 Domain services (geen Pinia)

State en business logica leven in injectable service-singletons, aangemaakt via `createService()` (`services/core/`):

```js
export const CoursesService = createService('CoursesService', initialState, defineCoursesServiceMethods);

// in een component:
const { state, service } = CoursesService.use();
```

`autoProvideServices()` registreert elke service automatisch bij het opstarten van de app. Componenten bevatten **nooit** business state — die hoort in de betrokken domain service. Er wordt bewust **geen Pinia/Vuex** gebruikt.

### 5.2 ContentRegistry (dynamische modals/drawers)

Pickers en panelen (`OlodPicker`, `UserPicker`, `CourseGroupParametersPanel`, …) worden geopend via een key-gebaseerd register (`RegistryKey` + `useDynamicContainer()`), zonder dat features onderling gekoppeld raken. Componenten worden centraal geregistreerd in `app/content-registry/ContentRegistry.js`.

### 5.3 Edit-session isolatie

Bewerkflows klonen de entiteit (`editableCourse`, `editableCourseGroup`, …) voordat ze bewerkbaar wordt. Wijzigingen raken nooit het origineel (`dependencyDefaultContext`) totdat bewust wordt opgeslagen; `EntityBuilder.prepareForUpdate()` berekent dan het minimale diff-payload. Bij annuleren van een vuile sessie onderschept een `SaveGuardDialog` de actie.

### 5.4 Composition API + composables

Alle SPA-componenten gebruiken `<script setup>` (Composition API). Herbruikbare logica wordt uit componenten getrokken naar composables (bv. `useCourseEditor`, `usePanelTransition`, `useFieldValidation`), elk met een duidelijke, enkelvoudige verantwoordelijkheid — in lijn met de SOLID-uitgangspunten uit [CodeArchitectuur.md](CodeArchitectuur.md#24-solid-principe).

### 5.5 Validatie

Formuliervalidatie loopt via `useFieldValidation` (reactieve `isFormValid`, `errors`, debounced `validateField`); DTO/entiteit-validatie op basis van `zod`-schema's.

### 5.6 Feature flags

Flags komen uit `app-config.featureFlags` en worden per omgeving (`development < test < staging < production`) geëvalueerd via `AppService.useService().isFeatureEnabled('flag')`.

### 5.7 Autosave

Wijzigingen tijdens een actieve editsessie worden gedebouncet (300 ms) weggeschreven naar `localStorage` (`useCourseEditorAutosave`), zodat een crash of per ongeluk sluiten van het tabblad geen werk verliest. Corrupte of onleesbare autosave-payloads worden stil opgeruimd.

## 6. Verdere documentatie

Dit document is een instapoverzicht. Voor detailwerk, gebruik onderstaande referentiedocumenten in `assets/spa-tools/course_management/doc/`:

| Document | Inhoud |
|---|---|
| `CLAUDE.md` | Mappenoverzicht + patroonverwijzingen (waar vind ik een voorbeeld van X) |
| `patterns.md` | De kernpatronen uit sectie 5, met codevoorbeelden |
| `module-frontend-architecture.md` | Volledige uitwerking van het drieledige editor-panelmodel, component-hiërarchie, save-sequenties |
| `domain-services.md` | Catalogus van alle domain services |
| `routing-and-backends.md` | Vue Router-routes en HTTP-backends in detail |
| `component-specs.md` | Per-component referentie (props, events, slots) |
| `user-flows.md` | Gebruikersrollen en end-to-end flows |
| `save-status.md` / `save-ux.md` | Dirty-tracking en save-UX-verificatie |

Projectbrede (niet-tool-specifieke) frontend-documentatie staat in dit `doc/`-mapje: [FrontendPatterns.md](FrontendPatterns.md) (SPA vs. MPA), [FrontendBuild.md](FrontendBuild.md) (Vite-pipeline) en [CodeArchitectuur.md](CodeArchitectuur.md) (algemene backend/frontend-architectuur en SOLID).
