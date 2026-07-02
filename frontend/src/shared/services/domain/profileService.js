import { reactive } from "vue";
import ApiRepository from "@/shared/api/repositories/ApiRepository";
import { authService } from "@/shared/services/domain/authService";
import GetMeUseCase from "@/features/profile/useCases/GetMeUseCase";
import UpdateProfileUseCase from "@/features/profile/useCases/UpdateProfileUseCase";
import ChangePasswordUseCase from "@/features/profile/useCases/ChangePasswordUseCase";

const repository = new ApiRepository();
const getMeUseCase = new GetMeUseCase(repository);
const updateProfileUseCase = new UpdateProfileUseCase(repository);
const changePasswordUseCase = new ChangePasswordUseCase(repository);

// Gedeelde profielstaat: door AppNavbar (campagne-context) en de profielpagina.
const state = reactive({
  me: null, // { id, username, role, campaign_id, campaign_name, backstory }
  errorMessage: "",
  loading: false,
});

// Haalt het eigen profiel op. `force` omzeilt de cache (bv. na een wijziging).
// De cache is gekoppeld aan de huidige token-id, zodat een andere gebruiker
// nooit het profiel van de vorige sessie te zien krijgt.
async function fetchMe(force = false) {
  if (!authService.isLoggedIn()) return null;
  const currentId = authService.getUserId();
  if (state.me && state.me.id === currentId && !force) return state.me;

  state.loading = true;
  state.errorMessage = "";
  try {
    state.me = await getMeUseCase.execute();
    return state.me;
  } catch (err) {
    state.errorMessage = err.message || "Kon profiel niet laden";
    return null;
  } finally {
    state.loading = false;
  }
}

// Werkt username en/of backstory bij. Bij een username-wijziging wordt de
// verse token opgeslagen zodat de sessie in sync blijft.
async function updateProfile(data) {
  state.errorMessage = "";
  try {
    const result = await updateProfileUseCase.execute(data);
    if (result?.token) {
      authService.setToken(result.token);
    }
    state.me = result?.user ?? state.me;
    return true;
  } catch (err) {
    state.errorMessage = err.message || "Kon profiel niet bijwerken";
    return false;
  }
}

async function changePassword(currentPassword, newPassword) {
  state.errorMessage = "";
  try {
    await changePasswordUseCase.execute(currentPassword, newPassword);
    return true;
  } catch (err) {
    state.errorMessage = err.message || "Kon wachtwoord niet wijzigen";
    return false;
  }
}

// Wist de gecachte profielstaat (bij uitloggen).
function clear() {
  state.me = null;
  state.errorMessage = "";
}

export const profileService = {
  state,
  fetchMe,
  updateProfile,
  changePassword,
  clear,
};
