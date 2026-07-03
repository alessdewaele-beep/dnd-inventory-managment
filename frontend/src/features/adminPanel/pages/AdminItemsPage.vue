<script setup>
import { onMounted, ref, watch } from "vue";
import { FilterMatchMode } from "@primevue/core/api";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { itemsService } from "@/shared/services/domain/itemsService";
import { usersService } from "@/shared/services/domain/usersService";
import ItemsTable from "@/features/inventory/components/ItemsTable.vue";
import ItemFormDialog from "@/features/inventory/components/ItemFormDialog.vue";

const confirm = useConfirm();
const toast = useToast();

const selectedUserId = ref(null);

// Same filter setup as the inventory: global search by name.
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
});

const emptyItem = () => ({ name: "", description: "", type: "", quantity: null, image: null });
const dialogVisible = ref(false);
const selectedItem = ref(emptyItem());

function openDialog(item) {
  selectedItem.value = item ? { ...item } : emptyItem();
  dialogVisible.value = true;
}

async function saveItem() {
  const item = selectedItem.value;
  if (!item.id && (!item.name || !item.description || !item.type || !item.quantity)) {
    toast.add({ severity: "warn", summary: "Fill in all fields", life: 3000 });
    return;
  }
  const ok = item.id
    ? await itemsService.updateItem(item, selectedUserId.value)
    : await itemsService.addItem(item, selectedUserId.value);
  if (ok) {
    toast.add({ severity: "success", summary: "Saved", life: 2500 });
    dialogVisible.value = false;
  } else {
    toast.add({ severity: "error", summary: "Error", detail: itemsService.state.errorMessage, life: 4000 });
  }
}

// Argument order follows the emit from ItemsTable: (item, event).
function deleteItem(item, event) {
  confirm.require({
    target: event.currentTarget,
    message: `Are you sure you want to delete "${item.name}"?`,
    rejectProps: { label: "Cancel", severity: "secondary", size: "small" },
    acceptProps: { label: "Delete", severity: "danger", size: "small" },
    accept: async () => {
      await itemsService.deleteItem(item, selectedUserId.value);
      if (itemsService.state.errorMessage) {
        toast.add({ severity: "error", summary: "Error", detail: itemsService.state.errorMessage, life: 4000 });
      } else {
        toast.add({ severity: "success", summary: "Deleted", life: 2500 });
      }
    },
  });
}

const toggleFavourite = (item) => itemsService.toggleFavourite(item);
const selectFilterWord = (word) => itemsService.selectFilterWord(word);

// Loads the items once a player is selected; otherwise clears the (shared) state.
watch(selectedUserId, (id) => {
  itemsService.state.selectedFilter = "";
  if (id) {
    itemsService.fetchItems(id);
  } else {
    itemsService.state.items = [];
    itemsService.state.filteredItems = [];
  }
});

onMounted(() => usersService.fetchAdminUsers());
</script>

<template>
  <div>
    <h2 class="font-serif text-2xl mb-1">Inventory</h2>
    <p class="text-sm opacity-70 mb-4">View and edit a player's items.</p>

    <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
      <label class="text-sm font-medium">Player:</label>
      <p-select
        v-model="selectedUserId"
        :options="usersService.state.adminUsers"
        option-label="username"
        option-value="id"
        placeholder="Choose a player"
        filter
        class="w-full sm:w-64"
      />
    </div>

    <p v-if="itemsService.state.errorMessage" class="text-blood mb-4">
      {{ itemsService.state.errorMessage }}
    </p>

    <ItemsTable
      v-if="selectedUserId"
      :items="itemsService.state.filteredItems"
      :filters="filters"
      :selected-filter="itemsService.state.selectedFilter"
      @select-filter="selectFilterWord"
      @add-item="openDialog()"
      @toggle-favourite="toggleFavourite"
      @open-item="openDialog"
      @delete-item="deleteItem"
    />

    <div v-else class="opacity-60 text-sm">Choose a player first to show their inventory.</div>

    <ItemFormDialog
      v-model:visible="dialogVisible"
      :item="selectedItem"
      @save="saveItem"
      @cancel="dialogVisible = false"
    />
  </div>
</template>
