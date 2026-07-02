<script setup>
import { onMounted, ref, watch } from "vue";
import { FilterMatchMode } from "@primevue/core/api";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { itemsService } from "@/shared/services/domain/itemsService";
import { usersService } from "@/shared/services/domain/usersService";
import ItemFormDialog from "@/features/inventory/components/ItemFormDialog.vue";

const confirm = useConfirm();
const toast = useToast();

const selectedUserId = ref(null);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const emptyItem = () => ({ name: "", description: "", type: "", quantity: null });
const dialogVisible = ref(false);
const selectedItem = ref(emptyItem());

function openDialog(item) {
  selectedItem.value = item ? { ...item } : emptyItem();
  dialogVisible.value = true;
}

async function saveItem() {
  const item = selectedItem.value;
  if (!item.id && (!item.name || !item.description || !item.type || !item.quantity)) {
    toast.add({ severity: "warn", summary: "Vul alle velden in", life: 3000 });
    return;
  }
  const ok = item.id
    ? await itemsService.updateItem(item, selectedUserId.value)
    : await itemsService.addItem(item, selectedUserId.value);
  if (ok) {
    toast.add({ severity: "success", summary: "Opgeslagen", life: 2500 });
    dialogVisible.value = false;
  } else {
    toast.add({ severity: "error", summary: "Fout", detail: itemsService.state.errorMessage, life: 4000 });
  }
}

function confirmDelete(event, item) {
  confirm.require({
    target: event.currentTarget,
    header: "Item verwijderen",
    message: `Weet je zeker dat je "${item.name}" wilt verwijderen?`,
    icon: "pi pi-exclamation-triangle",
    rejectProps: { label: "Annuleren", severity: "secondary" },
    acceptProps: { label: "Verwijderen", severity: "danger" },
    accept: async () => {
      await itemsService.deleteItem(item, selectedUserId.value);
      if (itemsService.state.errorMessage) {
        toast.add({ severity: "error", summary: "Fout", detail: itemsService.state.errorMessage, life: 4000 });
      } else {
        toast.add({ severity: "success", summary: "Verwijderd", life: 2500 });
      }
    },
  });
}

// Laadt de items zodra een speler gekozen is.
watch(selectedUserId, (id) => {
  if (id) itemsService.fetchItems(id);
  else itemsService.state.items = [];
});

onMounted(() => usersService.fetchAdminUsers());
</script>

<template>
  <div>
    <h2 class="font-serif text-2xl mb-1">Inventaris</h2>
    <p class="text-sm opacity-70 mb-4">Bekijk en bewerk de items van een speler.</p>

    <div class="flex flex-wrap items-center gap-3 mb-4">
      <label class="text-sm font-medium">Speler:</label>
      <p-select
        v-model="selectedUserId"
        :options="usersService.state.adminUsers"
        option-label="username"
        option-value="id"
        placeholder="Kies een speler"
        filter
        class="w-64"
      />
      <p-button
        v-if="selectedUserId"
        label="Item toevoegen"
        icon="pi pi-plus"
        @click="openDialog()"
      />
    </div>

    <p v-if="itemsService.state.errorMessage" class="text-blood mb-4">
      {{ itemsService.state.errorMessage }}
    </p>

    <p-datatable
      v-if="selectedUserId"
      :value="itemsService.state.items"
      :filters="filters"
      :global-filter-fields="['name', 'type', 'description']"
      paginator
      :rows="10"
      removable-sort
      data-key="id"
      class="my-datatable"
    >
      <template #header>
        <div class="flex justify-end">
          <p-iconField>
            <p-inputIcon class="pi pi-search" />
            <p-inputText v-model="filters.global.value" placeholder="Zoeken…" />
          </p-iconField>
        </div>
      </template>

      <template #empty>
        <div class="py-6 text-center opacity-60">Deze speler heeft nog geen items.</div>
      </template>

      <p-column field="name" header="Naam" sortable />
      <p-column field="type" header="Type" sortable />
      <p-column field="quantity" header="Aantal" sortable style="width: 6rem" />
      <p-column field="description" header="Beschrijving">
        <template #body="{ data }">
          <span class="opacity-80 line-clamp-2">{{ data.description }}</span>
        </template>
      </p-column>
      <p-column header="Favoriet" style="width: 6rem">
        <template #body="{ data }">
          <i :class="data.favourite ? 'pi pi-star-fill text-gold' : 'pi pi-star opacity-40'"></i>
        </template>
      </p-column>
      <p-column header="Acties" style="width: 9rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <p-button icon="pi pi-pencil" size="small" severity="secondary" title="Bewerken" @click="openDialog(data)" />
            <p-button icon="pi pi-trash" size="small" severity="danger" title="Verwijderen" @click="confirmDelete($event, data)" />
          </div>
        </template>
      </p-column>
    </p-datatable>

    <div v-else class="opacity-60 text-sm">Kies eerst een speler om diens inventaris te tonen.</div>

    <ItemFormDialog
      v-model:visible="dialogVisible"
      :item="selectedItem"
      @save="saveItem"
      @cancel="dialogVisible = false"
    />
  </div>
</template>
