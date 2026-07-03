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

// Shared profile state: used by AppNavbar (campaign context) and the profile page.
const state = reactive({
  me: null, // { id, username, role, campaign_id, campaign_name, backstory }
  errorMessage: "",
  loading: false,
});

// Fetches your own profile. `force` bypasses the cache (e.g. after a change).
// The cache is tied to the current token id, so a different user never
// sees the profile from the previous session.
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
    state.errorMessage = err.message || "Could not load profile";
    return null;
  } finally {
    state.loading = false;
  }
}

// Updates the username and/or backstory. On a username change the fresh
// token is stored so the session stays in sync.
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
    state.errorMessage = err.message || "Could not update profile";
    return false;
  }
}

async function changePassword(currentPassword, newPassword) {
  state.errorMessage = "";
  try {
    await changePasswordUseCase.execute(currentPassword, newPassword);
    return true;
  } catch (err) {
    state.errorMessage = err.message || "Could not change password";
    return false;
  }
}

// Clears the cached profile state (on logout).
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
