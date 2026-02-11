import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthUser, UserPermissions, UserRole } from "@/types";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<AuthUser>) => void;

  // Permission helpers
  hasPermission: (permission: keyof UserPermissions) => boolean;
  hasRole: (...roles: UserRole[]) => boolean;
  canManageUsers: () => boolean;
  canManageTeams: () => boolean;
  canAssignLeads: () => boolean;
  canExportLeads: () => boolean;
  canViewReports: () => boolean;
  canDeleteLeads: () => boolean;
  canManageContent: () => boolean; // Add this
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user: AuthUser, token: string) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("token", token);
        }
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (userData: Partial<AuthUser>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...userData } });
        }
      },

      // Permission helpers
      hasPermission: (permission: keyof UserPermissions) => {
        const { user } = get();
        if (!user) return false;
        return user.permissions?.[permission] === true;
      },

      hasRole: (...roles: UserRole[]) => {
        const { user } = get();
        if (!user) return false;
        return roles.includes(user.role);
      },

      canManageUsers: () => {
        const { hasPermission, hasRole } = get();
        return hasPermission("canManageUsers") || hasRole("superadmin", "admin");
      },

      canManageTeams: () => {
        const { hasPermission, hasRole } = get();
        return hasPermission("canManageTeams") || hasRole("superadmin", "admin", "sales-manager");
      },

      canAssignLeads: () => {
        const { hasPermission, hasRole } = get();
        return hasPermission("canAssignLeads") || hasRole("superadmin", "admin", "sales-manager", "team-lead");
      },

      canExportLeads: () => {
        const { hasPermission, hasRole } = get();
        return hasPermission("canExportLeads") || hasRole("superadmin", "admin", "sales-manager", "team-lead");
      },

      canViewReports: () => {
        const { hasPermission, hasRole } = get();
        return hasPermission("canViewReports") || hasRole("superadmin", "admin", "sales-manager");
      },

      canDeleteLeads: () => {
        const { hasPermission, hasRole } = get();
        return hasPermission("canDeleteLeads") || hasRole("superadmin", "admin");
      },

      canManageContent: () => {
        const { user } = get();
        if (!user) return false;
        return ["superadmin", "admin", "instructor"].includes(user.role);
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);