<script setup>
import { onUnmounted } from "vue";
import ItemFilterBar from "@/features/inventory/components/ItemFilterBar.vue";
import { typeIcon } from "@/entities/item/itemIcon";

const props = defineProps({
  items: { type: Array, required: true },
  filters: { type: Object, required: true },
  selectedFilter: { type: String, required: true },
  // View mode (DM looks at a player's inventory): no adding, editing,
  // deleting or toggling favourites.
  readonly: { type: Boolean, default: false },
  // Shows the send action (only the DM in their own inventory).
  canSend: { type: Boolean, default: false },
  // Shows "move to shared inventory" (own personal item in a campaign).
  canShare: { type: Boolean, default: false },
  // Shows "take into my inventory" (item in the shared campaign inventory).
  canTake: { type: Boolean, default: false },
});

const emit = defineEmits([
  "select-filter",
  "add-item",
  "toggle-favourite",
  "open-item",
  "delete-item",
  "send-item",
  "share-item",
  "take-item",
  "seen-item",
]);

// New (not yet seen) items get a row marker. The item id is embedded in the
// class name so the hover handler knows which item was seen; the DataTable
// itself does not provide a row-hover event with rowdata.
const rowClass = (data) => (data.is_new ? `row-new row-new-id-${data.id}` : null);

// Delegated hover handler on the wrapper. The owner must hover over a new item
// for 3 uninterrupted seconds before the notification disappears; if the mouse
// leaves the row sooner, the timer aborts and the flag stays on.
const HOVER_DELAY_MS = 3000;
let hoverTimer = null;
let hoverId = null;

function clearHover() {
  if (hoverTimer) {
    clearTimeout(hoverTimer);
    hoverTimer = null;
  }
  hoverId = null;
}

const onMouseOver = (event) => {
  if (props.readonly) return;
  const row = event.target.closest("tr.row-new");
  // No new item under the mouse: abort any running timer.
  if (!row) {
    clearHover();
    return;
  }
  const match = row.className.match(/row-new-id-(\d+)/);
  if (!match) return;
  const id = Number(match[1]);
  // Same row: just let the running timer keep ticking.
  if (id === hoverId) return;
  // New row: restart the 3-second counter.
  clearHover();
  hoverId = id;
  hoverTimer = setTimeout(() => {
    emit("seen-item", id);
    clearHover();
  }, HOVER_DELAY_MS);
};

// Mouse leaves the table entirely: abort timer.
const onMouseLeave = () => clearHover();

onUnmounted(clearHover);
</script>

<template>
  <div
    class="rounded-xl overflow-hidden border-2 border-gold shadow-xl w-full"
    @mouseover="onMouseOver"
    @mouseleave="onMouseLeave"
  >
    <p-datatable
      v-model:filters="props.filters"
      :globalFilterFields="['name']"
      :value="props.items"
      :row-class="rowClass"
      class="my-datatable"
      paginator
      :rows="10"
      stripedRows
      scrollable
    >
      <template #empty>
        <p class="italic text-sm text-ink dark:text-ink-light py-6 text-center">
          No items found
        </p>
      </template>
      <template #header>
        <ItemFilterBar
          :filters="props.filters"
          :selected-filter="props.selectedFilter"
          :readonly="props.readonly"
          @select-filter="(value) => emit('select-filter', value)"
          @add-item="emit('add-item')"
        />
      </template>

      <p-column field="name" header="Name" headerClass="dt-col-left" style="width: 30%; min-width: 9rem">
        <template #body="slotProps">
          <div class="flex items-center gap-3">
            <div
              class="flex items-center justify-center rounded-md border border-gold/60 overflow-hidden bg-ink/5 dark:bg-white/5 shrink-0"
              style="width: 2.5rem; height: 2.5rem"
            >
              <img
                v-if="slotProps.data.image"
                :src="slotProps.data.image"
                :alt="slotProps.data.name"
                class="w-full h-full object-cover"
              />
              <span
                v-else
                class="leading-none"
                style="font-size: 1.25rem"
                :title="slotProps.data.type"
                >{{ typeIcon(slotProps.data.type) }}</span
              >
            </div>
            <span class="font-semibold">{{ slotProps.data.name }}</span>
            <span
              v-if="slotProps.data.is_new"
              class="new-badge"
              title="New item — disappears as soon as you hover over it"
              >New</span
            >
          </div>
        </template>
      </p-column>
      <p-column field="type" header="Type" headerClass="dt-col-left" style="width: 30%; min-width: 7rem">
        <template #body="slotProps">
          <span
            class="inline-block rounded-full px-3 py-1 text-xs font-medium capitalize bg-ink/10 dark:bg-white/10"
            >{{ slotProps.data.type }}</span
          >
        </template>
      </p-column>
      <p-column field="quantity" header="Qty." style="width: 10%; min-width: 4rem">
        <template #body="slotProps">
          <div class="text-center">{{ slotProps.data.quantity }}</div>
        </template>
      </p-column>
      <p-column field="favourite" header="Fav." style="width: 10%; min-width: 4rem">
        <template #body="slotProps">
          <div class="flex justify-center">
            <i
              :class="[
                'transition-transform',
                props.readonly ? '' : 'cursor-pointer hover:scale-125',
                slotProps.data.favourite ? 'pi pi-star-fill' : 'pi pi-star',
              ]"
              :style="{
                fontSize: '1.1rem',
                color: slotProps.data.favourite ? '#d9b44a' : '#9a9a9a',
              }"
              @click="!props.readonly && emit('toggle-favourite', slotProps.data)"
            ></i>
          </div>
        </template>
      </p-column>
      <p-column header="Info" style="width: 10%; min-width: 4rem">
        <template #body="slotProps">
          <div class="flex justify-center">
            <i
              @click="emit('open-item', slotProps.data)"
              class="pi pi-info-circle cursor-pointer transition-transform hover:scale-125"
              style="font-size: 1.1rem"
            ></i>
          </div>
        </template>
      </p-column>
      <p-column
        v-if="!props.readonly"
        header="Actions"
        style="width: 12%; min-width: 5rem"
      >
        <template #body="slotProps">
          <div class="flex justify-center gap-4">
            <i
              v-if="props.canSend"
              class="pi pi-send cursor-pointer transition-transform hover:scale-125"
              style="font-size: 1.1rem; color: #d9b44a"
              title="Send to players"
              @click="emit('send-item', slotProps.data)"
            ></i>
            <i
              v-if="props.canShare"
              class="pi pi-users cursor-pointer transition-transform hover:scale-125"
              style="font-size: 1.1rem; color: #d9b44a"
              title="Move to shared inventory"
              @click="emit('share-item', slotProps.data)"
            ></i>
            <i
              v-if="props.canTake"
              class="pi pi-download cursor-pointer transition-transform hover:scale-125"
              style="font-size: 1.1rem; color: #d9b44a"
              title="Take into my inventory"
              @click="emit('take-item', slotProps.data)"
            ></i>
            <i
              class="pi pi-trash cursor-pointer transition-transform hover:scale-125"
              style="font-size: 1.1rem; color: #b22222"
              title="Delete"
              @click="(event) => emit('delete-item', slotProps.data, event)"
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

  /* Neutralize PrimeVue's own row-hover theme token, so rows never change
     color on hover. */
  --p-datatable-row-hover-background: transparent;
  --p-datatable-row-hover-color: inherit;

  /* Likewise for sortable column headers: no (white) hover background. */
  --p-datatable-header-cell-hover-background: transparent;
  --p-datatable-header-cell-hover-color: var(--dt-header-fg);
  --p-datatable-header-cell-selected-background: transparent;

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
  letter-spacing: 0.03em;
  text-align: center;
  padding: 0.9rem 1rem;
}

.my-datatable .p-datatable-thead > tr > th .p-datatable-column-header-content {
  justify-content: center;
}

/* Sortable headers must not get lighter (white) on hover/focus/active:
   they keep the same dark header background as the rest. */
.my-datatable .p-datatable-thead > tr > th.p-datatable-sortable-column:hover,
.my-datatable .p-datatable-thead > tr > th.p-datatable-sortable-column:focus,
.my-datatable
  .p-datatable-thead
  > tr
  > th.p-datatable-sortable-column.p-datatable-column-sorted {
  background-color: var(--dt-header-bg);
  color: var(--dt-header-fg);
}

/* Columns with text content (Name, Type) align left, just like their cells */
.my-datatable .p-datatable-thead > tr > th.dt-col-left {
  text-align: left;
}

.my-datatable
  .p-datatable-thead
  > tr
  > th.dt-col-left
  .p-datatable-column-header-content {
  justify-content: flex-start;
}

.my-datatable .p-datatable-tbody > tr {
  transition: background-color 0.15s ease;
}

.my-datatable .p-datatable-tbody > tr > td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.dark .my-datatable .p-datatable-tbody > tr > td {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.my-datatable .p-datatable-tbody > tr:nth-child(odd) {
  background-color: var(--dt-row-odd);
  color: var(--dt-fg);
}

.my-datatable .p-datatable-tbody > tr:nth-child(even) {
  background-color: var(--dt-row-even);
  color: var(--dt-fg);
}

/* No color change on hover: rows keep their own background. */
.my-datatable .p-datatable-tbody > tr:nth-child(odd):hover {
  background-color: var(--dt-row-odd);
}

.my-datatable .p-datatable-tbody > tr:nth-child(even):hover {
  background-color: var(--dt-row-even);
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

/* New (not yet seen) item: golden glow over the whole row. Placed AFTER the
   odd/even and hover rules so this tint wins as long as the flag is on; once
   the owner hovers, `is_new` drops away and the tint and badge disappear. */
.my-datatable .p-datatable-tbody > tr.row-new,
.my-datatable .p-datatable-tbody > tr.row-new:hover {
  background-color: rgba(217, 180, 74, 0.22);
  box-shadow: inset 3px 0 0 #d9b44a;
}

.new-badge {
  display: inline-block;
  margin-left: 0.5rem;
  padding: 0.1rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background-color: #d9b44a;
  color: #2e2a26;
}
</style>
