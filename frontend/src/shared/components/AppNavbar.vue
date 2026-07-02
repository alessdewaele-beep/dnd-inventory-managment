<script setup>
import { onMounted } from "vue";
import { authService } from "@/shared/services/domain/authService";
import { profileService } from "@/shared/services/domain/profileService";
import { useRightManager } from "@/shared/composables/useRightManager";
import { useNavigation } from "@/shared/composables/useNavigation";
import { useTheme } from "@/shared/composables/useTheme";

const { hasRight } = useRightManager();
const { goIfAllowed, goLogin, goTo } = useNavigation();
const { isDark, toggleTheme } = useTheme();

// Laadt het profiel (voor de campagne-context) zodra iemand ingelogd is.
onMounted(() => {
  if (authService.isLoggedIn()) {
    profileService.fetchMe();
  }
});

const logOutAction = () => {
  profileService.clear();
  authService.logout();
  goLogin();
};
</script>

<template>
  <nav
    class="h-[64px] flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 border-b-2 border-gold bg-parchment/95 backdrop-blur shadow-sm dark:bg-ink dark:border-gold-deep"
  >
    <!-- Logo & titel -->
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

    <!-- Campagne-context: enkel voor spelers/DM's met een gekoppelde campagne -->
    <div
      v-if="authService.isLoggedIn() && profileService.state.me?.campaign_name"
      class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold bg-gold/10 text-ink dark:text-ink-light shrink-0"
      title="Huidige campagne"
    >
      <i class="pi pi-map text-gold"></i>
      <span class="text-sm font-medium truncate max-w-[16rem]">
        {{ profileService.state.me.campaign_name }}
      </span>
    </div>

    <!-- Rechts: acties / user info / auth -->
    <div class="flex items-center gap-2 sm:gap-3 shrink-0">
      <p-button
        v-if="hasRight('Admin')"
        label="Admin"
        icon="pi pi-shield"
        size="small"
        @click="goIfAllowed('/admin', 'Admin')"
      />

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
        title="Naar mijn profiel"
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
