<script setup>
import { onMounted } from "vue";
import { authService } from "@/shared/services/domain/authService";
import { useNavigation } from "@/shared/composables/useNavigation";
import { useRightManager } from "@/shared/composables/useRightManager";
import AppNavbar from "@/shared/components/AppNavbar.vue";
import AdminSidebar from "@/features/adminPanel/components/AdminSidebar.vue";

const { goLogin, goHome } = useNavigation();
const { hasRight } = useRightManager();

onMounted(() => {
  // Extra safety net alongside the router guard: only logged-in admins here.
  if (!authService.isLoggedIn()) {
    authService.logout();
    goLogin();
    return;
  }
  if (!hasRight("Admin")) {
    goHome();
  }
});
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppNavbar />
    <div class="flex flex-col sm:flex-row flex-1">
      <AdminSidebar />
      <main class="flex-1 min-w-0 px-4 sm:px-6 py-6 text-ink dark:text-ink-light">
        <router-view />
      </main>
    </div>

    <p-toast position="top-right" />
  </div>
</template>
