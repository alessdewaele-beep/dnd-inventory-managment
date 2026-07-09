import { reactive } from "vue";
import ApiRepository from "@/shared/api/repositories/ApiRepository";
import { authService } from "@/shared/services/domain/authService";
import GetNotificationsUseCase from "@/features/notifications/useCases/GetNotificationsUseCase";
import GetUnreadCountUseCase from "@/features/notifications/useCases/GetUnreadCountUseCase";
import MarkNotificationReadUseCase from "@/features/notifications/useCases/MarkNotificationReadUseCase";
import MarkAllNotificationsReadUseCase from "@/features/notifications/useCases/MarkAllNotificationsReadUseCase";

const repository = new ApiRepository();
const getNotificationsUseCase = new GetNotificationsUseCase(repository);
const getUnreadCountUseCase = new GetUnreadCountUseCase(repository);
const markReadUseCase = new MarkNotificationReadUseCase(repository);
const markAllReadUseCase = new MarkAllNotificationsReadUseCase(repository);

const state = reactive({
  items: [],
  unreadCount: 0,
  loading: false,
  errorMessage: "",
});

// Full list, for the notifications page.
async function fetchNotifications() {
  state.loading = true;
  state.errorMessage = "";
  try {
    state.items = await getNotificationsUseCase.execute();
    state.unreadCount = state.items.filter((n) => n.isUnread()).length;
  } catch (err) {
    state.errorMessage = err.message || "Could not load notifications";
  } finally {
    state.loading = false;
  }
}

// Lightweight badge count, polled from the navbar.
async function fetchUnreadCount() {
  if (!authService.isLoggedIn()) return;
  try {
    state.unreadCount = await getUnreadCountUseCase.execute();
  } catch {
    // A failed poll should never disrupt the UI; keep the last known count.
  }
}

async function markRead(id) {
  const item = state.items.find((n) => n.id === id);
  if (!item || item.is_read) return;
  item.is_read = true; // optimistic
  state.unreadCount = Math.max(0, state.unreadCount - 1);
  try {
    await markReadUseCase.execute(id);
  } catch {
    item.is_read = false;
    state.unreadCount += 1;
  }
}

async function markAllRead() {
  const previous = state.items.map((n) => n.is_read);
  state.items.forEach((n) => (n.is_read = true));
  state.unreadCount = 0;
  try {
    await markAllReadUseCase.execute();
  } catch (err) {
    state.items.forEach((n, i) => (n.is_read = previous[i]));
    state.unreadCount = state.items.filter((n) => n.isUnread()).length;
    state.errorMessage = err.message || "Could not update notifications";
  }
}

// Badge polling (navbar). Cleared on logout.
let pollTimer = null;

function startPolling(intervalMs = 20000) {
  stopPolling();
  fetchUnreadCount();
  pollTimer = setInterval(fetchUnreadCount, intervalMs);
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

function clear() {
  stopPolling();
  state.items = [];
  state.unreadCount = 0;
  state.errorMessage = "";
}

export const notificationsService = {
  state,
  fetchNotifications,
  fetchUnreadCount,
  markRead,
  markAllRead,
  startPolling,
  stopPolling,
  clear,
};
