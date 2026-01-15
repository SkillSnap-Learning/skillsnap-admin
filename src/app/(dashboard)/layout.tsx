"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Listen for sidebar collapse state (optional enhancement)
  useEffect(() => {
    const checkWidth = () => {
      // You can add logic here to detect sidebar state if needed
    };
    checkWidth();
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <main
          className={cn(
            "transition-all duration-300 min-h-screen",
            "lg:ml-64" // Default sidebar width
          )}
        >
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}