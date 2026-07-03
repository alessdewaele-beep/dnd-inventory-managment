import { reactive } from "vue";
import ApiRepository from "@/shared/api/repositories/ApiRepository";
import GetCurrencyUseCase from "@/features/inventory/useCases/GetCurrencyUseCase";
import UpdateCurrencyUseCase from "@/features/inventory/useCases/UpdateCurrencyUseCase";

const repository = new ApiRepository();
const getCurrencyUseCase = new GetCurrencyUseCase(repository);
const updateCurrencyUseCase = new UpdateCurrencyUseCase(repository);

const state = reactive({
  currency: { pp: 0, gp: 0, sp: 0, cp: 0 },
  errorMessage: "",
});

function apply(c) {
  state.currency = { pp: c.pp, gp: c.gp, sp: c.sp, cp: c.cp };
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

export const currencyService = { state, fetchCurrency, saveCurrency };
