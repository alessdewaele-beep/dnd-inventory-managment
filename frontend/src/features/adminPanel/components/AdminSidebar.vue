<script setup>
import { ref } from "vue";

// Sidebar for the admin screen. Each link points to a sub-route of
// /admin; router-link-active handles the active highlight. On mobile the
// links collapse behind a hamburger toggle.
const links = [
  { to: "/admin", label: "Dashboard", icon: "pi pi-chart-bar", exact: true },
  { to: "/admin/users", label: "Users", icon: "pi pi-users" },
  { to: "/admin/campaigns", label: "Campaigns", icon: "pi pi-flag" },
  { to: "/admin/items", label: "Inventory", icon: "pi pi-box" },
];

const open = ref(false);
</script>

<template>
  <aside
    class="w-full sm:w-56 shrink-0 border-b-2 sm:border-b-0 sm:border-r-2 border-gold dark:border-gold-deep bg-panel dark:bg-panel-dark"
  >
    <!-- Mobile header with hamburger toggle -->
    <div class="sm:hidden flex items-center justify-between px-3 py-2">
      <span
        class="font-serif text-sm font-semibold flex items-center gap-2 text-ink dark:text-ink-light"
      >
        <i class="pi pi-shield text-gold"></i> Admin menu
      </span>
      <button
        type="button"
        @click="open = !open"
        :aria-label="open ? 'Close admin menu' : 'Open admin menu'"
        :aria-expanded="open"
        class="h-9 w-9 flex items-center justify-center rounded-lg border border-gold text-ink hover:bg-gold/20 transition-colors cursor-pointer dark:text-gold dark:hover:bg-white/10"
      >
        <i :class="open ? 'pi pi-times' : 'pi pi-bars'"></i>
      </button>
    </div>

    <!-- Links: dropdown on mobile (when open), vertical list on desktop -->
    <nav
      :class="[
        open ? 'flex' : 'hidden',
        'sm:flex flex-col gap-1 px-3 pb-3 sm:pt-3',
      ]"
    >
      <router-link
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        @click="open = false"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 sm:py-2 rounded-lg font-medium text-sm transition-colors',
          'text-ink dark:text-ink-light hover:bg-gold/20 dark:hover:bg-white/10',
        ]"
        :exact-active-class="link.exact ? 'bg-gold/30 dark:bg-gold-deep/30 text-ink dark:text-gold' : ''"
        :active-class="!link.exact ? 'bg-gold/30 dark:bg-gold-deep/30 text-ink dark:text-gold' : ''"
      >
        <i :class="link.icon"></i>
        <span>{{ link.label }}</span>
      </router-link>
    </nav>
  </aside>
</template>
