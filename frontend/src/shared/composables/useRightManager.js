import { authService } from "@/shared/services/domain/authService";

export function useRightManager() {
  // Sleutels gelijk aan de backend-rolstrings (JWT): Player < DM < Admin.
  const hierarchy = {
    Player: 1,
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
