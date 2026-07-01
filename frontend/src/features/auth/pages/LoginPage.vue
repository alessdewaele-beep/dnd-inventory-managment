<script setup>
import { ref } from "vue";
import { authService } from "@/shared/services/domain/authService";
import { useNavigation } from "@/shared/composables/useNavigation";
import AppNavbar from "@/shared/components/AppNavbar.vue";

const username = ref("");
const password = ref("");

const { goHome } = useNavigation();

const logInUser = async () => {
  const success = await authService.login(username.value, password.value);
  if (success) {
    goHome();
  }
};
</script>

<template>
  <AppNavbar />
  <div class="flex justify-center items-center px-4 py-16">
    <div
      class="w-full max-w-md p-8 rounded-2xl shadow-xl bg-panel border-2 border-gold dark:bg-ink dark:border-gold-deep"
    >
      <div class="flex justify-center mb-3">
        <i class="pi pi-shield text-2xl text-gold"></i>
      </div>
      <h2
        class="font-serif text-2xl text-center mb-1 text-ink dark:text-ink-light"
      >
        Welcome back, Adventurer
      </h2>
      <p class="text-center text-sm mb-6 text-ink/60 dark:text-ink-light/60">
        Sign in to check your inventory
      </p>

      <form @submit.prevent="logInUser" class="flex flex-col gap-4">
        <input
          v-model="username"
          placeholder="Username"
          class="p-3 rounded-lg border focus:outline-none focus:ring-2 border-gold bg-white text-ink focus:ring-arcane dark:border-gold-deep dark:text-ink-light dark:bg-white/5 dark:focus:ring-gold"
        />

        <input
          type="password"
          v-model="password"
          placeholder="Password"
          class="p-3 rounded-lg border focus:outline-none focus:ring-2 border-gold bg-white text-ink focus:ring-arcane dark:border-gold-deep dark:text-ink-light dark:bg-white/5 dark:focus:ring-gold"
        />

        <p
          v-if="authService.state.errorMessage"
          class="text-blood dark:text-red-400 font-medium text-sm"
        >
          {{ authService.state.errorMessage }}
        </p>

        <button
          type="submit"
          class="w-full py-3 rounded-lg font-semibold shadow-md transition-colors duration-200 bg-arcane text-white hover:bg-ember dark:bg-forest dark:hover:bg-forest-light cursor-pointer"
        >
          Log in
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-ink dark:text-ink-light">
        No account?
        <router-link
          to="/register"
          class="font-semibold hover:underline text-forest dark:text-gold"
        >
          Register here!
        </router-link>
      </p>
    </div>
  </div>
</template>
