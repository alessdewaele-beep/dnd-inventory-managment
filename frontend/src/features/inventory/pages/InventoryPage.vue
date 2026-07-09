<script setup>
import { onMounted, onUnmounted, ref, computed, watch } from "vue";
import { FilterMatchMode } from "@primevue/core/api";
import { authService } from "@/shared/services/domain/authService";
import { itemsService } from "@/shared/services/domain/itemsService";
import { sharedInventoryService } from "@/shared/services/domain/sharedInventoryService";
import { currencyService } from "@/shared/services/domain/currencyService";
import { usersService } from "@/shared/services/domain/usersService";
import { useNavigation } from "@/shared/composables/useNavigation";
import { useRightManager } from "@/shared/composables/useRightManager";
import AppNavbar from "@/shared/components/AppNavbar.vue";
import ItemsTable from "@/features/inventory/components/ItemsTable.vue";
import ItemFormDialog from "@/features/inventory/components/ItemFormDialog.vue";
import SendItemDialog from "@/features/inventory/components/SendItemDialog.vue";
import CurrencyCard from "@/features/inventory/components/CurrencyCard.vue";
import CurrencyTransferDialog from "@/features/inventory/components/CurrencyTransferDialog.vue";
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
const userId = ref(); // owner of the currently displayed inventory
const selectedUser = ref("");

// Which inventory is on screen: the personal one ("mine") or the campaign's
// shared one ("campaign"). The campaign tab only exists when the user has a
// campaign context (resolved server-side by the shared inventory service).
const activeTab = ref("mine");
const hasCampaign = computed(
  () => sharedInventoryService.state.campaignId != null
);

// The DM chooses from their campaign players; an admin from all users.
const viewableUsers = computed(() =>
  isAdmin ? usersService.state.users : usersService.state.campaignPlayers
);

// Is the user looking at someone else's inventory? Then read-only.
const isViewingOther = computed(() => userId.value !== ownUserId.value);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
});
const sharedFilters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
});

const emptyItem = () => ({
  name: "",
  description: "",
  type: "",
  quantity: null,
  image: null,
});

const dialogVisible = ref(false);
const selectedItem = ref(emptyItem());
// Which inventory the open dialog edits/creates into: "mine" or "campaign".
const editingContext = ref("mine");

// The form is read-only only when a DM/admin looks at another player's
// personal item; shared items are always editable by campaign members.
const dialogReadonly = computed(
  () => editingContext.value === "mine" && isViewingOther.value
);

const openDialog = (item, context = "mine") => {
  editingContext.value = context;
  selectedItem.value = item ? { ...item } : emptyItem();
  dialogVisible.value = true;
};

const closeDialog = () => {
  dialogVisible.value = false;
  selectedItem.value = emptyItem();
  editingContext.value = "mine";
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

  if (editingContext.value === "campaign") {
    if (item.id) {
      await sharedInventoryService.updateItem(item);
    } else {
      await sharedInventoryService.addItem(item);
    }
  } else if (item.id) {
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

const deleteSharedItem = (item, event) => {
  confirm.require({
    target: event.currentTarget,
    message: `Delete "${item.name}" from the shared inventory?`,
    rejectProps: { label: "Cancel", severity: "secondary", size: "small" },
    acceptProps: { label: "Delete", icon: "pi pi-trash", size: "small", class: "dt-primary-btn" },
    accept: () => sharedInventoryService.deleteItem(item),
  });
};

const toggleFavourite = (item) => itemsService.toggleFavourite(item);
const toggleSharedFavourite = (item) =>
  sharedInventoryService.toggleFavourite(item);

// Only the owner themselves marks a new item as seen; a DM or admin who is
// looking on leaves the player's notification intact.
const markSeen = (itemId) => {
  if (!isViewingOther.value) itemsService.markItemSeen(itemId);
};
const selectFilterWord = (filterWord) =>
  itemsService.selectFilterWord(filterWord);
const selectSharedFilterWord = (filterWord) =>
  sharedInventoryService.selectFilterWord(filterWord);

// --- Move items between personal and shared inventory ---
const shareItem = async (item) => {
  const ok = await itemsService.moveToShared(item, ownUserId.value);
  if (ok) {
    await sharedInventoryService.fetchShared();
    toast.add({
      severity: "success",
      summary: "Shared",
      detail: `"${item.name}" moved to the shared inventory.`,
      life: 3000,
    });
  } else {
    toast.add({
      severity: "error",
      summary: "Failed",
      detail: itemsService.state.errorMessage || "Could not share item",
      life: 4000,
    });
  }
};

const takeItem = async (item) => {
  const ok = await sharedInventoryService.moveToPersonal(item);
  if (ok) {
    await itemsService.fetchItems(ownUserId.value);
    toast.add({
      severity: "success",
      summary: "Taken",
      detail: `"${item.name}" moved to your inventory.`,
      life: 3000,
    });
  } else {
    toast.add({
      severity: "error",
      summary: "Failed",
      detail: sharedInventoryService.state.errorMessage || "Could not take item",
      life: 4000,
    });
  }
};

// --- Currency: save the displayed player's purse ---
const saveCurrency = async (coins) => {
  const ok = await currencyService.saveCurrency(userId.value, coins);
  toast.add(
    ok
      ? { severity: "success", summary: "Saved", detail: "Purse updated.", life: 2500 }
      : {
          severity: "error",
          summary: "Failed",
          detail: currencyService.state.errorMessage || "Could not save the money",
          life: 4000,
        }
  );
};

// --- Shared party purse ---
const saveSharedCurrency = async (coins) => {
  const ok = await currencyService.saveSharedCurrency(coins);
  toast.add(
    ok
      ? { severity: "success", summary: "Saved", detail: "Party purse updated.", life: 2500 }
      : {
          severity: "error",
          summary: "Failed",
          detail: currencyService.state.errorMessage || "Could not save the money",
          life: 4000,
        }
  );
};

// --- Transfer coins between personal and party purse ---
const transferDialogVisible = ref(false);

// Refresh both of the logged-in user's own purses before opening, so the
// "available" amounts are correct even if a DM/admin was just looking at
// another player's personal purse.
const openTransfer = async () => {
  await currencyService.fetchCurrency(ownUserId.value);
  await currencyService.fetchSharedCurrency();
  transferDialogVisible.value = true;
};

const confirmTransfer = async ({ direction, coins }) => {
  const ok = await currencyService.transferCurrency(direction, coins);
  if (ok) {
    transferDialogVisible.value = false;
    toast.add({
      severity: "success",
      summary: "Transferred",
      detail:
        direction === "toShared"
          ? "Coins moved to the party purse."
          : "Coins moved to your purse.",
      life: 3000,
    });
  } else {
    toast.add({
      severity: "error",
      summary: "Failed",
      detail: currencyService.state.errorMessage || "Could not transfer money",
      life: 4000,
    });
  }
};

// --- DM: send item to players ---
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
      summary: "Sent",
      detail: `"${itemToSend.value.name}" sent to ${recipientIds.length} player(s).`,
      life: 3000,
    });
  } else {
    toast.add({
      severity: "error",
      summary: "Failed",
      detail: itemsService.state.errorMessage || "Could not send item",
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
  await currencyService.fetchCurrency(userId.value);
  // Resolve and load the campaign's shared inventory + party purse (empty when
  // the user has no campaign; the tab stays hidden in that case).
  await sharedInventoryService.fetchShared();
  await currencyService.fetchSharedCurrency();
  // Poll periodically so that items an admin or DM adds in the meantime (with
  // their "New" notification) appear without a manual refresh.
  itemsService.startPolling(userId.value);
});

onUnmounted(() => itemsService.stopPolling());

// Switches the displayed inventory when a different player is selected.
// Empty (or cleared) means back to the user's own inventory.
watch(selectedUser, async (value) => {
  userId.value = value || ownUserId.value;
  itemsService.selectFilterWord(""); // reset category filter on switch
  await itemsService.fetchItems(userId.value);
  await currencyService.fetchCurrency(userId.value);
  itemsService.startPolling(userId.value);
});
</script>

<template>
  <AppNavbar />

  <!-- Tab switch between the personal and the shared campaign inventory.
       Only shown when the user actually belongs to a campaign. -->
  <div
    v-if="hasCampaign"
    class="flex flex-wrap gap-2 max-w-6xl mx-auto px-4 pt-4"
  >
    <button
      type="button"
      class="inv-tab"
      :class="{ 'inv-tab-active': activeTab === 'mine' }"
      @click="activeTab = 'mine'"
    >
      My inventory
    </button>
    <button
      type="button"
      class="inv-tab"
      :class="{ 'inv-tab-active': activeTab === 'campaign' }"
      @click="activeTab = 'campaign'"
    >
      Campaign inventory
    </button>
  </div>

  <!-- ===================== Personal inventory ===================== -->
  <template v-if="activeTab === 'mine'">
    <div
      v-if="hasRight('DM')"
      class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 max-w-6xl mx-auto px-4 pt-4 text-ink dark:text-ink-light"
    >
      <label class="text-sm font-medium">
        View a player's inventory:
      </label>
      <p-select
        v-model="selectedUser"
        :options="viewableUsers"
        option-label="username"
        option-value="id"
        placeholder="Choose a player"
        show-clear
        class="w-full sm:w-auto"
      ></p-select>
      <span v-if="isViewingOther" class="text-sm italic opacity-80">
        (read-only)
      </span>
    </div>

    <div class="max-w-6xl mx-auto px-4 pt-5 pb-10">
      <CurrencyCard
        :currency="currencyService.state.currency"
        @save="saveCurrency"
      />
      <ItemsTable
        :items="itemsService.state.filteredItems"
        :filters="filters"
        :selected-filter="itemsService.state.selectedFilter"
        :readonly="isViewingOther"
        :can-send="isDM && !isViewingOther"
        :can-share="hasCampaign && !isViewingOther"
        @select-filter="selectFilterWord"
        @add-item="openDialog()"
        @toggle-favourite="toggleFavourite"
        @open-item="openDialog"
        @delete-item="deleteItem"
        @send-item="openSend"
        @share-item="shareItem"
        @seen-item="markSeen"
      />
    </div>
  </template>

  <!-- ===================== Shared campaign inventory ===================== -->
  <template v-else>
    <div class="max-w-6xl mx-auto px-4 pt-5 pb-10">
      <CurrencyCard
        :currency="currencyService.state.sharedCurrency"
        can-transfer
        @save="saveSharedCurrency"
        @transfer="openTransfer"
      />
      <ItemsTable
        :items="sharedInventoryService.state.filteredItems"
        :filters="sharedFilters"
        :selected-filter="sharedInventoryService.state.selectedFilter"
        :can-take="true"
        @select-filter="selectSharedFilterWord"
        @add-item="openDialog(null, 'campaign')"
        @toggle-favourite="toggleSharedFavourite"
        @open-item="(item) => openDialog(item, 'campaign')"
        @delete-item="deleteSharedItem"
        @take-item="takeItem"
      />
    </div>
  </template>

  <ItemFormDialog
    v-model:visible="dialogVisible"
    :item="selectedItem"
    :readonly="dialogReadonly"
    @save="saveItem"
    @cancel="closeDialog"
  />

  <SendItemDialog
    v-model:visible="sendDialogVisible"
    :item="itemToSend"
    :players="usersService.state.campaignPlayers"
    @confirm="confirmSend"
  />

  <CurrencyTransferDialog
    v-model:visible="transferDialogVisible"
    :personal="currencyService.state.currency"
    :shared="currencyService.state.sharedCurrency"
    @confirm="confirmTransfer"
  />
</template>

<style scoped>
.inv-tab {
  padding: 0.5rem 1.1rem;
  border-radius: 0.5rem 0.5rem 0 0;
  font-weight: 600;
  font-family: var(--font-serif);
  letter-spacing: 0.02em;
  color: var(--color-ink, #2e2a26);
  background-color: rgba(217, 180, 74, 0.12);
  border: 2px solid transparent;
  border-bottom: none;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.inv-tab:hover {
  background-color: rgba(217, 180, 74, 0.22);
}

.inv-tab-active {
  background-color: #d9b44a;
  color: #2e2a26;
  border-color: #d9b44a;
}

:global(.dark) .inv-tab {
  color: #f5f5f5;
}

:global(.dark) .inv-tab-active {
  color: #2e2a26;
}
</style>
