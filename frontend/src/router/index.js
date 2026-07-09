import { createRouter, createWebHashHistory } from "vue-router";
import { authService } from "@/shared/services/domain/authService";
import { useRightManager } from "@/shared/composables/useRightManager";
import InventoryPage from "@/features/inventory/pages/InventoryPage.vue";
import RegisterPage from "@/features/auth/pages/RegisterPage.vue";
import LoginPage from "@/features/auth/pages/LoginPage.vue";
import ProfilePage from "@/features/profile/pages/ProfilePage.vue";
import NotificationsPage from "@/features/notifications/pages/NotificationsPage.vue";
import AdminPanelPage from "@/features/adminPanel/pages/AdminPanelPage.vue";
import AdminDashboardPage from "@/features/adminPanel/pages/AdminDashboardPage.vue";
import AdminUsersPage from "@/features/adminPanel/pages/AdminUsersPage.vue";
import AdminCampaignsPage from "@/features/adminPanel/pages/AdminCampaignsPage.vue";
import AdminItemsPage from "@/features/adminPanel/pages/AdminItemsPage.vue";

const routes = [
  { path: "/", name: "start", component: LoginPage },
  {
    path: "/home",
    name: "Home",
    component: InventoryPage,
    meta: { requiresAuth: true },
  },
  { path: "/register", name: "Register", component: RegisterPage },
  {
    path: "/profile",
    name: "Profile",
    component: ProfilePage,
    meta: { requiresAuth: true },
  },
  {
    path: "/notifications",
    name: "Notifications",
    component: NotificationsPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin",
    component: AdminPanelPage,
    meta: { requiresAuth: true, requiredRole: "Admin" },
    children: [
      { path: "", name: "AdminDashboard", component: AdminDashboardPage },
      { path: "users", name: "AdminUsers", component: AdminUsersPage },
      { path: "campaigns", name: "AdminCampaigns", component: AdminCampaignsPage },
      { path: "items", name: "AdminItems", component: AdminItemsPage },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const { hasRight } = useRightManager();

  if (to.meta.requiresAuth && !authService.isLoggedIn()) {
    return next("/");
  }

  if (to.meta.requiredRole && !hasRight(to.meta.requiredRole)) {
    return next("/home");
  }

  next();
});

export default router;
