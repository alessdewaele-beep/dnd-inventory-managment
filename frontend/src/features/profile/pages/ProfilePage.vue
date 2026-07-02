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
const isPlayer = computed(() => me.value?.role === Roles.SPELER);

// --- Profielgegevens (username + backstory) ---
const username = ref("");
const backstory = ref("");
const savingProfile = ref(false);

// --- Wachtwoord ---
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
      summary: "Ongeldig",
      detail: "Username mag niet leeg zijn.",
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
      summary: "Opgeslagen",
      detail: "Je profiel is bijgewerkt.",
      life: 3000,
    });
  } else {
    toast.add({
      severity: "error",
      summary: "Mislukt",
      detail: profileService.state.errorMessage || "Kon profiel niet bijwerken",
      life: 4000,
    });
  }
};

const changePassword = async () => {
  if (!currentPassword.value || !newPassword.value) {
    toast.add({
      severity: "warn",
      summary: "Ongeldig",
      detail: "Vul zowel je huidige als je nieuwe wachtwoord in.",
      life: 3000,
    });
    return;
  }
  if (newPassword.value.length < 6) {
    toast.add({
      severity: "warn",
      summary: "Te kort",
      detail: "Het nieuwe wachtwoord moet minstens 6 tekens zijn.",
      life: 3000,
    });
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    toast.add({
      severity: "warn",
      summary: "Komt niet overeen",
      detail: "De nieuwe wachtwoorden komen niet overeen.",
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
      summary: "Gewijzigd",
      detail: "Je wachtwoord is aangepast.",
      life: 3000,
    });
  } else {
    toast.add({
      severity: "error",
      summary: "Mislukt",
      detail:
        profileService.state.errorMessage || "Kon wachtwoord niet wijzigen",
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
    <!-- Terug naar het homescherm -->
    <button
      type="button"
      @click="goHome"
      class="self-start flex items-center gap-2 text-sm font-medium text-forest dark:text-gold hover:underline cursor-pointer"
    >
      <i class="pi pi-arrow-left"></i> Terug naar home
    </button>

    <!-- Kop -->
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
          {{ me?.username || "Profiel" }}
        </h1>
        <p class="text-sm text-ink/60 dark:text-ink-light/60">
          {{ me?.role }}
          <span v-if="me?.campaign_name">
            · Campagne: {{ me.campaign_name }}
          </span>
        </p>
      </div>
    </div>

    <!-- Profielgegevens -->
    <section :class="cardClass">
      <h2
        class="font-serif text-xl mb-4 text-ink dark:text-ink-light flex items-center gap-2"
      >
        <i class="pi pi-id-card text-gold"></i> Profielgegevens
      </h2>

      <form @submit.prevent="saveProfile" class="flex flex-col gap-4">
        <label class="flex flex-col gap-1">
          <span class="text-sm font-medium text-ink dark:text-ink-light">
            Username (uniek)
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
            placeholder="Vertel het verhaal van je personage..."
          ></textarea>
        </label>

        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="savingProfile"
            class="px-5 py-2.5 rounded-lg font-semibold shadow-md transition-colors duration-200 bg-arcane text-white hover:bg-ember dark:bg-forest dark:hover:bg-forest-light cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ savingProfile ? "Opslaan..." : "Opslaan" }}
          </button>
        </div>
      </form>
    </section>

    <!-- Wachtwoord -->
    <section :class="cardClass">
      <h2
        class="font-serif text-xl mb-4 text-ink dark:text-ink-light flex items-center gap-2"
      >
        <i class="pi pi-lock text-gold"></i> Wachtwoord wijzigen
      </h2>

      <form @submit.prevent="changePassword" class="flex flex-col gap-4">
        <input
          type="password"
          v-model="currentPassword"
          :class="inputClass"
          placeholder="Huidig wachtwoord"
          autocomplete="current-password"
        />
        <input
          type="password"
          v-model="newPassword"
          :class="inputClass"
          placeholder="Nieuw wachtwoord (min. 6 tekens)"
          autocomplete="new-password"
        />
        <input
          type="password"
          v-model="confirmPassword"
          :class="inputClass"
          placeholder="Bevestig nieuw wachtwoord"
          autocomplete="new-password"
        />

        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="savingPassword"
            class="px-5 py-2.5 rounded-lg font-semibold shadow-md transition-colors duration-200 bg-arcane text-white hover:bg-ember dark:bg-forest dark:hover:bg-forest-light cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ savingPassword ? "Wijzigen..." : "Wachtwoord wijzigen" }}
          </button>
        </div>
      </form>
    </section>

    <!-- Uitloggen -->
    <section :class="cardClass">
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h2 class="font-serif text-xl text-ink dark:text-ink-light">
            Sessie
          </h2>
          <p class="text-sm text-ink/60 dark:text-ink-light/60">
            Meld je af op dit apparaat.
          </p>
        </div>
        <button
          type="button"
          @click="logOut"
          class="px-5 py-2.5 rounded-lg font-semibold shadow transition-colors duration-200 bg-blood text-white hover:opacity-90 cursor-pointer flex items-center justify-center gap-2"
        >
          <i class="pi pi-sign-out"></i> Uitloggen
        </button>
      </div>
    </section>
  </div>
</template>
