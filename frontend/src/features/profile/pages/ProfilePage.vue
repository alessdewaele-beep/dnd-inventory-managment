<script setup>
import { ref, computed, onMounted } from "vue";
import { authService } from "@/shared/services/domain/authService";
import { profileService } from "@/shared/services/domain/profileService";
import { useNavigation } from "@/shared/composables/useNavigation";
import { Roles } from "@/entities/user/Roles";
import AppNavbar from "@/shared/components/AppNavbar.vue";
import { useToast } from "primevue/usetoast";

const { goLogin, goHome } = useNavigation();
const toast = useToast();

const me = computed(() => profileService.state.me);
const isPlayer = computed(() => me.value?.role === Roles.PLAYER);

// --- Profile data (username + backstory) ---
const username = ref("");
const backstory = ref("");
const savingProfile = ref(false);

// --- Password ---
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const savingPassword = ref(false);

function syncForm() {
  username.value = me.value?.username ?? "";
  backstory.value = me.value?.backstory ?? "";
}

onMounted(async () => {
  if (!authService.isLoggedIn()) {
    authService.logout();
    goLogin();
    return;
  }
  await profileService.fetchMe(true);
  syncForm();
});

const saveProfile = async () => {
  if (!username.value.trim()) {
    toast.add({
      severity: "warn",
      summary: "Invalid",
      detail: "Username cannot be empty.",
      life: 3000,
    });
    return;
  }

  const payload = { username: username.value.trim() };
  if (isPlayer.value) payload.backstory = backstory.value;

  savingProfile.value = true;
  const ok = await profileService.updateProfile(payload);
  savingProfile.value = false;

  if (ok) {
    syncForm();
    toast.add({
      severity: "success",
      summary: "Saved",
      detail: "Your profile has been updated.",
      life: 3000,
    });
  } else {
    toast.add({
      severity: "error",
      summary: "Failed",
      detail: profileService.state.errorMessage || "Could not update profile",
      life: 4000,
    });
  }
};

const changePassword = async () => {
  if (!currentPassword.value || !newPassword.value) {
    toast.add({
      severity: "warn",
      summary: "Invalid",
      detail: "Please enter both your current and new password.",
      life: 3000,
    });
    return;
  }
  if (newPassword.value.length < 6) {
    toast.add({
      severity: "warn",
      summary: "Too short",
      detail: "The new password must be at least 6 characters.",
      life: 3000,
    });
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    toast.add({
      severity: "warn",
      summary: "Mismatch",
      detail: "The new passwords do not match.",
      life: 3000,
    });
    return;
  }

  savingPassword.value = true;
  const ok = await profileService.changePassword(
    currentPassword.value,
    newPassword.value
  );
  savingPassword.value = false;

  if (ok) {
    currentPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
    toast.add({
      severity: "success",
      summary: "Changed",
      detail: "Your password has been updated.",
      life: 3000,
    });
  } else {
    toast.add({
      severity: "error",
      summary: "Failed",
      detail:
        profileService.state.errorMessage || "Could not change password",
      life: 4000,
    });
  }
};

const logOut = () => {
  profileService.clear();
  authService.logout();
  goLogin();
};

const inputClass =
  "p-3 rounded-lg border focus:outline-none focus:ring-2 border-gold bg-white text-ink focus:ring-arcane dark:border-gold-deep dark:text-ink-light dark:bg-white/5 dark:focus:ring-gold";
const cardClass =
  "w-full p-6 sm:p-8 rounded-2xl shadow-xl bg-panel border-2 border-gold dark:bg-ink dark:border-gold-deep";
</script>

<template>
  <AppNavbar />

  <div class="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
    <!-- Back to the home screen -->
    <button
      type="button"
      @click="goHome"
      class="self-start flex items-center gap-2 text-sm font-medium text-forest dark:text-gold hover:underline cursor-pointer"
    >
      <i class="pi pi-arrow-left"></i> Back to home
    </button>

    <!-- Header -->
    <div class="flex items-center gap-4">
      <div
        class="h-14 w-14 rounded-full border-2 border-gold flex items-center justify-center bg-gold/15 shrink-0"
      >
        <i class="pi pi-user text-2xl text-gold"></i>
      </div>
      <div class="min-w-0">
        <h1
          class="font-serif text-2xl text-ink dark:text-ink-light truncate"
        >
          {{ me?.username || "Profile" }}
        </h1>
        <p class="text-sm text-ink/60 dark:text-ink-light/60">
          {{ me?.role }}
          <span v-if="me?.campaign_name">
            · Campaign: {{ me.campaign_name }}
          </span>
        </p>
      </div>
    </div>

    <!-- Profile data -->
    <section :class="cardClass">
      <h2
        class="font-serif text-xl mb-4 text-ink dark:text-ink-light flex items-center gap-2"
      >
        <i class="pi pi-id-card text-gold"></i> Profile data
      </h2>

      <form @submit.prevent="saveProfile" class="flex flex-col gap-4">
        <label class="flex flex-col gap-1">
          <span class="text-sm font-medium text-ink dark:text-ink-light">
            Username (unique)
          </span>
          <input v-model="username" :class="inputClass" placeholder="Username" />
        </label>

        <label v-if="isPlayer" class="flex flex-col gap-1">
          <span class="text-sm font-medium text-ink dark:text-ink-light">
            Backstory
          </span>
          <textarea
            v-model="backstory"
            rows="6"
            :class="inputClass"
            placeholder="Tell the story of your character..."
          ></textarea>
        </label>

        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="savingProfile"
            class="px-5 py-2.5 rounded-lg font-semibold shadow-md transition-colors duration-200 bg-arcane text-white hover:bg-ember dark:bg-forest dark:hover:bg-forest-light cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ savingProfile ? "Saving..." : "Save" }}
          </button>
        </div>
      </form>
    </section>

    <!-- Password -->
    <section :class="cardClass">
      <h2
        class="font-serif text-xl mb-4 text-ink dark:text-ink-light flex items-center gap-2"
      >
        <i class="pi pi-lock text-gold"></i> Change password
      </h2>

      <form @submit.prevent="changePassword" class="flex flex-col gap-4">
        <input
          type="password"
          v-model="currentPassword"
          :class="inputClass"
          placeholder="Current password"
          autocomplete="current-password"
        />
        <input
          type="password"
          v-model="newPassword"
          :class="inputClass"
          placeholder="New password (min. 6 characters)"
          autocomplete="new-password"
        />
        <input
          type="password"
          v-model="confirmPassword"
          :class="inputClass"
          placeholder="Confirm new password"
          autocomplete="new-password"
        />

        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="savingPassword"
            class="px-5 py-2.5 rounded-lg font-semibold shadow-md transition-colors duration-200 bg-arcane text-white hover:bg-ember dark:bg-forest dark:hover:bg-forest-light cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ savingPassword ? "Changing..." : "Change password" }}
          </button>
        </div>
      </form>
    </section>

    <!-- Log out -->
    <section :class="cardClass">
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h2 class="font-serif text-xl text-ink dark:text-ink-light">
            Session
          </h2>
          <p class="text-sm text-ink/60 dark:text-ink-light/60">
            Sign out on this device.
          </p>
        </div>
        <button
          type="button"
          @click="logOut"
          class="px-5 py-2.5 rounded-lg font-semibold shadow transition-colors duration-200 bg-blood text-white hover:opacity-90 cursor-pointer flex items-center justify-center gap-2"
        >
          <i class="pi pi-sign-out"></i> Log out
        </button>
      </div>
    </section>
  </div>
</template>
