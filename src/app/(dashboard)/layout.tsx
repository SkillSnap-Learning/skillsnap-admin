"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed} />
        <main
          className={cn(
            "transition-all duration-300 min-h-screen",
            collapsed ? "lg:ml-16" : "lg:ml-64"
          )}
        >
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
