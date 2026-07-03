import { reactive } from "vue";
import ApiRepository from "@/shared/api/repositories/ApiRepository";
import GetAllItemsByUserIdUseCase from "@/features/inventory/useCases/GetAllItemsByUserIdUseCase";
import AddItemUseCase from "@/features/inventory/useCases/AddItemUseCase";
import UpdateItemUseCase from "@/features/inventory/useCases/UpdateItemUseCase";
import DeleteItemUseCase from "@/features/inventory/useCases/DeleteItemUseCase";
import SendItemUseCase from "@/features/inventory/useCases/SendItemUseCase";
import MarkItemSeenUseCase from "@/features/inventory/useCases/MarkItemSeenUseCase";

const repository = new ApiRepository();
const getAllItemsByUserIdUseCase = new GetAllItemsByUserIdUseCase(repository);
const addItemUseCase = new AddItemUseCase(repository);
const updateItemUseCase = new UpdateItemUseCase(repository);
const deleteItemUseCase = new DeleteItemUseCase(repository);
const sendItemUseCase = new SendItemUseCase(repository);
const markItemSeenUseCase = new MarkItemSeenUseCase(repository);

const state = reactive({
  items: [],
  filteredItems: [],
  selectedFilter: "",
  errorMessage: "",
});

function sortItems() {
  state.items.sort((a, b) => {
    if (a.favourite === b.favourite) {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    return a.favourite ? -1 : 1;
  });
}

function filterItems() {
  if (!state.selectedFilter) {
    state.filteredItems = [...state.items];
    return;
  }

  state.filteredItems = state.items.filter((item) => {
    if (state.selectedFilter === "weapon") return item.type.startsWith("weapon");
    if (state.selectedFilter === "armor") return item.type.startsWith("armor");
    return item.type === state.selectedFilter;
  });
}

async function fetchItems(userId) {
  state.errorMessage = "";
  try {
    state.items = await getAllItemsByUserIdUseCase.execute(userId);
    sortItems();
    filterItems();
  } catch (err) {
    state.errorMessage = err.message || "Could not load items";
  }
}

async function addItem(item, userId) {
  state.errorMessage = "";
  try {
    await addItemUseCase.execute({ ...item, favourite: false, userId });
    await fetchItems(userId);
    return true;
  } catch (err) {
    state.errorMessage = err.message || "Could not add item";
    return false;
  }
}

async function updateItem(item, userId) {
  state.errorMessage = "";
  try {
    await updateItemUseCase.execute(item);
    await fetchItems(userId);
    return true;
  } catch (err) {
    state.errorMessage = err.message || "Could not update item";
    return false;
  }
}

async function deleteItem(item, userId) {
  state.errorMessage = "";
  try {
    await deleteItemUseCase.execute(item.id);
    await fetchItems(userId);
  } catch (err) {
    state.errorMessage = err.message || "Could not delete item";
  }
}

// DM: stuurt een kopie van `item` naar de opgegeven spelers. Het eigen item
// blijft ongewijzigd, dus geen refetch nodig. Geeft true bij succes terug.
async function sendItem(item, recipientIds, quantity) {
  state.errorMessage = "";
  try {
    await sendItemUseCase.execute(item.id, recipientIds, quantity);
    return true;
  } catch (err) {
    state.errorMessage = err.message || "Kon item niet versturen";
    return false;
  }
}

// De eigenaar hovert over een nieuw item: highlight meteen (optimistisch)
// weghalen en de vlag op de backend uitzetten. Bij een fout zetten we ze
// terug, zodat de server de waarheid blijft.
async function markItemSeen(itemId) {
  const item = state.items.find((i) => i.id === itemId);
  if (!item || !item.is_new) return;
  item.is_new = 0;
  try {
    await markItemSeenUseCase.execute(itemId);
  } catch {
    item.is_new = 1;
  }
}

// Polling: haalt de inventory periodiek opnieuw op zodat items die intussen
// door een admin of DM werden toegevoegd (met hun notificatie) verschijnen.
let pollTimer = null;

function startPolling(userId, intervalMs = 15000) {
  stopPolling();
  pollTimer = setInterval(() => fetchItems(userId), intervalMs);
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

async function toggleFavourite(item) {
  item.favourite = !item.favourite;
  try {
    await updateItemUseCase.execute(item);
    sortItems();
  } catch (err) {
    item.favourite = !item.favourite;
    state.errorMessage = err.message || "Could not update item";
  }
}

function selectFilterWord(filterWord) {
  state.selectedFilter = state.selectedFilter === filterWord ? "" : filterWord;
  filterItems();
}

export const itemsService = {
  state,
  fetchItems,
  addItem,
  updateItem,
  deleteItem,
  sendItem,
  markItemSeen,
  startPolling,
  stopPolling,
  toggleFavourite,
  selectFilterWord,
};
