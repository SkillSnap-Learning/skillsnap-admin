"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, token, setAuth, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Don't do anything until Zustand is hydrated
    if (!isHydrated) return;

    const checkAuth = async () => {
      // Get token directly from localStorage as backup
      const storedToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);

      // No token, redirect to login
      if (!storedToken) {
        setIsLoading(false);
        router.replace("/login");
        return;
      }

      // Verify token is still valid
      try {
        const response = await authApi.getMe();
        const user = response.data.data;
        setAuth(user, storedToken);
        setIsLoading(false);
      } catch {
        // Token invalid, logout and redirect
        logout();
        setIsLoading(false);
        router.replace("/login");
      }
    };

    checkAuth();
  }, [isHydrated, token, router, setAuth, logout]);

  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-950 mx-auto" />
          <p className="mt-2 text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}