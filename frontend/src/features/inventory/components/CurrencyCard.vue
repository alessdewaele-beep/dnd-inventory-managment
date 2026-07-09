<script setup>
import { reactive, ref, computed, watch } from "vue";

const props = defineProps({
  // The stored purse: { pp, gp, sp, cp }.
  currency: { type: Object, required: true },
  // Shows a "Transfer coins" action inside the expanded card (party purse).
  canTransfer: { type: Boolean, default: false },
});

const emit = defineEmits(["save", "transfer"]);

// The four coin types with their label and color. Decimal rate:
// 1 pp = 10 gp, 1 gp = 10 sp, 1 sp = 10 cp.
const coins = [
  { key: "pp", label: "Platinum", color: "#cfd3d6" },
  { key: "gp", label: "Gold", color: "#d9b44a" },
  { key: "sp", label: "Silver", color: "#a8adb5" },
  { key: "cp", label: "Copper", color: "#b87333" },
];

const open = ref(false);

// Local, editable copy so typing is only sent on 'Save'.
const form = reactive({ pp: 0, gp: 0, sp: 0, cp: 0 });

const seed = (c) => {
  form.pp = c.pp ?? 0;
  form.gp = c.gp ?? 0;
  form.sp = c.sp ?? 0;
  form.cp = c.cp ?? 0;
};

// Reseed when a different (or just-saved) purse comes in.
watch(() => props.currency, seed, { immediate: true, deep: true });

// Total value expressed in gold, computed live from the typed-in values.
const totalGp = computed(
  () =>
    (form.pp || 0) * 10 +
    (form.gp || 0) +
    (form.sp || 0) / 10 +
    (form.cp || 0) / 100
);

// Compact summary in the collapsed bar: only the non-empty coins.
const summary = computed(() => {
  const parts = coins
    .filter((c) => (props.currency[c.key] ?? 0) > 0)
    .map((c) => `${props.currency[c.key]} ${c.key}`);
  return parts.length ? parts.join(" · ") : "empty";
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
    <!-- Collapsed bar: subtle, with summary + total -->
    <button
      type="button"
      class="w-full flex items-center justify-between gap-3 px-4 py-2 text-left cursor-pointer"
      @click="open = !open"
    >
      <span class="flex items-center gap-2 text-sm font-medium opacity-90">
        <i class="pi pi-wallet opacity-60"></i> Currency
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

    <!-- Expanded: editable coin fields -->
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

      <div class="flex justify-end mt-3 gap-2">
        <p-button
          v-if="props.canTransfer"
          label="Transfer coins"
          icon="pi pi-arrow-right-arrow-left"
          size="small"
          outlined
          @click="emit('transfer')"
        />
        <p-button
          label="Save"
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
