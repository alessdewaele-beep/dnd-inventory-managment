<script setup>
import { onMounted, computed } from "vue";
import { adminService } from "@/shared/services/domain/adminService";

onMounted(() => adminService.fetchStats());

const stats = computed(() => adminService.state.stats);

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("nl-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Rol -> aantal, als overzichtelijke string voor onder de gebruikerskaart.
const roleBreakdown = computed(() => {
  const byRole = stats.value?.users?.byRole ?? [];
  return byRole.map((r) => `${r.count} ${r.role}`).join(" · ");
});
</script>

<template>
  <div>
    <h2 class="font-serif text-2xl mb-1">Dashboard</h2>
    <p class="text-sm opacity-70 mb-6">Overzicht van de applicatie.</p>

    <p v-if="adminService.state.errorMessage" class="text-blood mb-4">
      {{ adminService.state.errorMessage }}
    </p>

    <div v-if="stats" class="flex flex-col gap-6">
      <!-- Kerncijfers -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="rounded-xl border border-gold/50 bg-panel dark:bg-panel-dark p-5 shadow-sm">
          <div class="flex items-center gap-3">
            <i class="pi pi-users text-2xl text-gold-deep dark:text-gold"></i>
            <div>
              <div class="text-3xl font-bold">{{ stats.users.total }}</div>
              <div class="text-sm opacity-70">Gebruikers</div>
            </div>
          </div>
          <div v-if="roleBreakdown" class="mt-3 text-xs opacity-70">{{ roleBreakdown }}</div>
        </div>

        <div class="rounded-xl border border-gold/50 bg-panel dark:bg-panel-dark p-5 shadow-sm">
          <div class="flex items-center gap-3">
            <i class="pi pi-flag text-2xl text-gold-deep dark:text-gold"></i>
            <div>
              <div class="text-3xl font-bold">{{ stats.campaigns.total }}</div>
              <div class="text-sm opacity-70">Campagnes</div>
            </div>
          </div>
          <div class="mt-3 text-xs opacity-70">
            {{ stats.campaigns.withDm }} met een DM toegewezen
          </div>
        </div>

        <div class="rounded-xl border border-gold/50 bg-panel dark:bg-panel-dark p-5 shadow-sm">
          <div class="flex items-center gap-3">
            <i class="pi pi-box text-2xl text-gold-deep dark:text-gold"></i>
            <div>
              <div class="text-3xl font-bold">{{ stats.items.total }}</div>
              <div class="text-sm opacity-70">Items</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recente activiteit -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="rounded-xl border border-gold/50 bg-panel dark:bg-panel-dark p-5 shadow-sm">
          <h3 class="font-serif text-lg mb-3">Nieuwste gebruikers</h3>
          <ul class="divide-y divide-gold/20">
            <li
              v-for="u in stats.recentUsers"
              :key="u.id"
              class="flex items-center justify-between py-2 text-sm"
            >
              <span class="flex items-center gap-2">
                <i class="pi pi-user opacity-60"></i>{{ u.username }}
                <p-tag :value="u.role" severity="secondary" />
              </span>
              <span class="opacity-60">{{ formatDate(u.created_at) }}</span>
            </li>
            <li v-if="!stats.recentUsers.length" class="py-2 text-sm opacity-60">
              Geen gebruikers.
            </li>
          </ul>
        </div>

        <div class="rounded-xl border border-gold/50 bg-panel dark:bg-panel-dark p-5 shadow-sm">
          <h3 class="font-serif text-lg mb-3">Nieuwste items</h3>
          <ul class="divide-y divide-gold/20">
            <li
              v-for="it in stats.recentItems"
              :key="it.id"
              class="flex items-center justify-between py-2 text-sm"
            >
              <span class="flex items-center gap-2">
                <i class="pi pi-box opacity-60"></i>{{ it.name }}
                <span class="opacity-60">· {{ it.owner || "onbekend" }}</span>
              </span>
              <span class="opacity-60">{{ formatDate(it.created_at) }}</span>
            </li>
            <li v-if="!stats.recentItems.length" class="py-2 text-sm opacity-60">
              Geen items.
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else-if="adminService.state.loading" class="opacity-70">Laden…</div>
  </div>
</template>
