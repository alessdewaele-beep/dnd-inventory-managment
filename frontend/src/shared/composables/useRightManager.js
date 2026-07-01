import { authService } from "@/shared/services/domain/authService";

export function useRightManager() {
  const hierarchy = {
    Speler: 1,
    DM: 2,
    Admin: 3,
  };

  function hasRight(requiredRole) {
    const role = authService.getRole();
    if (!role) return false;

    return hierarchy[role] >= hierarchy[requiredRole];
  }

  return { hasRight };
}
