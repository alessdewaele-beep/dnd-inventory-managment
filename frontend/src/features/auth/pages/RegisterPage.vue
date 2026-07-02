<script setup>
import { ref, onMounted } from "vue";
import { authService } from "@/shared/services/domain/authService";
import { campaignsService } from "@/shared/services/domain/campaignsService";
import { useNavigation } from "@/shared/composables/useNavigation";
import AppNavbar from "@/shared/components/AppNavbar.vue";

const username = ref("");
const password = ref("");
const passwordCheck = ref("");
const campaignId = ref("");
const errorMessage = ref("");

const { goLogin } = useNavigation();

onMounted(() => {
  campaignsService.fetchPublicCampaigns();
});

const registerUser = async () => {
  errorMessage.value = "";

  if (!username.value || !password.value) {
    errorMessage.value = "Username or password is empty";
    return;
  }

  if (!campaignId.value) {
    errorMessage.value = "Please select a campaign";
    return;
  }

  if (password.value !== passwordCheck.value) {
    errorMessage.value = "Passwords don't match.";
    return;
  }

  const success = await authService.register(
    username.value,
    password.value,
    Number(campaignId.value)
  );
  if (success) {
    goLogin();
  } else {
    errorMessage.value = authService.state.errorMessage;
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
        <i class="pi pi-user-plus text-2xl text-gold"></i>
      </div>
      <h2
        class="font-serif text-2xl text-center mb-1 text-ink dark:text-ink-light"
      >
        Register your character
      </h2>
      <p class="text-center text-sm mb-6 text-ink/60 dark:text-ink-light/60">
        Begin your adventure
      </p>

      <form @submit.prevent="registerUser" class="flex flex-col gap-4">
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

        <input
          type="password"
          v-model="passwordCheck"
          placeholder="Confirm password"
          class="p-3 rounded-lg border focus:outline-none focus:ring-2 border-gold bg-white text-ink focus:ring-arcane dark:border-gold-deep dark:text-ink-light dark:bg-white/5 dark:focus:ring-gold"
        />

        <select
          v-model="campaignId"
          class="p-3 rounded-lg border focus:outline-none focus:ring-2 border-gold bg-white text-ink focus:ring-arcane dark:border-gold-deep dark:text-ink-light dark:bg-white/5 dark:focus:ring-gold"
        >
          <option value="" disabled>Select a campaign</option>
          <option
            v-for="campaign in campaignsService.state.campaigns"
            :key="campaign.id"
            :value="campaign.id"
          >
            {{ campaign.name }}
          </option>
        </select>

        <p
          v-if="errorMessage"
          class="text-blood dark:text-red-400 font-medium text-sm"
        >
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          class="w-full py-3 rounded-lg font-semibold shadow-md transition-colors duration-200 bg-arcane text-white hover:bg-ember dark:bg-forest dark:hover:bg-forest-light cursor-pointer"
        >
          Register
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-ink dark:text-ink-light">
        Already have an account?
        <router-link
          to="/"
          class="font-semibold hover:underline text-forest dark:text-gold"
        >
          Log in here
        </router-link>
      </p>
    </div>
  </div>
</template>
