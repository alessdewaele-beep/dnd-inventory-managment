import { reactive } from "vue";
import ApiRepository from "@/shared/api/repositories/ApiRepository";
import GetAllItemsByUserIdUseCase from "@/features/inventory/useCases/GetAllItemsByUserIdUseCase";
import AddItemUseCase from "@/features/inventory/useCases/AddItemUseCase";
import UpdateItemUseCase from "@/features/inventory/useCases/UpdateItemUseCase";
import DeleteItemUseCase from "@/features/inventory/useCases/DeleteItemUseCase";
import SendItemUseCase from "@/features/inventory/useCases/SendItemUseCase";
import MarkItemSeenUseCase from "@/features/inventory/useCases/MarkItemSeenUseCase";
import MoveItemUseCase from "@/features/inventory/useCases/MoveItemUseCase";

const repository = new ApiRepository();
const getAllItemsByUserIdUseCase = new GetAllItemsByUserIdUseCase(repository);
const addItemUseCase = new AddItemUseCase(repository);
const updateItemUseCase = new UpdateItemUseCase(repository);
const deleteItemUseCase = new DeleteItemUseCase(repository);
const sendItemUseCase = new SendItemUseCase(repository);
const markItemSeenUseCase = new MarkItemSeenUseCase(repository);
const moveItemUseCase = new MoveItemUseCase(repository);

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

// Sends only the editable fields (not id/created_at/userId or the whole
// reactive copy). The backend update is dynamic over the sent keys.
async function updateItem(item, userId) {
  state.errorMessage = "";
  try {
    await updateItemUseCase.execute({
      id: item.id,
      name: item.name,
      description: item.description,
      type: item.type,
      quantity: item.quantity,
      favourite: item.favourite,
      image: item.image ?? null,
    });
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

// DM: sends a copy of `item` to the given players. The own item stays
// unchanged, so no refetch is needed. Returns true on success.
async function sendItem(item, recipientIds, quantity) {
  state.errorMessage = "";
  try {
    await sendItemUseCase.execute(item.id, recipientIds, quantity);
    return true;
  } catch (err) {
    state.errorMessage = err.message || "Could not send item";
    return false;
  }
}

// Moves one of the user's own personal items into the campaign's shared
// inventory. Returns true on success; the caller refreshes the shared list.
async function moveToShared(item, userId) {
  state.errorMessage = "";
  try {
    await moveItemUseCase.execute(item.id, "shared");
    await fetchItems(userId);
    return true;
  } catch (err) {
    state.errorMessage = err.message || "Could not share item";
    return false;
  }
}

// The owner hovers over a new item: remove the highlight immediately
// (optimistically) and turn off the flag on the backend. On an error we set it
// back, so the server remains the source of truth.
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

// Polling: periodically refetches the inventory so that items added in the
// meantime by an admin or DM (with their notification) appear.
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
    // Send only the changed flag: this way the (possibly large) base64
    // photo does not go over the wire and into the DB on every favourite toggle.
    await updateItemUseCase.execute({ id: item.id, favourite: item.favourite });
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
  moveToShared,
  markItemSeen,
  startPolling,
  stopPolling,
  toggleFavourite,
  selectFilterWord,
};
