import { reactive } from "vue";
import ApiRepository from "@/shared/api/repositories/ApiRepository";
import GetAllUsersUseCase from "@/features/inventory/useCases/GetAllUsersUseCase";

const repository = new ApiRepository();
const getAllUsersUseCase = new GetAllUsersUseCase(repository);

const state = reactive({
  users: [],
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

export const usersService = {
  state,
  fetchUsers,
};
