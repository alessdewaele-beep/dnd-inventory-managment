<script setup>
import { onMounted, computed } from "vue";
import { authService } from "@/shared/services/domain/authService";
import { notificationsService } from "@/shared/services/domain/notificationsService";
import { useNavigation } from "@/shared/composables/useNavigation";
import AppNavbar from "@/shared/components/AppNavbar.vue";

const { goLogin, goHome } = useNavigation();

const items = computed(() => notificationsService.state.items);
const hasUnread = computed(() => notificationsService.state.unreadCount > 0);

// Relative-ish timestamp; falls back to the locale date string.
const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
};

onMounted(async () => {
  if (!authService.isLoggedIn()) {
    authService.logout();
    goLogin();
    return;
  }
  await notificationsService.fetchNotifications();
});

const onClickItem = (n) => {
  if (n.isUnread()) notificationsService.markRead(n.id);
};
</script>

<template>
  <AppNavbar />
  <div class="max-w-3xl mx-auto px-4 pt-6 pb-12 text-ink dark:text-ink-light">
    <button
      type="button"
      @click="goHome"
      class="flex items-center gap-1.5 text-sm font-medium text-gold hover:underline cursor-pointer mb-3"
    >
      <i class="pi pi-arrow-left"></i>
      Back to inventory
    </button>

    <div class="flex items-center justify-between gap-3 mb-4">
      <h2 class="font-serif text-2xl flex items-center gap-2">
        <i class="pi pi-bell text-gold"></i> Notifications
      </h2>
      <p-button
        label="Mark all as read"
        icon="pi pi-check"
        size="small"
        outlined
        :disabled="!hasUnread"
        @click="notificationsService.markAllRead()"
      />
    </div>

    <p
      v-if="notificationsService.state.errorMessage"
      class="text-sm text-blood mb-3"
    >
      {{ notificationsService.state.errorMessage }}
    </p>

    <div
      v-if="!notificationsService.state.loading && items.length === 0"
      class="rounded-xl border border-gold/40 bg-parchment/50 dark:bg-ink/40 px-4 py-10 text-center italic opacity-70"
    >
      You have no notifications.
    </div>

    <ul v-else class="flex flex-col gap-2">
      <li
        v-for="n in items"
        :key="n.id"
        @click="onClickItem(n)"
        :class="[
          'flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors cursor-pointer',
          n.isUnread()
            ? 'border-gold bg-gold/10 hover:bg-gold/15'
            : 'border-gold/20 bg-parchment/40 dark:bg-ink/30 hover:bg-gold/5',
        ]"
      >
        <i :class="[n.icon, 'text-gold mt-0.5 shrink-0']" style="font-size: 1.1rem"></i>
        <div class="min-w-0 flex-1">
          <p class="text-sm" :class="n.isUnread() ? 'font-semibold' : ''">
            {{ n.message }}
          </p>
          <p class="text-xs opacity-60 mt-0.5">{{ formatDate(n.created_at) }}</p>
        </div>
        <span
          v-if="n.isUnread()"
          class="mt-1 h-2 w-2 rounded-full bg-gold shrink-0"
          title="Unread"
        ></span>
      </li>
    </ul>
  </div>
</template>
