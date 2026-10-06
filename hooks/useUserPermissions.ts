import { useAuthUser } from "@/context/ctx";

const ADMIN_ROLES = ["admin", "owner", "super_admin", "business_owner"];

function normalizeRole(role: string | null | undefined): string {
  return (role ?? "").toLowerCase().replace(/-/g, "_");
}

/**
 * Generic role gate. Extend ADMIN_ROLES / add your own capability flags
 * per project. The user has a single top-level `role` (string|null).
 */
export function useUserPermissions() {
  const { user } = useAuthUser();

  const role: string | null = (user as any)?.role ?? null;
  const normalized = normalizeRole(role);

  const isAdmin = ADMIN_ROLES.includes(normalized);

  return {
    isAdmin,
    role,
  };
}
