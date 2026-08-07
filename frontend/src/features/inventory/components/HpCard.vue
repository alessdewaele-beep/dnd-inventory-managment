<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  // The stored HP state: { enabled, maxHp, currentHp, tempHp }.
  hp: { type: Object, required: true },
  // A DM/admin looking at another player's HP only watches.
  readonly: { type: Boolean, default: false },
});

const emit = defineEmits(["damage", "heal", "set-temp"]);

// Local copy of the temp HP field so typing is only sent when it changes.
const tempHp = ref(props.hp.tempHp ?? 0);
watch(
  () => props.hp.tempHp,
  (value) => (tempHp.value = value ?? 0)
);

const saveTemp = () => {
  const value = Math.max(0, tempHp.value ?? 0);
  if (value !== (props.hp.tempHp ?? 0)) emit("set-temp", value);
};

const percentage = computed(() =>
  props.hp.maxHp > 0
    ? Math.min(100, (props.hp.currentHp / props.hp.maxHp) * 100)
    : 0
);

// Bar color shifts with how hurt the character is.
const barColor = computed(() => {
  if (percentage.value > 50) return "#3f7d3f"; // healthy green
  if (percentage.value > 25) return "#d9b44a"; // wounded gold
  return "#8c2f2f"; // critical red
});

const canDamage = computed(
  () => props.hp.currentHp > 0 || props.hp.tempHp > 0
);
const canHeal = computed(() => props.hp.currentHp < props.hp.maxHp);
</script>

<template>
  <div
    class="rounded-lg border border-gold/40 bg-parchment/50 dark:bg-ink/40 w-full mb-4 text-ink dark:text-ink-light"
  >
    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5">
      <span class="flex items-center gap-2 text-sm font-medium opacity-90">
        <i class="pi pi-heart-fill text-blood"></i> Hit points
      </span>

      <!-- HP bar + numbers -->
      <div class="flex items-center gap-3 flex-1 min-w-[10rem]">
        <div
          class="relative flex-1 h-3 rounded-full overflow-hidden bg-black/10 dark:bg-white/10"
          role="progressbar"
          :aria-valuenow="hp.currentHp"
          :aria-valuemin="0"
          :aria-valuemax="hp.maxHp"
        >
          <div
            class="h-full rounded-full transition-all duration-200"
            :style="{ width: percentage + '%', backgroundColor: barColor }"
          ></div>
        </div>
        <span class="text-sm font-semibold whitespace-nowrap">
          {{ hp.currentHp }} / {{ hp.maxHp }}
          <span
            v-if="hp.tempHp > 0"
            class="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold text-white bg-arcane dark:bg-forest"
            title="Temporary hit points (absorb damage first)"
          >
            +{{ hp.tempHp }}
          </span>
        </span>
      </div>

      <!-- Quick +1 / -1 arrows -->
      <div v-if="!readonly" class="flex items-center gap-1.5">
        <button
          type="button"
          @click="emit('damage')"
          :disabled="!canDamage"
          title="Take 1 damage (temp HP absorbs it first)"
          aria-label="Decrease HP by 1"
          class="h-8 w-8 flex items-center justify-center rounded-full border border-blood/60 text-blood hover:bg-blood/15 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <i class="pi pi-arrow-down text-sm"></i>
        </button>
        <button
          type="button"
          @click="emit('heal')"
          :disabled="!canHeal"
          title="Heal 1 HP"
          aria-label="Increase HP by 1"
          class="h-8 w-8 flex items-center justify-center rounded-full border border-forest/60 text-forest hover:bg-forest/15 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed dark:text-forest-light"
        >
          <i class="pi pi-arrow-up text-sm"></i>
        </button>

        <!-- Temp HP: directly editable buffer -->
        <label class="flex items-center gap-1.5 ml-2 text-xs font-medium opacity-80">
          Temp
          <p-inputnumber
            v-model="tempHp"
            :min="0"
            :max="9999"
            :max-fraction-digits="0"
            :use-grouping="false"
            inputClass="w-14 text-center !py-1"
            @blur="saveTemp"
            @keydown.enter.prevent="saveTemp"
          />
        </label>
      </div>
    </div>
  </div>
</template>
