<script setup>
import { onMounted, ref } from "vue";
import { FilterMatchMode } from "@primevue/core/api";
import { authService } from "@/shared/services/domain/authService";
import { itemsService } from "@/shared/services/domain/itemsService";
import { usersService } from "@/shared/services/domain/usersService";
import { useNavigation } from "@/shared/composables/useNavigation";
import { useRightManager } from "@/shared/composables/useRightManager";
import AppNavbar from "@/shared/components/AppNavbar.vue";
import ItemsTable from "@/features/inventory/components/ItemsTable.vue";
import ItemFormDialog from "@/features/inventory/components/ItemFormDialog.vue";
import { useConfirm } from "primevue/useconfirm";

const { goLogin } = useNavigation();
const { hasRight } = useRightManager();
const confirm = useConfirm();

const userId = ref();
const selectedUser = ref("");

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
});

const emptyItem = () => ({
  name: "",
  description: "",
  type: "",
  quantity: null,
});

const dialogVisible = ref(false);
const selectedItem = ref(emptyItem());

const openDialog = (item) => {
  selectedItem.value = item ? { ...item } : emptyItem();
  dialogVisible.value = true;
};

const closeDialog = () => {
  dialogVisible.value = false;
  selectedItem.value = emptyItem();
};

const saveItem = async () => {
  const item = selectedItem.value;
  if (
    !item.id &&
    (!item.name || !item.description || !item.type || !item.quantity)
  ) {
    alert("Please fill in all fields");
    return;
  }

  if (item.id) {
    await itemsService.updateItem(item, userId.value);
  } else {
    await itemsService.addItem(item, userId.value);
  }
  closeDialog();
};

const deleteItem = (item, event) => {
  confirm.require({
    target: event.currentTarget,
    message: `Delete "${item.name}"?`,
    rejectProps: { label: "Cancel", severity: "secondary", size: "small" },
    acceptProps: { label: "Delete", icon: "pi pi-trash", size: "small", class: "dt-primary-btn" },
    accept: () => itemsService.deleteItem(item, userId.value),
  });
};
const toggleFavourite = (item) => itemsService.toggleFavourite(item);
const selectFilterWord = (filterWord) =>
  itemsService.selectFilterWord(filterWord);

onMounted(async () => {
  if (!authService.isLoggedIn()) {
    authService.logout();
    goLogin();
    return;
  }

  userId.value = authService.getUserId();

  if (hasRight("DM")) {
    await usersService.fetchUsers();
  }

  await itemsService.fetchItems(userId.value);
});
</script>

<template>
  <AppNavbar />
  <div
    v-if="hasRight('DM')"
    class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 max-w-6xl mx-auto px-4 pt-4 text-ink dark:text-ink-light"
  >
    <label class="text-sm font-medium">Select user to look at their inventory:</label>
    <p-select
      v-model="selectedUser"
      :options="usersService.state.users"
      option-label="username"
      option-value="id"
      placeholder="Select a user"
      class="w-full sm:w-auto"
    ></p-select>
  </div>

  <div class="max-w-6xl mx-auto px-4 pt-5 pb-10">
    <ItemsTable
      :items="itemsService.state.filteredItems"
      :filters="filters"
      :selected-filter="itemsService.state.selectedFilter"
      @select-filter="selectFilterWord"
      @add-item="openDialog()"
      @toggle-favourite="toggleFavourite"
      @open-item="openDialog"
      @delete-item="deleteItem"
    />
  </div>

  <ItemFormDialog
    v-model:visible="dialogVisible"
    :item="selectedItem"
    @save="saveItem"
    @cancel="closeDialog"
  />
</template>
