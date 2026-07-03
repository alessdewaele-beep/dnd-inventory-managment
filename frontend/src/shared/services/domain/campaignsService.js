import { reactive } from "vue";
import ApiRepository from "@/shared/api/repositories/ApiRepository";
import GetAllCampaignsUseCase from "@/features/adminPanel/useCases/GetAllCampaignsUseCase";
import CreateCampaignUseCase from "@/features/adminPanel/useCases/CreateCampaignUseCase";
import UpdateCampaignUseCase from "@/features/adminPanel/useCases/UpdateCampaignUseCase";
import DeleteCampaignUseCase from "@/features/adminPanel/useCases/DeleteCampaignUseCase";
import AssignDungeonMasterUseCase from "@/features/adminPanel/useCases/AssignDungeonMasterUseCase";

const repository = new ApiRepository();
const getAllCampaignsUseCase = new GetAllCampaignsUseCase(repository);
const createCampaignUseCase = new CreateCampaignUseCase(repository);
const updateCampaignUseCase = new UpdateCampaignUseCase(repository);
const deleteCampaignUseCase = new DeleteCampaignUseCase(repository);
const assignDungeonMasterUseCase = new AssignDungeonMasterUseCase(repository);

const state = reactive({
  campaigns: [],
  allCampaigns: [],
  errorMessage: "",
});

// Fetches the public campaign list (id + name) for the registration select.
async function fetchPublicCampaigns() {
  state.errorMessage = "";
  try {
    state.campaigns = await repository.getPublicCampaigns();
  } catch (err) {
    state.errorMessage = err.message || "Could not load campaigns";
  }
}

// Full campaign list (incl. description + dungeon_master) for admin.
async function fetchAllCampaigns() {
  state.errorMessage = "";
  try {
    state.allCampaigns = await getAllCampaignsUseCase.execute();
  } catch (err) {
    state.errorMessage = err.message || "Could not load campaigns";
  }
}

async function createCampaign(data) {
  state.errorMessage = "";
  try {
    await createCampaignUseCase.execute(data);
    await fetchAllCampaigns();
    return true;
  } catch (err) {
    state.errorMessage = err.message || "Could not create campaign";
    return false;
  }
}

async function updateCampaign(campaignId, data) {
  state.errorMessage = "";
  try {
    await updateCampaignUseCase.execute(campaignId, data);
    await fetchAllCampaigns();
    return true;
  } catch (err) {
    state.errorMessage = err.message || "Could not update campaign";
    return false;
  }
}

async function deleteCampaign(campaignId) {
  state.errorMessage = "";
  try {
    await deleteCampaignUseCase.execute(campaignId);
    await fetchAllCampaigns();
    return true;
  } catch (err) {
    state.errorMessage = err.message || "Could not delete campaign";
    return false;
  }
}

// Assigns (or unassigns with userId = null) a DM to a campaign.
async function assignDungeonMaster(campaignId, userId) {
  state.errorMessage = "";
  try {
    await assignDungeonMasterUseCase.execute(campaignId, userId);
    await fetchAllCampaigns();
    return true;
  } catch (err) {
    state.errorMessage = err.message || "Could not assign DM";
    return false;
  }
}

export const campaignsService = {
  state,
  fetchPublicCampaigns,
  fetchAllCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  assignDungeonMaster,
};
