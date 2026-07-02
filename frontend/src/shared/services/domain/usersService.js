import { reactive } from "vue";
import ApiRepository from "@/shared/api/repositories/ApiRepository";
import GetAllUsersUseCase from "@/features/inventory/useCases/GetAllUsersUseCase";
import GetCampaignPlayersUseCase from "@/features/inventory/useCases/GetCampaignPlayersUseCase";
import AdminGetAllUsersUseCase from "@/features/adminPanel/useCases/GetAllUsersUseCase";
import DeleteUserUseCase from "@/features/adminPanel/useCases/DeleteUserUseCase";
import UpdateUserUseCase from "@/features/adminPanel/useCases/UpdateUserUseCase";
import ResetUserPasswordUseCase from "@/features/adminPanel/useCases/ResetUserPasswordUseCase";

const repository = new ApiRepository();
const getAllUsersUseCase = new GetAllUsersUseCase(repository);
const getCampaignPlayersUseCase = new GetCampaignPlayersUseCase(repository);
const adminGetAllUsersUseCase = new AdminGetAllUsersUseCase(repository);
const deleteUserUseCase = new DeleteUserUseCase(repository);
const updateUserUseCase = new UpdateUserUseCase(repository);
const resetUserPasswordUseCase = new ResetUserPasswordUseCase(repository);

const state = reactive({
  users: [],
  adminUsers: [],
  campaignPlayers: [],
  errorMessage: "",
});

async function fetchUsers() {
  state.errorMessage = "";
  try {
    state.users = await getAllUsersUseCase.execute();
  } catch (err) {
    state.errorMessage = err.message || "Could not load users";
  }
}

// Spelers uit de campagne(s) van de ingelogde DM (voor het DM-inventoryscherm).
async function fetchCampaignPlayers() {
  state.errorMessage = "";
  try {
    state.campaignPlayers = await getCampaignPlayersUseCase.execute();
  } catch (err) {
    state.errorMessage = err.message || "Kon spelers niet laden";
  }
}

// Volledige gebruikerslijst (ruwe objecten) voor het admin-scherm.
async function fetchAdminUsers() {
  state.errorMessage = "";
  try {
    state.adminUsers = await adminGetAllUsersUseCase.execute();
  } catch (err) {
    state.errorMessage = err.message || "Kon gebruikers niet laden";
  }
}

async function deleteUser(userId) {
  state.errorMessage = "";
  try {
    await deleteUserUseCase.execute(userId);
    await fetchAdminUsers();
    return true;
  } catch (err) {
    state.errorMessage = err.message || "Kon gebruiker niet verwijderen";
    return false;
  }
}

// Werkt rol en/of campagne-koppeling bij.
async function updateUser(userId, data) {
  state.errorMessage = "";
  try {
    await updateUserUseCase.execute(userId, data);
    await fetchAdminUsers();
    return true;
  } catch (err) {
    state.errorMessage = err.message || "Kon gebruiker niet bijwerken";
    return false;
  }
}

// Geeft het gegenereerde tijdelijke wachtwoord terug (of null bij fout).
async function resetPassword(userId) {
  state.errorMessage = "";
  try {
    return await resetUserPasswordUseCase.execute(userId);
  } catch (err) {
    state.errorMessage = err.message || "Kon wachtwoord niet resetten";
    return null;
  }
}

export const usersService = {
  state,
  fetchUsers,
  fetchCampaignPlayers,
  fetchAdminUsers,
  deleteUser,
  updateUser,
  resetPassword,
};
