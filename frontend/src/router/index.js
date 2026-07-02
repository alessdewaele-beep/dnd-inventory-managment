import { createRouter, createWebHashHistory } from "vue-router";
import { authService } from "@/shared/services/domain/authService";
import { useRightManager } from "@/shared/composables/useRightManager";
import InventoryPage from "@/features/inventory/pages/InventoryPage.vue";
import RegisterPage from "@/features/auth/pages/RegisterPage.vue";
import LoginPage from "@/features/auth/pages/LoginPage.vue";
import AdminPanelPage from "@/features/adminPanel/pages/AdminPanelPage.vue";

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
    path: "/newCampaign",
    name: "newCampaign",
    component: AdminPanelPage,
    meta: { requiresAuth: true, requiredRole: "Admin" },
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
