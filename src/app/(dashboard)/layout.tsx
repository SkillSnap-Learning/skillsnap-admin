"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Mobile top bar */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-card border-b flex items-center px-3 gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="h-9 w-9 flex-shrink-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-950 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="font-semibold text-sm text-blue-950 dark:text-foreground">SkillSnap</span>
          </Link>
        </div>

        <Sidebar
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          mobileOpen={mobileOpen}
          onMobileOpenChange={setMobileOpen}
        />

        <main
          className={cn(
            "transition-all duration-300 min-h-screen pt-14 lg:pt-0",
            collapsed ? "lg:ml-16" : "lg:ml-64"
          )}
        >
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
