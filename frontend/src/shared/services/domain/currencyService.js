import { reactive } from "vue";
import ApiRepository from "@/shared/api/repositories/ApiRepository";
import GetCurrencyUseCase from "@/features/inventory/useCases/GetCurrencyUseCase";
import UpdateCurrencyUseCase from "@/features/inventory/useCases/UpdateCurrencyUseCase";
import GetSharedCurrencyUseCase from "@/features/inventory/useCases/GetSharedCurrencyUseCase";
import UpdateSharedCurrencyUseCase from "@/features/inventory/useCases/UpdateSharedCurrencyUseCase";
import TransferCurrencyUseCase from "@/features/inventory/useCases/TransferCurrencyUseCase";

const repository = new ApiRepository();
const getCurrencyUseCase = new GetCurrencyUseCase(repository);
const updateCurrencyUseCase = new UpdateCurrencyUseCase(repository);
const getSharedCurrencyUseCase = new GetSharedCurrencyUseCase(repository);
const updateSharedCurrencyUseCase = new UpdateSharedCurrencyUseCase(repository);
const transferCurrencyUseCase = new TransferCurrencyUseCase(repository);

const state = reactive({
  currency: { pp: 0, gp: 0, sp: 0, cp: 0 },
  sharedCurrency: { pp: 0, gp: 0, sp: 0, cp: 0 },
  errorMessage: "",
});

function apply(c) {
  state.currency = { pp: c.pp, gp: c.gp, sp: c.sp, cp: c.cp };
}

function applyShared(c) {
  state.sharedCurrency = { pp: c.pp, gp: c.gp, sp: c.sp, cp: c.cp };
}

async function fetchCurrency(userId) {
  state.errorMessage = "";
  try {
    apply(await getCurrencyUseCase.execute(userId));
  } catch (err) {
    state.errorMessage = err.message || "Could not load money";
  }
}

async function saveCurrency(userId, coins) {
  state.errorMessage = "";
  try {
    apply(await updateCurrencyUseCase.execute(userId, coins));
    return true;
  } catch (err) {
    state.errorMessage = err.message || "Could not save money";
    return false;
  }
}

// --- Shared party purse (own campaign) ---
async function fetchSharedCurrency() {
  state.errorMessage = "";
  try {
    const { currency } = await getSharedCurrencyUseCase.execute();
    applyShared(currency);
  } catch (err) {
    state.errorMessage = err.message || "Could not load the shared money";
  }
}

async function saveSharedCurrency(coins) {
  state.errorMessage = "";
  try {
    applyShared(await updateSharedCurrencyUseCase.execute(coins));
    return true;
  } catch (err) {
    state.errorMessage = err.message || "Could not save the shared money";
    return false;
  }
}

// Moves coins between the personal and party purse; on success both purses
// in state are updated from the server's response (single source of truth).
async function transferCurrency(direction, coins) {
  state.errorMessage = "";
  try {
    const { personal, shared } = await transferCurrencyUseCase.execute(
      direction,
      coins
    );
    apply(personal);
    applyShared(shared);
    return true;
  } catch (err) {
    state.errorMessage = err.message || "Could not transfer money";
    return false;
  }
}

export const currencyService = {
  state,
  fetchCurrency,
  saveCurrency,
  fetchSharedCurrency,
  saveSharedCurrency,
  transferCurrency,
};
