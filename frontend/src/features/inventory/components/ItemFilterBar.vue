<script setup>
const props = defineProps({
  filters: { type: Object, required: true },
  selectedFilter: { type: String, required: true },
});

const emit = defineEmits(["select-filter", "add-item"]);

const filterButtons = [
  { label: "Misc", icon: "pi pi-box", value: "misc", bgColor: "#3a3a3a", color: "#f5f5f5" },
  { label: "Weapons", icon: "pi pi-bullseye", value: "weapon", bgColor: "#b22222", color: "#f5f5f5" },
  { label: "Armor", icon: "pi pi-shield", value: "armor", bgColor: "#2c2c2c", color: "#d4af37" },
  { label: "Potions", icon: "pi pi-heart-fill", value: "potion", bgColor: "#1e40af", color: "#f5f5f5" },
  { label: "Jewelry", icon: "pi pi-star", value: "jewelry", bgColor: "#d4af37", color: "#1b1b1b" },
];
</script>

<template>
  <div
    class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-ink text-gold dark:bg-black/40"
  >
    <!-- Zoekveld -->
    <div class="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5">
      <p-inputIcon>
        <i class="pi pi-search text-blood"></i>
      </p-inputIcon>
      <p-inputText
        v-model="props.filters['global'].value"
        placeholder="Keyword Search"
        class="!bg-transparent !border-none !text-ink-light !outline-none"
      />
    </div>

    <!-- Categorie-filters -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="btn in filterButtons"
        :key="btn.value"
        type="button"
        @click="emit('select-filter', btn.value)"
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

    <!-- Add knop -->
    <button
      type="button"
      @click="emit('add-item')"
      class="flex items-center gap-1.5 rounded-lg bg-blood px-4 py-1.5 text-sm font-semibold text-white shadow hover:brightness-110 transition cursor-pointer"
    >
      <i class="pi pi-plus"></i>
      Add Item
    </button>
  </div>
</template>
