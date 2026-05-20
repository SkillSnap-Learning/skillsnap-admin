"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import {
  LayoutDashboard, Users, UserCircle, Building2,
  LogOut, ChevronLeft, Menu, BookOpen, FileText,
  HelpCircle, Newspaper, MessageSquare, Tag, Library,
  Calculator, Bell, GraduationCap, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// ── Nav definitions ───────────────────────────────────────────────────

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
  permission?: string;
};

const LEARNING_NAV: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["superadmin", "admin", "sales-manager", "team-lead", "sales"],
  },
  {
    name: "Leads",
    href: "/leads",
    icon: Users,
    roles: ["superadmin", "admin", "sales-manager", "team-lead", "sales"],
  },
  {
    name: "Feedback",
    href: "/feedback",
    icon: MessageSquare,
    roles: ["sales", "sales-manager", "admin", "superadmin"],
  },
  {
    name: "Users",
    href: "/users",
    icon: UserCircle,
    roles: ["superadmin", "admin", "sales-manager"],
  },
  {
    name: "Teams",
    href: "/teams",
    icon: Building2,
    roles: ["superadmin", "admin", "sales-manager"],
  },
  {
    name: "Plans",
    href: "/plans",
    icon: BookOpen,
    roles: ["superadmin", "admin", "instructor"],
    permission: "canManageContent",
  },
  {
    name: "Courses",
    href: "/courses",
    icon: GraduationCap,
    roles: ["superadmin", "admin"],
    permission: "canManageContent",
  },
  {
    name: "Blog Categories",
    href: "/categories",
    icon: Tag,
    roles: ["superadmin", "admin", "content-writer"],
    permission: "canManageBlog",
  },
  {
    name: "Blogs",
    href: "/blogs",
    icon: Newspaper,
    roles: ["superadmin", "admin", "content-writer"],
    permission: "canManageBlog",
  },
  {
    name: "Resource Pages",
    href: "/resource-pages",
    icon: FileText,
    roles: ["superadmin", "admin", "content-writer"],
    permission: "canManageBlog",
  },
  {
    name: "QnA Subjects",
    href: "/qa-subjects",
    icon: Library,
    roles: ["superadmin", "admin", "content-writer"],
    permission: "canManageContent",
  },
  {
    name: "QnA Chapters",
    href: "/qa-chapters",
    icon: Layers,
    roles: ["superadmin", "admin", "content-writer"],
    permission: "canManageContent",
  },
  {
    name: "Questions",
    href: "/questions",
    icon: HelpCircle,
    roles: ["superadmin", "admin", "content-writer"],
    permission: "canManageContent",
  },
  {
    name: "Notification Templates",
    href: "/notification-templates",
    icon: Bell,
    roles: ["superadmin", "admin"],
    permission: "canManageContent",
  },
];

const FINANCE_NAV: NavItem[] = [
  {
    name: "Calculators",
    href: "/calculators",
    icon: Calculator,
    roles: ["superadmin", "admin", "content-writer"],
    permission: "canManageBlog",
  },
  // Future: Finance Blogs, Finance Articles etc.
];

// ── Product type ──────────────────────────────────────────────────────
type Product = "learning" | "finance";

// ── Main Sidebar ──────────────────────────────────────────────────────
export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, hasRole } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Detect active product from pathname
  const FINANCE_PATHS = ["/calculators"];
  const isFinancePath = FINANCE_PATHS.some(p => pathname.startsWith(p));
  const [product, setProduct] = useState<Product>(isFinancePath ? "finance" : "learning");

  // Filter nav items by role/permission
  function filterNav(nav: NavItem[]) {
    return nav.filter(item => {
      const hasRequiredRole = item.roles.some(role => hasRole(role as any));
      if (!hasRequiredRole) return false;
      if (item.permission === "canManageBlog") return useAuthStore.getState().canManageBlog();
      if (item.permission === "canManageContent") return useAuthStore.getState().canManageContent();
      return true;
    });
  }

  const activeNav = filterNav(product === "learning" ? LEARNING_NAV : FINANCE_NAV);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* Logo + collapse */}
      <div className="h-16 flex items-center justify-between px-4 border-b flex-shrink-0">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-950 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-semibold text-blue-950">SkillSnap</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex"
        >
          <ChevronLeft className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      {/* Product switcher */}
      {!collapsed && (
        <div className="px-3 pt-4 pb-2 flex-shrink-0">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-1 mb-2">
            Product
          </p>
          <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-slate-50 p-0.5 gap-0.5">
            <button
              onClick={() => setProduct("learning")}
              className={cn(
                "flex-1 text-xs font-semibold py-1.5 px-2 rounded-md transition-all",
                product === "learning"
                  ? "bg-blue-950 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white"
              )}
            >
              Learning
            </button>
            <button
              onClick={() => setProduct("finance")}
              className={cn(
                "flex-1 text-xs font-semibold py-1.5 px-2 rounded-md transition-all",
                product === "finance"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white"
              )}
            >
              Finance
            </button>
          </div>
        </div>
      )}

      {/* Collapsed product indicator */}
      {collapsed && (
        <div className="px-2 pt-3 pb-1 flex flex-col gap-1 flex-shrink-0">
          <button
            onClick={() => setProduct("learning")}
            title="SkillSnap Learning"
            className={cn(
              "w-full flex items-center justify-center py-1.5 rounded-md text-xs font-bold transition-all",
              product === "learning"
                ? "bg-blue-950 text-white"
                : "text-slate-400 hover:bg-slate-100"
            )}
          >
            L
          </button>
          <button
            onClick={() => setProduct("finance")}
            title="SkillSnap Finance"
            className={cn(
              "w-full flex items-center justify-center py-1.5 rounded-md text-xs font-bold transition-all",
              product === "finance"
                ? "bg-emerald-600 text-white"
                : "text-slate-400 hover:bg-slate-100"
            )}
          >
            F
          </button>
        </div>
      )}

      {/* Section label */}
      {!collapsed && (
        <div className="px-4 pb-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            {product === "learning" ? "SkillSnap Learning" : "SkillSnap Finance"}
          </p>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {activeNav.length === 0 ? (
          !collapsed && (
            <p className="text-xs text-slate-400 px-3 py-4 text-center">
              No items available
            </p>
          )
        ) : activeNav.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? product === "finance"
                    ? "bg-emerald-600 text-white"
                    : "bg-blue-950 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-blue-950"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="border-t p-3 flex-shrink-0">
        {!collapsed && user && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user.role.replace("-", " ")}</p>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>

    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform lg:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className={cn(
        "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 bg-white border-r transition-all duration-300",
        collapsed ? "lg:w-16" : "lg:w-64"
      )}>
        <SidebarContent />
      </aside>
    </>
  );
}