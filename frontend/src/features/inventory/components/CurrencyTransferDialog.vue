<script setup>
import { reactive, ref, computed, watch } from "vue";

const props = defineProps({
  visible: { type: Boolean, default: false },
  // Both purses: { pp, gp, sp, cp }.
  personal: { type: Object, required: true },
  shared: { type: Object, required: true },
});

const emit = defineEmits(["update:visible", "confirm"]);

const coins = [
  { key: "pp", label: "Platinum", color: "#cfd3d6" },
  { key: "gp", label: "Gold", color: "#d9b44a" },
  { key: "sp", label: "Silver", color: "#a8adb5" },
  { key: "cp", label: "Copper", color: "#b87333" },
];

const directions = [
  { label: "My purse  →  Party purse", value: "toShared" },
  { label: "Party purse  →  My purse", value: "toPersonal" },
];

const direction = ref("toShared");
const form = reactive({ pp: 0, gp: 0, sp: 0, cp: 0 });

// The purse the coins are taken from, so we can cap each field.
const source = computed(() =>
  direction.value === "toShared" ? props.personal : props.shared
);

const reset = () => {
  form.pp = 0;
  form.gp = 0;
  form.sp = 0;
  form.cp = 0;
  direction.value = "toShared";
};

// Fresh, empty form every time the dialog opens.
watch(
  () => props.visible,
  (open) => {
    if (open) reset();
  }
);

const hasAmount = computed(() => coins.some((c) => (form[c.key] || 0) > 0));

// Does any field exceed what the source purse holds?
const exceeds = computed(() =>
  coins.some((c) => (form[c.key] || 0) > (source.value[c.key] ?? 0))
);

const canConfirm = computed(() => hasAmount.value && !exceeds.value);

const close = () => emit("update:visible", false);

const confirm = () => {
  if (!canConfirm.value) return;
  emit("confirm", {
    direction: direction.value,
    coins: { pp: form.pp, gp: form.gp, sp: form.sp, cp: form.cp },
  });
};
</script>

<template>
  <p-dialog
    :visible="props.visible"
    @update:visible="(v) => emit('update:visible', v)"
    modal
    header="Transfer coins"
    :style="{ width: '28rem' }"
    :breakpoints="{ '640px': '92vw' }"
  >
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <label class="text-xs font-medium opacity-80">Direction</label>
        <p-select
          v-model="direction"
          :options="directions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
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
            :max="source[coin.key] ?? 0"
            :max-fraction-digits="0"
            :use-grouping="false"
            class="w-full"
            inputClass="w-full"
          />
          <span class="text-[0.7rem] opacity-60">
            available: {{ source[coin.key] ?? 0 }}
          </span>
        </div>
      </div>

      <p v-if="exceeds" class="text-xs text-blood">
        Not enough coins in the source purse.
      </p>
    </div>

    <template #footer>
      <p-button
        label="Cancel"
        severity="secondary"
        size="small"
        @click="close"
      />
      <p-button
        label="Transfer"
        icon="pi pi-arrow-right-arrow-left"
        class="dt-primary-btn"
        size="small"
        :disabled="!canConfirm"
        @click="confirm"
      />
    </template>
  </p-dialog>
</template>
