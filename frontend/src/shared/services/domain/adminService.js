import { reactive } from "vue";
import ApiRepository from "@/shared/api/repositories/ApiRepository";
import GetAdminStatsUseCase from "@/features/adminPanel/useCases/GetAdminStatsUseCase";

const repository = new ApiRepository();
const getAdminStatsUseCase = new GetAdminStatsUseCase(repository);

const state = reactive({
  stats: null,
  loading: false,
  errorMessage: "",
});

// Haalt alle dashboard-cijfers (totalen + recente activiteit) in één call op.
async function fetchStats() {
  state.errorMessage = "";
  state.loading = true;
  try {
    state.stats = await getAdminStatsUseCase.execute();
  } catch (err) {
    state.errorMessage = err.message || "Kon statistieken niet laden";
  } finally {
    state.loading = false;
  }
}

export const adminService = {
  state,
  fetchStats,
};
