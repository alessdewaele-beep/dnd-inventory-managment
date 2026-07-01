# Frontend Patterns

This document describes the two frontend patterns used in this project, when to choose each, and the architectural conventions that apply to each.

## Inhoudstafel

1. [Two patterns: SPA vs MPA](#1-two-patterns-spa-vs-mpa)
2. [When to choose which](#2-when-to-choose-which)
3. [SPA: Vite-built Vue](#3-spa-vite-built-vue)
4. [MPA: Inline Vue in Twig](#4-mpa-inline-vue-in-twig)
5. [Dependency management for MPAs](#5-dependency-management-for-mpas)
6. [Hybrid rendering: the boundary problem](#6-hybrid-rendering-the-boundary-problem)
7. [Options API vs Composition API](#7-options-api-vs-composition-api)

---

## 1. Two patterns: SPA vs MPA

| | SPA | MPA                                                          |
|---|---|--------------------------------------------------------------|
| **Rendering** | Single `<div id="app">`, Vue Router manages all views | Multiple Symfony-rendered pages, Vue enhances specific areas |
| **Vue source** | `.vue` SFCs (Single File Components) under `assets/spa-tools/{tool}/src/` | Inline `<script>` in Twig templates                          |
| **Build** | Vite pipeline, `assets/spa-tools/{tool}/vite.config.js` | Optional CSS-only Vite config; no JS build required          |
| **Navigation** | Client-side (Vue Router, no full page reload) | Server-side (Symfony routes, form POSTs)                     |
| **Dependencies** | npm, version-locked, tree-shaken | npm via vendor bundle, or CDN (possibly avoid)               |
| **Examples** | `study_guide`, `course_management`, `attendance` | `internship`                                                 |

---

## 2. When to choose which

**Choose SPA when:**
- The tool has multiple views that share state across navigation
- Significant interactivity: complex forms, real-time updates, drag-and-drop, multi-step workflows
- The content is primarily dynamic — most of what the user sees comes from AJAX, not from the server render
- You need client-side routing with URL-based state (filters, selected items, pagination)
- The tool will grow: new views, new features, more state

**Choose MPA when:**
- The tool has one or two pages with limited interactivity
- Most content is static, server-rendered, and only small parts need Vue (a status stepper, a confirmation checkbox, a toggle)
- A full SPA would be overkill — the extra build complexity and client-side routing buys nothing
- At least one page is primarily read-only and benefits from fast server-rendered initial paint

**The rule of thumb:** if you're going to write Vue Router routes, use the SPA pattern. If you aren't, use the MPA pattern.

---

## 3. SPA: Vite-built Vue

See `doc/FrontendBuild.md` for the full build pipeline. The key conventions:

- Source under `assets/spa-tools/{tool}/src/`, organized by feature
- `.vue` SFCs with `<script setup>` (Composition API — see section 7)
- `vite.config.js` extends `vite.base.config.js`
- `vendorChunks()` splits Vue and PrimeVue into long-lived cached chunks
- Twig template is a thin shell: `<script type="application/json" id="app-config">` block + `<div id="app">`
- All data injection via the JSON config block, never scattered Twig variables inside `<div id="app">`

---

## 4. MPA: Inline Vue in Twig

The inline-Vue MPA keeps the Vue application logic inside the Twig template as a `<script>` block. This is appropriate for limited interactivity — roughly up to ~300 lines of app logic. Beyond that, maintenance becomes difficult and the SPA pattern should be considered.

### Twig template structure

```twig
{% extends 'base.html.twig' %}

{% block stylesheets %}
    {{ vite_entry_link_tags('main', {}, '{config_name}') }}
{% endblock %}

{% block body %}
    {# Server renders the static page shell: title, breadcrumb, nav #}
    <div class="container">
        <h1>Tool Title</h1>
    </div>

    {# Inject all data Vue needs in one place #}
    <script id="app-config" type="application/json">
        {{ { silos: silos, isTeacher: is_teacher }|json_encode|raw }}
    </script>

    {# Vue owns everything inside this div #}
    <div id="app"></div>
{% endblock %}

{% block javascripts %}
    {{ vite_entry_script_tags('main', {}, '{config_name}') }}

    <script type="module">
        import { createApp, ... } from 'vendor';

        const config = JSON.parse(document.getElementById('app-config').textContent);

        const app = createApp({
            delimiters: ['[[', ']]'],
            data() {
                return {
                    silos: config.silos,
                    isTeacher: config.isTeacher,
                    // runtime state
                    assignments: [],
                    isLoading: false,
                };
            },
            methods: { ... },
            computed: { ... },
        });

        app.use(PrimeVue, { theme: { preset: Aura } });
        app.component('p-button', Button);
        app.mount('#app');
    </script>
{% endblock %}
```

### Conventions

- **Always extend the shared base template.** Never write a standalone `base.html.twig` for a tool. If you need tool-specific head tags, add a `{% block stylesheets %}` override.
- **One data injection point.** All server data goes into a single `<script type="application/json" id="app-config">` block. No Twig variables scattered inside the Vue template area.
- **Vue owns its DOM area.** Everything inside `<div id="app">` is Vue. Everything outside is Twig. The line is structural and immediately visible.
- **Options API** in inline scripts — see section 7.
- **LTI session** in all fetch calls: `headers: { 'X-LTI-Session': config.ltiSessionId }`.

### What to do when the inline script grows too large

If the script grows past ~300 lines, consider:
1. **Extract named methods** — group related methods and add a short comment block. This buys readability without restructuring.
2. **Migrate to SPA** — create a `vite.config.js` with a JS entry, move logic to `.vue` SFCs. The Twig template shrinks to the same thin shell as other SPA tools.

---

## 5. Dependency management for MPAs

An MPA needs to load Vue, PrimeVue, and Tailwind somehow. There are two viable paths: CDN and the Vite pipeline. Each has trade-offs.

One exception that applies regardless of which path you choose: **never use the Tailwind Play CDN** (`cdn.tailwindcss.com`). It generates CSS at runtime in the browser on every page load and is explicitly flagged by Tailwind as a development tool not suitable for production. Every other CDN dependency is a legitimate option.

---

### Path A: CDN

Load dependencies from a public CDN (unpkg, jsDelivr, esm.sh). Version-pin every URL explicitly.

**Trade-offs:**
- No build step, no pipeline, nothing to maintain
- CDN outage makes the tool unavailable — unlikely, but possibly inconvenient at the wrong moment for an LTI tool in an academic context
- Version drift from the npm-managed SPA tools is real but manageable: pin to the same version that's in `package.json` and update them together. Add a comment in the template making the sync obligation explicit

There are two fundamentally different ways to load from CDN, with different implications for how you write the inline app:

#### Classic script tags (UMD/IIFE globals)

```html
<script src="https://unpkg.com/vue@3.5.13/dist/vue.global.prod.js"></script>
<script src="https://unpkg.com/primevue@4.3.1/umd/primevue.min.js"></script>
```

These set globals: `window.Vue`, `window.PrimeVue`. The inline script destructures from them:

```html
<script>
    const { createApp, ref, computed } = Vue;

    const app = createApp({
        delimiters: ['[[', ']]'],
        data() { ... },
    });
    app.use(PrimeVue.Config, { theme: { preset: PrimeUIX.Themes.Aura } });
    app.component('p-button', PrimeVue.Button);
    app.mount('#app');
</script>
```

Simple. No module system, no import map, works everywhere. The downside: you load the full UMD bundle (all ~100 PrimeVue components) regardless of how many you use.

#### ESM from CDN with an import map

CDN providers like [esm.sh](https://esm.sh) serve any npm package as a native ES module. Combined with an import map, the inline script looks identical to SPA code:

```html
<script type="importmap">
{
    "imports": {
        "vue": "https://esm.sh/vue@3.5.13",
        "primevue": "https://esm.sh/primevue@4.3.1",
        "primevue/config": "https://esm.sh/primevue@4.3.1/config",
        "primevue/button": "https://esm.sh/primevue@4.3.1/button",
        "@primevue/themes/aura": "https://esm.sh/@primevue/themes@4.3.1/aura"
    }
}
</script>

<script type="module">
    import { createApp, ref, computed } from 'vue';
    import PrimeVue from 'primevue/config';
    import Aura from '@primevue/themes/aura';
    import Button from 'primevue/button';

    const app = createApp({
        delimiters: ['[[', ']]'],
        data() { ... },
    });
    app.use(PrimeVue, { theme: { preset: Aura } });
    app.component('p-button', Button);
    app.mount('#app');
</script>
```

The import map can be rendered by a Twig macro, keeping the URL pinning in one place. Each import only loads the specific component, not the full bundle. The syntax is consistent with how you'd write a Vite SPA — no globals, no `window.Vue`.

The trade-off: the import map adds some complexity, and you're now loading multiple small requests instead of one large bundle (though HTTP/2 makes this less of a concern). esm.sh is an additional CDN dependency alongside unpkg.

---

### Path B: Vite pipeline

The Vite infrastructure is already in place. A CSS-only or CSS+vendor Vite config handles Tailwind and optionally Vue/PrimeVue from npm, with the same versioning as the SPA tools and served from your own server.

**CSS only** (Tailwind via Vite, Vue/PrimeVue from CDN):

```js
// assets/spa-tools/{tool}/vite.config.js
export default mergeConfig(baseConfig, defineConfig({
    base: '/spa-tools/{tool}/',
    build: {
        outDir: 'public/spa-tools/{tool}',
        rollupOptions: {
            input: {
                main: fileURLToPath(new URL('./main.css', import.meta.url)),
            },
        },
    },
}));
```

Vue and PrimeVue still come from CDN (UMD globals or ESM — your choice). Tailwind is built and hashed, served from your own server.

**CSS + vendor JS** (everything from npm, nothing from CDN):

Add a `vendor.js` entry that re-exports only what the inline app uses:

```js
// assets/spa-tools/{tool}/vendor.js
export { createApp, ref, computed, watch, onMounted } from 'vue';
export { default as PrimeVue } from 'primevue/config';
export { default as Aura } from '@primevue/themes/aura';
export { default as Button } from 'primevue/button';
// only the components the tool actually uses
```

With `preserveEntrySignatures: 'exports-only'`, Vite builds this as an ES module. An import map (generated by a Twig extension reading the Vite manifest) maps the bare `'vendor'` specifier to the hashed URL:

```html
{{ tool_import_map() }}

<script type="module">
    import { createApp, PrimeVue, Aura, Button } from 'vendor';
    ...
</script>
```

**What this gives you:** npm-managed versions aligned with the SPA tools, served from your own server, hashed filenames with automatic cache busting, managed via the same `bin/fe {tool} start|build|stop` workflow as SPA tools.

**The maintenance point:** when a new PrimeVue component is used in the template, add it to `vendor.js` and rebuild.

---

### Comparison

| | UMD globals (CDN) | ESM import map (CDN) | Vite pipeline |
|---|---|---|---|
| Build step | None | None | CSS + optional vendor JS |
| Bundle size | Full UMD (all components) | Only imported components | Only imported components |
| Script syntax | `const { createApp } = Vue` (globals) | `import { createApp } from 'vue'` | `import { createApp } from 'vue'` |
| Version control | Pin URL manually | Pin URL manually | `package.json` |
| CDN dependency | Yes | Yes (two CDNs) | No |
| Import map needed | No | Yes | Yes (for vendor entry) |
| Consistency with SPA code | Low | High | High |

For a new MPA tool, a reasonable starting point: **CDN with ESM import map** if you want to avoid a build step, or **Vite CSS + CDN UMD** if you want Tailwind managed but are happy with CDN for Vue/PrimeVue. The full Vite pipeline (CSS + vendor JS) makes sense when CDN reliability is a concern or when you want total version alignment with the SPA tools.

---

## 6. Hybrid rendering: the boundary problem

MPAs naturally mix two rendering layers in the same template:

```twig
{# Twig renders this at request time on the server #}
<h2>{{ assignment.title }}</h2>

{# Vue renders this in the browser at runtime #}
<div v-if="hasErrors">...</div>
```

The problem: a developer has to mentally track which layer controls what. Two different syntaxes, two different execution contexts (server vs browser), two different debug paths (controller vs devtools). On pages where both layers render the same data, there can be two sources of truth.

### The solution: a clear structural boundary

The server renders the static page shell. A single JSON block injects all data Vue needs. Vue owns everything inside `<div id="app">`. No Twig variables below the boundary line.

```twig
{# TWIG ZONE — server renders, never changes after response is sent #}
<div class="container">
    <h1>Page Title</h1>
    <nav>...</nav>
</div>

<script id="app-config" type="application/json">
    {{ pageData|json_encode|raw }}
</script>

{# VUE ZONE — Vue renders and controls everything below this div #}
<div id="app"></div>
```

**What belongs above the boundary (Twig):** page title, breadcrumb, static navigation, anything that cannot change after the page loads.

**What belongs below the boundary (Vue):** anything interactive, anything that might change (status, errors, loading states, user-triggered content).

**What never belongs in both:** the same data value rendered by Twig and also managed by Vue. Pick one layer. If Vue needs to update it, inject it into `data()` via the JSON block, not via `{{ variable }}` in the Vue template area.

### When a page is 90% static with minimal interactivity

For pages like the internship details view — mostly read-only server-rendered content with a small interactive widget — the boundary rule is relaxed. The detail content (company name, assignment description, agreement data) can be Twig-rendered. Only the interactive widget gets its own `<div id="widget-app">` with a small, focused Vue instance managing just that piece.

The key is to make the boundary **explicit and scoped** — one dedicated mount point per Vue instance, with clear ownership. Multiple small Vue instances on one page, each owning a well-defined area, are easier to reason about than one large Vue instance that partially overlaps with Twig-rendered content.

---

## 7. Options API vs Composition API

### Vue's position

Composition API is Vue's recommended approach for new projects. Options API is not deprecated and will continue to be supported, but it is increasingly the "legacy" path. Vue's own documentation recommends Composition API for production applications.

The key distinction: **Options API organizes code by option type** (`data`, `methods`, `computed`). **Composition API organizes code by concern**. For a small, simple component the difference is marginal. For anything non-trivial, Options API forces you to split related logic across three or more sections — the state for a feature in `data()`, its derived values in `computed`, its actions in `methods`. Composition API keeps them together.

### Composables — the real advantage

The strongest argument for Composition API is not `<script setup>` syntax. It is **composables**: plain functions that encapsulate reactive state, computed values, and actions around a single concern, and can be reused across any component.

```js
// useAssignments.js
import { ref, computed } from 'vue';

export function useAssignments(ltiSessionId) {
    const all = ref([]);
    const searchQuery = ref('');
    const isLoading = ref(false);

    const filtered = computed(() => {
        if (!searchQuery.value) return all.value;
        const q = searchQuery.value.toLowerCase();
        return all.value.filter(a => a.name.toLowerCase().includes(q));
    });

    async function load(silo) {
        isLoading.value = true;
        const res = await fetch(`/tools/internship/ajax/assignments?silo=${silo}`, {
            headers: { 'X-LTI-Session': ltiSessionId },
        });
        all.value = await res.json();
        isLoading.value = false;
    }

    return { all, filtered, searchQuery, isLoading, load };
}
```

This composable is independently readable, independently testable, and reusable across any component or script that needs assignment data. Options API has no equivalent mechanism — mixins are its nearest substitute and they are deprecated.

### `setup()` in inline MPA scripts

`<script setup>` is SFC-specific syntax sugar — it requires `.vue` files. But `setup()` itself is just a regular option in `createApp({...})` and works perfectly in an inline `<script>` without SFCs:

```js
createApp({
    delimiters: ['[[', ']]'],
    setup() {
        const assignments = ref([]);
        const isLoading = ref(false);
        const searchQuery = ref('');

        const filtered = computed(() => {
            if (!searchQuery.value) return assignments.value;
            const q = searchQuery.value.toLowerCase();
            return assignments.value.filter(a => a.name.toLowerCase().includes(q));
        });

        async function load(silo) {
            isLoading.value = true;
            assignments.value = await fetchAssignments(silo);
            isLoading.value = false;
        }

        onMounted(() => load(config.defaultSilo));

        // explicit return makes the template's public interface visible at a glance
        return { assignments, filtered, isLoading, searchQuery, load };
    }
}).mount('#app');
```

Everything from Composition API is available: `ref`, `computed`, `watch`, `onMounted`, and composables. The only things you lose compared to `<script setup>` in SFCs are syntax sugar — an explicit `return` statement is required, and there is no automatic component registration. Neither is a real limitation in an inline script context.

The explicit `return` is arguably an advantage here: it makes the template's public interface visible in one place. You can see at a glance exactly what the template has access to.

### Composables in inline MPA scripts

Composables are not SFC-exclusive. They work equally well called from `setup()` in an inline script. Composable files live under `assets/spa-tools/{tool}/composables/` and are imported via ESM:

```html
<script type="module">
    import { createApp, onMounted } from 'vue';
    import { useAssignments } from './composables/useAssignments.js';
    import { useSimulation } from './composables/useSimulation.js';

    const config = JSON.parse(document.getElementById('app-config').textContent);

    createApp({
        delimiters: ['[[', ']]'],
        setup() {
            const { filtered, searchQuery, isLoading, load } = useAssignments(config.ltiSessionId);
            const { simulate, simulateUser } = useSimulation(config.ltiSessionId);

            onMounted(() => load(config.defaultSilo));

            return { filtered, searchQuery, isLoading, simulate, simulateUser };
        }
    }).mount('#app');
</script>
```

The inline script shrinks to wiring. Each composable is independently readable and testable. Applied to the internship app's 340-line inline script: `useAssignments`, `useSimulation`, `useFavorites`, and `useFilter` would each encapsulate a well-defined slice, and the remaining script becomes ~30 lines.

Note: composable files imported this way need to be reachable as static URLs or served via the Vite dev server — another reason to prefer the Vite pipeline over pure CDN for MPAs with meaningful complexity.

This approach is worth exploring on an existing MPA tool before committing to it for new tools. The internship index page is a good candidate: extract one composable (e.g. `useSimulation`), verify the pattern feels right, and go from there.

### Options API is still appropriate

Options API is not wrong. For a genuinely simple page — a toggle, a single AJAX call, a small form — it is readable and requires no setup. The flat structure is easy to scan when there is not much of it. There is no obligation to reach for Composition API when the logic fits comfortably in ~50 lines.

The problem is applying it as a blanket rule regardless of complexity. A 340-line Options API inline script with state split across `data`, `computed`, and `methods` is harder to maintain than the same logic organized into composables by concern.

### Summary

| Context | Recommended approach |
|---|---|
| Simple inline script, limited state | Options API — flat and readable, no overhead |
| Complex inline script, multiple concerns | Composition API with `setup()` + composables |
| `.vue` SFCs in Vite SPA | Composition API with `<script setup>` |

**Revise the project-wide rule**: prefer Composition API. Use Options API only where the simplicity is genuine — low complexity, few concerns, no reuse needed. The previous blanket "Options API only" rule actively works against maintainability as complexity grows, and it misses the point that composables are available outside of SFCs entirely.

### Note on CLAUDE.md

`CLAUDE.md` distinguishes between the two patterns: SPAs use Composition API with `<script setup>` everywhere; the legacy inline-Vue pattern (Internship, DemoLTI) uses Options API only. This document's summary table matches that distinction.

For new MPA tools, the guidance above (Composition API with `setup()` + composables where complexity warrants it) is the recommended direction.
