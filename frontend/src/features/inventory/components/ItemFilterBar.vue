<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  filters: { type: Object, required: true },
  selectedFilter: { type: String, required: true },
  // View mode: hide the "Add" button (DM views a player inventory).
  readonly: { type: Boolean, default: false },
});

const emit = defineEmits(["select-filter", "add-item"]);

const filterButtons = [
  { label: "Misc", icon: "pi pi-box", value: "misc", bgColor: "#3a3a3a", color: "#f5f5f5" },
  { label: "Weapons", icon: "pi pi-bullseye", value: "weapon", bgColor: "#b22222", color: "#f5f5f5" },
  { label: "Armor", icon: "pi pi-shield", value: "armor", bgColor: "#2c2c2c", color: "#d4af37" },
  { label: "Potions", icon: "pi pi-heart-fill", value: "potion", bgColor: "#1e40af", color: "#f5f5f5" },
  { label: "Jewelry", icon: "pi pi-star", value: "jewelry", bgColor: "#d4af37", color: "#1b1b1b" },
];

// Collapse state of the category filters on mobile. From sm they are always visible.
const filtersOpen = ref(false);

// Shows the selected category on the toggle button, so that with collapsed
// filters you can still see which one is active.
const activeLabel = computed(
  () => filterButtons.find((b) => b.value === props.selectedFilter)?.label ?? "Filters"
);

function pick(value) {
  emit("select-filter", value);
  filtersOpen.value = false; // close the list after a choice on mobile
}
</script>

<template>
  <div class="flex flex-col gap-3 px-4 py-3 bg-ink text-gold dark:bg-black/40">
    <!-- Top row: search + actions (always visible) -->
    <div class="flex flex-wrap items-center gap-2">
      <!-- Search field -->
      <div class="flex flex-1 min-w-[10rem] items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5">
        <i class="pi pi-search text-blood shrink-0"></i>
        <p-inputText
          v-model="props.filters['global'].value"
          placeholder="Keyword Search"
          class="!bg-transparent !border-none !text-ink-light !outline-none w-full"
        />
      </div>

      <!-- Filters toggle: only on mobile -->
      <button
        type="button"
        @click="filtersOpen = !filtersOpen"
        class="sm:hidden flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium cursor-pointer"
      >
        <i class="pi pi-filter"></i>
        <span>{{ activeLabel }}</span>
        <i :class="filtersOpen ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" class="text-xs"></i>
      </button>

      <!-- Add button -->
      <button
        v-if="!props.readonly"
        type="button"
        @click="emit('add-item')"
        class="flex items-center gap-1.5 rounded-lg bg-blood px-4 py-1.5 text-sm font-semibold text-white shadow hover:brightness-110 transition cursor-pointer whitespace-nowrap"
      >
        <i class="pi pi-plus"></i>
        Add
      </button>
    </div>

    <!-- Category filters: collapsible on mobile, always visible from sm -->
    <div
      :class="[
        filtersOpen ? 'flex' : 'hidden',
        'sm:flex flex-wrap gap-2',
      ]"
    >
      <button
        v-for="btn in filterButtons"
        :key="btn.value"
        type="button"
        @click="pick(btn.value)"
        :style="{ backgroundColor: btn.bgColor, color: btn.color }"
        :class="[
          'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-transform hover:scale-105 cursor-pointer',
          btn.value === props.selectedFilter
            ? 'ring-2 ring-gold ring-offset-1 ring-offset-ink'
            : '',
        ]"
      >
        <i :class="btn.icon"></i>
        {{ btn.label }}
      </button>
    </div>
  </div>
</template>
