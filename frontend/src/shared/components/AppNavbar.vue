<script setup>
import { onMounted, computed } from "vue";
import { authService } from "@/shared/services/domain/authService";
import { profileService } from "@/shared/services/domain/profileService";
import { notificationsService } from "@/shared/services/domain/notificationsService";
import { useRightManager } from "@/shared/composables/useRightManager";
import { useNavigation } from "@/shared/composables/useNavigation";
import { useTheme } from "@/shared/composables/useTheme";

const { hasRight } = useRightManager();
const { goIfAllowed, goLogin, goTo } = useNavigation();
const { isDark, toggleTheme } = useTheme();

// Unread notification badge; capped at "9+" for layout.
const unreadBadge = computed(() => {
  const n = notificationsService.state.unreadCount;
  return n > 9 ? "9+" : String(n);
});

// Loads the profile (for the campaign context) and starts the notification
// badge polling as soon as someone is logged in.
onMounted(() => {
  if (authService.isLoggedIn()) {
    profileService.fetchMe();
    notificationsService.startPolling();
  }
});

const logOutAction = () => {
  profileService.clear();
  notificationsService.clear();
  authService.logout();
  goLogin();
};
</script>

<template>
  <nav
    class="h-[64px] flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 border-b-2 border-gold bg-parchment/95 backdrop-blur shadow-sm dark:bg-ink dark:border-gold-deep"
  >
    <!-- Logo & title -->
    <div class="flex items-center gap-2 sm:gap-3 min-w-0">
      <img
        src="../../../img/redDragon.png"
        alt="red dragon"
        class="h-9 sm:h-10 w-auto drop-shadow-md shrink-0"
      />
      <h1
        class="font-serif text-base sm:text-xl tracking-wide text-ink dark:text-ink-light truncate"
      >
        DnD Inventory Manager
      </h1>
    </div>

    <!-- Campaign context: only for players/DMs with an assigned campaign -->
    <div
      v-if="authService.isLoggedIn() && profileService.state.me?.campaign_name"
      class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold bg-gold/10 text-ink dark:text-ink-light shrink-0"
      title="Current campaign"
    >
      <i class="pi pi-map text-gold"></i>
      <span class="text-sm font-medium truncate max-w-[16rem]">
        {{ profileService.state.me.campaign_name }}
      </span>
    </div>

    <!-- Right: actions / user info / auth -->
    <div class="flex items-center gap-2 sm:gap-3 shrink-0">
      <p-button
        v-if="hasRight('Admin')"
        label="Admin"
        icon="pi pi-shield"
        size="small"
        @click="goIfAllowed('/admin', 'Admin')"
      />

      <button
        v-if="authService.isLoggedIn()"
        type="button"
        @click="goTo('/notifications')"
        title="Notifications"
        aria-label="Notifications"
        class="relative h-9 w-9 flex items-center justify-center rounded-full border border-gold text-ink hover:bg-gold/20 transition-colors cursor-pointer dark:text-gold dark:hover:bg-white/10"
      >
        <i class="pi pi-bell"></i>
        <span
          v-if="notificationsService.state.unreadCount > 0"
          class="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] px-1 flex items-center justify-center rounded-full bg-blood text-white text-[0.65rem] font-bold leading-none"
        >
          {{ unreadBadge }}
        </span>
      </button>

      <button
        type="button"
        @click="toggleTheme"
        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        class="h-9 w-9 flex items-center justify-center rounded-full border border-gold text-ink hover:bg-gold/20 transition-colors cursor-pointer dark:text-gold dark:hover:bg-white/10"
      >
        <i :class="isDark ? 'pi pi-sun' : 'pi pi-moon'"></i>
      </button>

      <button
        v-if="authService.isLoggedIn()"
        type="button"
        @click="goTo('/profile')"
        title="Go to my profile"
        class="flex items-center gap-2 text-forest dark:text-forest-light font-medium text-sm hover:underline cursor-pointer"
      >
        <i class="pi pi-user"></i>
        <span class="hidden sm:inline">
          {{ authService.getUsername() }} · {{ authService.getRole() }}
        </span>
      </button>

      <button
        v-if="authService.isLoggedIn()"
        @click="logOutAction()"
        class="px-4 py-2 rounded-lg bg-arcane text-white text-sm font-semibold shadow hover:bg-ember transition-colors duration-200 cursor-pointer dark:bg-forest dark:hover:bg-forest-light"
      >
        Logout
      </button>
    </div>
  </nav>
</template>
