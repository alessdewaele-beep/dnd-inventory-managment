import { reactive } from "vue";
import ApiRepository from "@/shared/api/repositories/ApiRepository";
import GetHpUseCase from "@/features/settings/useCases/GetHpUseCase";
import UpdateHpUseCase from "@/features/settings/useCases/UpdateHpUseCase";

const repository = new ApiRepository();
const getHpUseCase = new GetHpUseCase(repository);
const updateHpUseCase = new UpdateHpUseCase(repository);

// HP tracker of the currently displayed user (own or, for a DM/admin,
// the selected player's). Disabled until turned on in the settings.
const state = reactive({
  hp: { enabled: false, maxHp: 10, currentHp: 10, tempHp: 0 },
  errorMessage: "",
});

function apply(hp) {
  state.hp = {
    enabled: hp.enabled,
    maxHp: hp.maxHp,
    currentHp: hp.currentHp,
    tempHp: hp.tempHp,
  };
}

async function fetchHp(userId) {
  state.errorMessage = "";
  try {
    apply(await getHpUseCase.execute(userId));
  } catch (err) {
    state.errorMessage = err.message || "Could not load hit points";
  }
}

// Saves the full HP state (settings page). The server clamps currentHp
// to the (possibly lowered) maxHp and returns the stored state.
async function saveHp(userId, hp) {
  state.errorMessage = "";
  try {
    apply(await updateHpUseCase.execute(userId, hp));
    return true;
  } catch (err) {
    state.errorMessage = err.message || "Could not save hit points";
    return false;
  }
}

// One point of damage, following D&D rules: temporary hit points absorb
// the damage first; only when they run out does the real HP drop. The new
// state is applied optimistically so rapid arrow clicks stay responsive;
// the server response (via saveHp) remains the source of truth.
async function damage(userId) {
  const hp = state.hp;
  const next =
    hp.tempHp > 0
      ? { ...hp, tempHp: hp.tempHp - 1 }
      : { ...hp, currentHp: Math.max(0, hp.currentHp - 1) };
  apply(next);
  return saveHp(userId, next);
}

// One point of healing: only real HP, capped at the maximum
// (temp HP is never "healed", per D&D rules).
async function heal(userId) {
  const hp = state.hp;
  const next = { ...hp, currentHp: Math.min(hp.maxHp, hp.currentHp + 1) };
  apply(next);
  return saveHp(userId, next);
}

// Sets the temporary HP buffer directly (user-entered value).
async function setTempHp(userId, value) {
  return saveHp(userId, { ...state.hp, tempHp: Math.max(0, value || 0) });
}

export const hpService = {
  state,
  fetchHp,
  saveHp,
  damage,
  heal,
  setTempHp,
};
