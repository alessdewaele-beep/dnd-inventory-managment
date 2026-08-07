<script setup>
import { reactive, ref, onMounted } from "vue";
import { authService } from "@/shared/services/domain/authService";
import { hpService } from "@/shared/services/domain/hpService";
import { useNavigation } from "@/shared/composables/useNavigation";
import { useTheme } from "@/shared/composables/useTheme";
import AppNavbar from "@/shared/components/AppNavbar.vue";
import { useToast } from "primevue/usetoast";

const { goLogin, goHome } = useNavigation();
const { isDark } = useTheme();
const toast = useToast();

const userId = ref(null);
const saving = ref(false);

// Local, editable copy so typing is only sent on 'Save'.
const form = reactive({ enabled: false, maxHp: 10, currentHp: 10, tempHp: 0 });

function syncForm() {
  const hp = hpService.state.hp;
  form.enabled = hp.enabled;
  form.maxHp = hp.maxHp;
  form.currentHp = hp.currentHp;
  form.tempHp = hp.tempHp;
}

onMounted(async () => {
  if (!authService.isLoggedIn()) {
    authService.logout();
    goLogin();
    return;
  }
  userId.value = authService.getUserId();
  await hpService.fetchHp(userId.value);
  syncForm();
});

const saveHp = async () => {
  if (!form.maxHp || form.maxHp < 1) {
    toast.add({
      severity: "warn",
      summary: "Invalid",
      detail: "Max HP must be at least 1.",
      life: 3000,
    });
    return;
  }

  saving.value = true;
  const ok = await hpService.saveHp(userId.value, {
    enabled: form.enabled,
    maxHp: form.maxHp,
    currentHp: Math.min(form.currentHp ?? 0, form.maxHp),
    tempHp: form.tempHp ?? 0,
  });
  saving.value = false;

  if (ok) {
    syncForm();
    toast.add({
      severity: "success",
      summary: "Saved",
      detail: "Your HP settings have been updated.",
      life: 3000,
    });
  } else {
    toast.add({
      severity: "error",
      summary: "Failed",
      detail: hpService.state.errorMessage || "Could not save HP settings",
      life: 4000,
    });
  }
};

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
        <i class="pi pi-cog text-2xl text-gold"></i>
      </div>
      <div class="min-w-0">
        <h1 class="font-serif text-2xl text-ink dark:text-ink-light truncate">
          Settings
        </h1>
        <p class="text-sm text-ink/60 dark:text-ink-light/60">
          Personal preferences
        </p>
      </div>
    </div>

    <!-- Appearance -->
    <section :class="cardClass">
      <h2
        class="font-serif text-xl mb-4 text-ink dark:text-ink-light flex items-center gap-2"
      >
        <i class="pi pi-palette text-gold"></i> Appearance
      </h2>

      <label class="flex items-center justify-between gap-4 cursor-pointer">
        <span class="flex flex-col">
          <span class="text-sm font-medium text-ink dark:text-ink-light">
            Dark mode
          </span>
          <span class="text-xs text-ink/60 dark:text-ink-light/60">
            Applies immediately and is remembered on this device.
          </span>
        </span>
        <p-toggleswitch v-model="isDark" />
      </label>
    </section>

    <!-- Hit points -->
    <section :class="cardClass">
      <h2
        class="font-serif text-xl mb-4 text-ink dark:text-ink-light flex items-center gap-2"
      >
        <i class="pi pi-heart-fill text-blood"></i> Hit points
      </h2>

      <form @submit.prevent="saveHp" class="flex flex-col gap-5">
        <label class="flex items-center justify-between gap-4 cursor-pointer">
          <span class="flex flex-col">
            <span class="text-sm font-medium text-ink dark:text-ink-light">
              Track hit points
            </span>
            <span class="text-xs text-ink/60 dark:text-ink-light/60">
              Shows an HP tracker on your inventory page.
            </span>
          </span>
          <p-toggleswitch v-model="form.enabled" />
        </label>

        <div v-if="form.enabled" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label class="flex flex-col gap-1">
            <span class="text-sm font-medium text-ink dark:text-ink-light">
              Max HP
            </span>
            <p-inputnumber
              v-model="form.maxHp"
              :min="1"
              :max="9999"
              :max-fraction-digits="0"
              :use-grouping="false"
              class="w-full"
              inputClass="w-full"
            />
          </label>

          <label class="flex flex-col gap-1">
            <span class="text-sm font-medium text-ink dark:text-ink-light">
              Current HP
            </span>
            <p-inputnumber
              v-model="form.currentHp"
              :min="0"
              :max="form.maxHp || 9999"
              :max-fraction-digits="0"
              :use-grouping="false"
              class="w-full"
              inputClass="w-full"
            />
          </label>

          <label class="flex flex-col gap-1">
            <span class="text-sm font-medium text-ink dark:text-ink-light">
              Temp HP
            </span>
            <p-inputnumber
              v-model="form.tempHp"
              :min="0"
              :max="9999"
              :max-fraction-digits="0"
              :use-grouping="false"
              class="w-full"
              inputClass="w-full"
            />
            <span class="text-xs text-ink/60 dark:text-ink-light/60">
              Absorbs damage before your real HP.
            </span>
          </label>
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="saving"
            class="px-5 py-2.5 rounded-lg font-semibold shadow-md transition-colors duration-200 bg-arcane text-white hover:bg-ember dark:bg-forest dark:hover:bg-forest-light cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ saving ? "Saving..." : "Save" }}
          </button>
        </div>
      </form>
    </section>
  </div>
</template>
