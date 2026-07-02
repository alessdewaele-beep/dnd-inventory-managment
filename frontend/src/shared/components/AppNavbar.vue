<script setup>
import { authService } from "@/shared/services/domain/authService";
import { useRightManager } from "@/shared/composables/useRightManager";
import { useNavigation } from "@/shared/composables/useNavigation";
import { useTheme } from "@/shared/composables/useTheme";

const { hasRight } = useRightManager();
const { goIfAllowed, goLogin } = useNavigation();
const { isDark, toggleTheme } = useTheme();

const logOutAction = () => {
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

      <span
        v-if="authService.isLoggedIn()"
        class="hidden sm:inline text-forest dark:text-forest-light font-medium text-sm"
      >
        {{ authService.getUsername() }} · {{ authService.getRole() }}
      </span>

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
