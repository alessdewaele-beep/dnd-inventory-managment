import { reactive } from "vue";
import ApiRepository from "@/shared/api/repositories/ApiRepository";

const repository = new ApiRepository();

const state = reactive({
  campaigns: [],
  errorMessage: "",
});

// Haalt de publieke campagnelijst (id + naam) op voor de registratie-select.
async function fetchPublicCampaigns() {
  state.errorMessage = "";
  try {
    state.campaigns = await repository.getPublicCampaigns();
  } catch (err) {
    state.errorMessage = err.message || "Could not load campaigns";
  }
}

export const campaignsService = {
  state,
  fetchPublicCampaigns,
};
