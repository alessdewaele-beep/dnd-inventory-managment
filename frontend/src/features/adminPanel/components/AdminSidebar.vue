<script setup>
// Sidebar for the admin screen. Each link points to a sub-route of
// /admin; router-link-active handles the active highlight.
const links = [
  { to: "/admin", label: "Dashboard", icon: "pi pi-chart-bar", exact: true },
  { to: "/admin/users", label: "Users", icon: "pi pi-users" },
  { to: "/admin/campaigns", label: "Campaigns", icon: "pi pi-flag" },
  { to: "/admin/items", label: "Inventory", icon: "pi pi-box" },
];
</script>

<template>
  <aside
    class="w-full sm:w-56 shrink-0 border-b-2 sm:border-b-0 sm:border-r-2 border-gold dark:border-gold-deep bg-panel dark:bg-panel-dark"
  >
    <nav class="flex sm:flex-col gap-1 p-3">
      <router-link
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        :class="[
          'flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition-colors',
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
