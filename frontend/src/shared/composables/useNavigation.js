import { useRouter } from "vue-router";
import { useRightManager } from "@/shared/composables/useRightManager";
import { authService } from "@/shared/services/domain/authService";

export function useNavigation() {
  const router = useRouter();
  const { hasRight } = useRightManager();

  function goTo(path) {
    router.push(path);
  }

  function goHome() {
    router.push("/home");
  }

  function goLogin() {
    router.push("/");
  }

  function goBack() {
    router.back();
  }

  function goIfAllowed(path, requiredRole) {
    if (!authService.isLoggedIn()) {
      authService.logout();
      return router.push("/");
    }

    if (requiredRole && !hasRight(requiredRole)) {
      return router.push("/home");
    }

    router.push(path);
  }

  return {
    goTo,
    goHome,
    goLogin,
    goBack,
    goIfAllowed,
  };
}
