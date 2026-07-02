import { reactive } from "vue";
import { jwtDecode } from "jwt-decode";
import User from "@/entities/user/User";
import ApiRepository from "@/shared/api/repositories/ApiRepository";
import LoginUserUseCase from "@/features/auth/useCases/LoginUserUseCase";
import RegisterUserUseCase from "@/features/auth/useCases/RegisterUserUseCase";

const TOKEN_KEY = "JWT_token";

const repository = new ApiRepository();
const loginUseCase = new LoginUserUseCase(repository);
const registerUseCase = new RegisterUserUseCase(repository);

const state = reactive({
  errorMessage: "",
});

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getUserFromToken() {
  const token = getToken();
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

function isLoggedIn() {
  const user = getUserFromToken();
  if (!user?.exp) return false;

  const isValid = Date.now() < user.exp * 1000;
  if (!isValid) {
    logout();
  }

  return isValid;
}

function getUser() {
  return getUserFromToken();
}

function getUserId() {
  return getUserFromToken()?.id ?? null;
}

function getUsername() {
  return getUserFromToken()?.username ?? null;
}

function getRole() {
  return getUserFromToken()?.role ?? null;
}

async function login(username, password) {
  state.errorMessage = "";
  try {
    const loggedInUser = await loginUseCase.execute(new User(username, password));
    if (!loggedInUser?.token) {
      state.errorMessage = "Login failed, check credentials.";
      return false;
    }
    localStorage.setItem(TOKEN_KEY, loggedInUser.token);
    return true;
  } catch (err) {
    state.errorMessage = err.message || "Something went wrong";
    return false;
  }
}

async function register(username, password, campaignId) {
  state.errorMessage = "";
  try {
    const user = new User(username, password);
    user.campaignId = campaignId;
    await registerUseCase.execute(user);
    return true;
  } catch (err) {
    state.errorMessage = err.message || "Register failed, try again.";
    return false;
  }
}

export const authService = {
  state,
  login,
  register,
  logout,
  getToken,
  setToken,
  isLoggedIn,
  getUserId,
  getUsername,
  getRole,
  getUser,
};
