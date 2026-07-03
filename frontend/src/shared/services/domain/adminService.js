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

// Fetches all dashboard figures (totals + recent activity) in a single call.
async function fetchStats() {
  state.errorMessage = "";
  state.loading = true;
  try {
    state.stats = await getAdminStatsUseCase.execute();
  } catch (err) {
    state.errorMessage = err.message || "Could not load statistics";
  } finally {
    state.loading = false;
  }
}

export const adminService = {
  state,
  fetchStats,
};
