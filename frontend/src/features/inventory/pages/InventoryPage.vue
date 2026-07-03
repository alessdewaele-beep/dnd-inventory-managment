<script setup>
import { onMounted, onUnmounted, ref, computed, watch } from "vue";
import { FilterMatchMode } from "@primevue/core/api";
import { authService } from "@/shared/services/domain/authService";
import { itemsService } from "@/shared/services/domain/itemsService";
import { usersService } from "@/shared/services/domain/usersService";
import { useNavigation } from "@/shared/composables/useNavigation";
import { useRightManager } from "@/shared/composables/useRightManager";
import AppNavbar from "@/shared/components/AppNavbar.vue";
import ItemsTable from "@/features/inventory/components/ItemsTable.vue";
import ItemFormDialog from "@/features/inventory/components/ItemFormDialog.vue";
import SendItemDialog from "@/features/inventory/components/SendItemDialog.vue";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

const { goLogin } = useNavigation();
const { hasRight } = useRightManager();
const confirm = useConfirm();
const toast = useToast();

const role = authService.getRole();
const isDM = role === "DM";
const isAdmin = role === "Admin";

const ownUserId = ref();
const userId = ref(); // eigenaar van de momenteel getoonde inventory
const selectedUser = ref("");

// De DM kiest uit zijn campaign-spelers; een admin uit alle gebruikers.
const viewableUsers = computed(() =>
  isAdmin ? usersService.state.users : usersService.state.campaignPlayers
);

// Kijkt de gebruiker naar de inventory van iemand anders? Dan read-only.
const isViewingOther = computed(() => userId.value !== ownUserId.value);

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

// Enkel de eigenaar zelf markeert een nieuw item als gezien; een DM of admin
// die meekijkt laat de notificatie van de speler intact.
const markSeen = (itemId) => {
  if (!isViewingOther.value) itemsService.markItemSeen(itemId);
};
const selectFilterWord = (filterWord) =>
  itemsService.selectFilterWord(filterWord);

// --- DM: item versturen naar spelers ---
const sendDialogVisible = ref(false);
const itemToSend = ref(null);

const openSend = (item) => {
  itemToSend.value = item;
  sendDialogVisible.value = true;
};

const confirmSend = async ({ recipientIds, quantity }) => {
  const ok = await itemsService.sendItem(itemToSend.value, recipientIds, quantity);
  if (ok) {
    sendDialogVisible.value = false;
    toast.add({
      severity: "success",
      summary: "Verzonden",
      detail: `"${itemToSend.value.name}" verstuurd naar ${recipientIds.length} speler(s).`,
      life: 3000,
    });
  } else {
    toast.add({
      severity: "error",
      summary: "Mislukt",
      detail: itemsService.state.errorMessage || "Kon item niet versturen",
      life: 4000,
    });
  }
};

onMounted(async () => {
  if (!authService.isLoggedIn()) {
    authService.logout();
    goLogin();
    return;
  }

  ownUserId.value = authService.getUserId();
  userId.value = ownUserId.value;

  if (isDM) {
    await usersService.fetchCampaignPlayers();
  } else if (isAdmin) {
    await usersService.fetchUsers();
  }

  await itemsService.fetchItems(userId.value);
  // Poll periodiek zodat items die een admin of DM intussen toevoegt (met hun
  // "Nieuw"-notificatie) verschijnen zonder handmatige refresh.
  itemsService.startPolling(userId.value);
});

onUnmounted(() => itemsService.stopPolling());

// Wisselt de getoonde inventory wanneer een andere speler wordt gekozen.
// Leeg (of gewist) betekent terug naar de eigen inventory.
watch(selectedUser, async (value) => {
  userId.value = value || ownUserId.value;
  itemsService.selectFilterWord(""); // reset categoriefilter bij wissel
  await itemsService.fetchItems(userId.value);
  itemsService.startPolling(userId.value);
});
</script>

<template>
  <AppNavbar />
  <div
    v-if="hasRight('DM')"
    class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 max-w-6xl mx-auto px-4 pt-4 text-ink dark:text-ink-light"
  >
    <label class="text-sm font-medium">
      Bekijk de inventory van een speler:
    </label>
    <p-select
      v-model="selectedUser"
      :options="viewableUsers"
      option-label="username"
      option-value="id"
      placeholder="Kies een speler"
      show-clear
      class="w-full sm:w-auto"
    ></p-select>
    <span v-if="isViewingOther" class="text-sm italic opacity-80">
      (alleen-lezen)
    </span>
  </div>

  <div class="max-w-6xl mx-auto px-4 pt-5 pb-10">
    <ItemsTable
      :items="itemsService.state.filteredItems"
      :filters="filters"
      :selected-filter="itemsService.state.selectedFilter"
      :readonly="isViewingOther"
      :can-send="isDM && !isViewingOther"
      @select-filter="selectFilterWord"
      @add-item="openDialog()"
      @toggle-favourite="toggleFavourite"
      @open-item="openDialog"
      @delete-item="deleteItem"
      @send-item="openSend"
      @seen-item="markSeen"
    />
  </div>

  <ItemFormDialog
    v-model:visible="dialogVisible"
    :item="selectedItem"
    @save="saveItem"
    @cancel="closeDialog"
  />

  <SendItemDialog
    v-model:visible="sendDialogVisible"
    :item="itemToSend"
    :players="usersService.state.campaignPlayers"
    @confirm="confirmSend"
  />
</template>
