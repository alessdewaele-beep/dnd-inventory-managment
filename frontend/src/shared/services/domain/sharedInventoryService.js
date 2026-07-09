import { reactive } from "vue";
import ApiRepository from "@/shared/api/repositories/ApiRepository";
import GetSharedInventoryUseCase from "@/features/inventory/useCases/GetSharedInventoryUseCase";
import AddItemUseCase from "@/features/inventory/useCases/AddItemUseCase";
import UpdateItemUseCase from "@/features/inventory/useCases/UpdateItemUseCase";
import DeleteItemUseCase from "@/features/inventory/useCases/DeleteItemUseCase";
import MoveItemUseCase from "@/features/inventory/useCases/MoveItemUseCase";

const repository = new ApiRepository();
const getSharedInventoryUseCase = new GetSharedInventoryUseCase(repository);
const addItemUseCase = new AddItemUseCase(repository);
const updateItemUseCase = new UpdateItemUseCase(repository);
const deleteItemUseCase = new DeleteItemUseCase(repository);
const moveItemUseCase = new MoveItemUseCase(repository);

// The campaign-wide shared inventory: one list for every player + DM in the
// campaign. Mirrors itemsService, but keyed on the campaign instead of a user.
const state = reactive({
  items: [],
  filteredItems: [],
  selectedFilter: "",
  campaignId: null, // resolved server-side; null means no campaign context
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

async function fetchShared() {
  state.errorMessage = "";
  try {
    const { campaignId, items } = await getSharedInventoryUseCase.execute();
    state.campaignId = campaignId;
    state.items = items;
    sortItems();
    filterItems();
  } catch (err) {
    state.errorMessage = err.message || "Could not load the shared inventory";
  }
}

async function addItem(item) {
  state.errorMessage = "";
  if (!state.campaignId) {
    state.errorMessage = "You are not part of a campaign";
    return false;
  }
  try {
    await addItemUseCase.execute({
      ...item,
      favourite: false,
      campaign_id: state.campaignId,
    });
    await fetchShared();
    return true;
  } catch (err) {
    state.errorMessage = err.message || "Could not add item";
    return false;
  }
}

async function updateItem(item) {
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
    await fetchShared();
    return true;
  } catch (err) {
    state.errorMessage = err.message || "Could not update item";
    return false;
  }
}

async function deleteItem(item) {
  state.errorMessage = "";
  try {
    await deleteItemUseCase.execute(item.id);
    await fetchShared();
  } catch (err) {
    state.errorMessage = err.message || "Could not delete item";
  }
}

// Takes a shared item into the requester's own personal inventory. Returns
// true on success; the caller refreshes the personal inventory afterwards.
async function moveToPersonal(item) {
  state.errorMessage = "";
  try {
    await moveItemUseCase.execute(item.id, "personal");
    await fetchShared();
    return true;
  } catch (err) {
    state.errorMessage = err.message || "Could not take item";
    return false;
  }
}

async function toggleFavourite(item) {
  item.favourite = !item.favourite;
  try {
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

export const sharedInventoryService = {
  state,
  fetchShared,
  addItem,
  updateItem,
  deleteItem,
  moveToPersonal,
  toggleFavourite,
  selectFilterWord,
};
