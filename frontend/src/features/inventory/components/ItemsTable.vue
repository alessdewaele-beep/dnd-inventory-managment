<script setup>
import ItemFilterBar from "@/features/inventory/components/ItemFilterBar.vue";

const props = defineProps({
  items: { type: Array, required: true },
  filters: { type: Object, required: true },
  selectedFilter: { type: String, required: true },
});

const emit = defineEmits([
  "select-filter",
  "add-item",
  "toggle-favourite",
  "open-item",
  "delete-item",
]);
</script>

<template>
  <div class="rounded-xl overflow-hidden border-2 border-gold shadow-lg">
    <p-datatable
      v-model:filters="props.filters"
      :globalFilterFields="['name']"
      :value="props.items"
      class="my-datatable"
      paginator
      :rows="10"
    >
      <template #empty>
        <p class="italic text-sm text-ink dark:text-ink-light">
          Geen items gevonden
        </p>
      </template>
      <template #header>
        <ItemFilterBar
          :filters="props.filters"
          :selected-filter="props.selectedFilter"
          @select-filter="(value) => emit('select-filter', value)"
          @add-item="emit('add-item')"
        />
      </template>

      <p-column field="name" header="Name" style="width: 20%"> </p-column>
      <p-column field="type" header="Type" style="width: 30%"> </p-column>
      <p-column field="quantity" header="Qty." style="width: 5%"> </p-column>
      <p-column field="favourite" style="width: 5%">
        <template #body="slotProps">
          <div class="text-center">
            <i
              :class="[
                'cursor-pointer transition-transform hover:scale-125',
                slotProps.data.favourite ? 'pi pi-star-fill' : 'pi pi-star',
              ]"
              :style="{
                fontSize: '1rem',
                color: slotProps.data.favourite ? '#d9b44a' : '#9a9a9a',
              }"
              @click="emit('toggle-favourite', slotProps.data)"
            ></i>
          </div>
        </template>
      </p-column>
      <p-column header="Info" style="width: 5%">
        <template #body="slotProps">
          <div class="text-center">
            <i
              @click="emit('open-item', slotProps.data)"
              class="pi pi-info-circle cursor-pointer transition-transform hover:scale-125"
              style="font-size: 1rem"
            ></i>
          </div>
        </template>
      </p-column>
      <p-column style="width: 5%">
        <template #body="slotProps">
          <div class="text-center">
            <i
              class="pi pi-trash cursor-pointer transition-transform hover:scale-125"
              style="font-size: 1rem; color: #b22222"
              @click="emit('delete-item', slotProps.data)"
            ></i>
          </div>
        </template>
      </p-column>
    </p-datatable>
  </div>
</template>

<style>
/* Fantasy-themed skin over PrimeVue's DataTable, driven by CSS custom
   properties so light (parchment) vs dark (tavern) both stay in sync
   with the app-wide .dark toggle. */
.my-datatable {
  --dt-bg: #f5f1e6;
  --dt-fg: #2e2a26;
  --dt-header-bg: #2e2a26;
  --dt-header-fg: #d9b44a;
  --dt-row-odd: #fbf8ee;
  --dt-row-even: #f5f1e6;
  --dt-paginator-bg: #ede6d6;

  background-color: var(--dt-bg);
  color: var(--dt-fg);
}

.dark .my-datatable {
  --dt-bg: #2e2a26;
  --dt-fg: #f5f5f5;
  --dt-header-bg: #1b1b1b;
  --dt-header-fg: #d4af37;
  --dt-row-odd: #3a3a3a;
  --dt-row-even: #2e2a26;
  --dt-paginator-bg: #1b1b1b;
}

.my-datatable .p-datatable-thead > tr > th {
  background-color: var(--dt-header-bg);
  color: var(--dt-header-fg);
  font-family: var(--font-serif);
  font-weight: 600;
  text-align: center;
}

.my-datatable .p-datatable-tbody > tr:nth-child(odd) {
  background-color: var(--dt-row-odd);
  color: var(--dt-fg);
}

.my-datatable .p-datatable-tbody > tr:nth-child(even) {
  background-color: var(--dt-row-even);
  color: var(--dt-fg);
}

.my-datatable .p-datatable-header {
  padding: 0;
}

.my-datatable .p-paginator {
  background-color: var(--dt-paginator-bg);
  border-top: 1px solid #d9b44a;
  color: #d9b44a;
}

.my-datatable .p-paginator .p-paginator-page,
.my-datatable .p-paginator .p-paginator-prev,
.my-datatable .p-paginator .p-paginator-next {
  color: inherit;
  border-radius: 0.25rem;
}

.my-datatable .p-paginator .p-paginator-page.p-highlight {
  background-color: #b22222;
  color: #f5f5f5;
}
</style>
