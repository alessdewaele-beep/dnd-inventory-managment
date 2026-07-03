<script setup>
import { reactive, ref, computed, watch } from "vue";

const props = defineProps({
  // De opgeslagen beurs: { pp, gp, sp, cp }.
  currency: { type: Object, required: true },
});

const emit = defineEmits(["save"]);

// De vier munttypes met hun label en kleur. Decimale koers:
// 1 pp = 10 gp, 1 gp = 10 sp, 1 sp = 10 cp.
const coins = [
  { key: "pp", label: "Platinum", color: "#cfd3d6" },
  { key: "gp", label: "Goud", color: "#d9b44a" },
  { key: "sp", label: "Zilver", color: "#a8adb5" },
  { key: "cp", label: "Koper", color: "#b87333" },
];

const open = ref(false);

// Lokale, bewerkbare kopie zodat typen pas bij 'Opslaan' verstuurd wordt.
const form = reactive({ pp: 0, gp: 0, sp: 0, cp: 0 });

const seed = (c) => {
  form.pp = c.pp ?? 0;
  form.gp = c.gp ?? 0;
  form.sp = c.sp ?? 0;
  form.cp = c.cp ?? 0;
};

// Herseed wanneer een andere (of net opgeslagen) beurs binnenkomt.
watch(() => props.currency, seed, { immediate: true, deep: true });

// Totale waarde uitgedrukt in goud, live meeberekend met de ingetypte waarden.
const totalGp = computed(
  () =>
    (form.pp || 0) * 10 +
    (form.gp || 0) +
    (form.sp || 0) / 10 +
    (form.cp || 0) / 100
);

// Compacte samenvatting in de dichtgeklapte balk: enkel de niet-lege munten.
const summary = computed(() => {
  const parts = coins
    .filter((c) => (props.currency[c.key] ?? 0) > 0)
    .map((c) => `${props.currency[c.key]} ${c.key}`);
  return parts.length ? parts.join(" · ") : "leeg";
});

const isDirty = computed(() =>
  coins.some((c) => (form[c.key] || 0) !== (props.currency[c.key] ?? 0))
);

const save = () =>
  emit("save", { pp: form.pp, gp: form.gp, sp: form.sp, cp: form.cp });
</script>

<template>
  <div
    class="rounded-lg border border-gold/40 bg-parchment/50 dark:bg-ink/40 w-full mb-4 text-ink dark:text-ink-light"
  >
    <!-- Dichtgeklapte balk: subtiel, met samenvatting + totaal -->
    <button
      type="button"
      class="w-full flex items-center justify-between gap-3 px-4 py-2 text-left cursor-pointer"
      @click="open = !open"
    >
      <span class="flex items-center gap-2 text-sm font-medium opacity-90">
        <i class="pi pi-wallet opacity-60"></i> Beurs
      </span>
      <span class="flex items-center gap-3 text-sm">
        <span class="opacity-60 hidden sm:inline">{{ summary }}</span>
        <span class="font-semibold text-gold-deep dark:text-gold">
          {{ totalGp.toFixed(2) }} gp
        </span>
        <i
          class="pi text-xs opacity-60 transition-transform"
          :class="open ? 'pi-chevron-up' : 'pi-chevron-down'"
        ></i>
      </span>
    </button>

    <!-- Uitgeklapt: bewerkbare muntvelden -->
    <div v-if="open" class="px-4 pb-4 pt-2 border-t border-gold/20">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div v-for="coin in coins" :key="coin.key" class="flex flex-col gap-1">
          <label class="text-xs font-medium flex items-center gap-1.5 opacity-80">
            <span
              class="inline-block rounded-full border border-black/20"
              :style="{ width: '0.75rem', height: '0.75rem', backgroundColor: coin.color }"
            ></span>
            {{ coin.label }} ({{ coin.key }})
          </label>
          <p-inputnumber
            v-model="form[coin.key]"
            :min="0"
            :max-fraction-digits="0"
            :use-grouping="false"
            class="w-full"
            inputClass="w-full"
          />
        </div>
      </div>

      <div class="flex justify-end mt-3">
        <p-button
          label="Opslaan"
          icon="pi pi-check"
          class="dt-primary-btn"
          size="small"
          :disabled="!isDirty"
          @click="save"
        />
      </div>
    </div>
  </div>
</template>
