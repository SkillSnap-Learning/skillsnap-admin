"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { AuthUser } from "@/types";
import {
  LayoutDashboard, Users, UserCircle, Building2,
  LogOut, ChevronLeft, Menu, BookOpen, FileText,
  HelpCircle, Newspaper, MessageSquare, Tag, Library,
  Calculator, Bell, GraduationCap, Layers, TrendingUp,
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
  {
    name: "Finance Categories",
    href: "/finance-categories",
    icon: Tag,
    roles: ["superadmin", "admin", "content-writer"],
    permission: "canManageBlog",
  },
  {
    name: "Finance Blogs",
    href: "/finance-blogs",
    icon: Newspaper,
    roles: ["superadmin", "admin", "content-writer"],
    permission: "canManageBlog",
  },
];

type Product = "learning" | "finance";

// ── SidebarPanel ──────────────────────────────────────────────────────
// Extracted as a proper top-level component so React never remounts it
// when the parent Sidebar re-renders.

interface SidebarPanelProps {
  collapsed: boolean;
  onCollapsedChange: (v: boolean) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  product: Product;
  onProductChange: (p: Product) => void;
  activeNav: NavItem[];
  pathname: string;
  user: AuthUser | null;
  onLogout: () => void;
}

function SidebarPanel({
  collapsed,
  onCollapsedChange,
  mobileOpen,
  onMobileClose,
  product,
  onProductChange,
  activeNav,
  pathname,
  user,
  onLogout,
}: SidebarPanelProps) {
  return (
    <div className="flex flex-col h-full">

      {/* Logo + collapse */}
      <div className="h-16 flex items-center justify-between px-4 border-b flex-shrink-0">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-950 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-semibold text-blue-950 dark:text-foreground">SkillSnap</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onCollapsedChange(!collapsed)}
          className="hidden lg:flex"
        >
          <ChevronLeft className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      {/* Product switcher */}
      {!collapsed && (
        <div className="px-3 pt-4 pb-2 flex-shrink-0">
          <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest px-1 mb-2">
            Product
          </p>
          <div className="flex rounded-lg border overflow-hidden bg-muted p-0.5 gap-0.5">
            <button
              onClick={() => onProductChange("learning")}
              className={cn(
                "flex-1 text-xs font-semibold py-1.5 px-2 rounded-md transition-all",
                product === "learning"
                  ? "bg-blue-950 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background"
              )}
            >
              Learning
            </button>
            <button
              onClick={() => onProductChange("finance")}
              className={cn(
                "flex-1 text-xs font-semibold py-1.5 px-2 rounded-md transition-all",
                product === "finance"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background"
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
            onClick={() => onProductChange("learning")}
            title="SkillSnap Learning"
            className={cn(
              "w-full flex items-center justify-center py-1.5 rounded-md transition-all",
              product === "learning"
                ? "bg-blue-950 text-white"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <GraduationCap className="h-4 w-4" />
          </button>
          <button
            onClick={() => onProductChange("finance")}
            title="SkillSnap Finance"
            className={cn(
              "w-full flex items-center justify-center py-1.5 rounded-md transition-all",
              product === "finance"
                ? "bg-emerald-600 text-white"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <TrendingUp className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Section label */}
      {!collapsed && (
        <div className="px-4 pb-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            {product === "learning" ? "SkillSnap Learning" : "SkillSnap Finance"}
          </p>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {activeNav.length === 0 ? (
          !collapsed && (
            <p className="text-xs text-muted-foreground/60 px-3 py-4 text-center">
              No items available
            </p>
          )
        ) : activeNav.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center py-2.5 rounded-lg text-sm font-medium transition-colors",
                collapsed ? "justify-center px-0" : "gap-3 px-3",
                isActive
                  ? product === "finance"
                    ? "bg-emerald-600 text-white"
                    : "bg-blue-950 text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
            <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role?.replace("-", " ")}</p>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={onLogout}
          className={cn(
            "w-full justify-start text-muted-foreground hover:text-red-600 hover:bg-red-50",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>

    </div>
  );
}

// ── Main Sidebar ──────────────────────────────────────────────────────

interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange: (v: boolean) => void;
}

export function Sidebar({ collapsed, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout, hasRole } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const FINANCE_PATHS = ["/calculators", "/finance-categories", "/finance-blogs"];
  const isFinancePath = FINANCE_PATHS.some(p => pathname.startsWith(p));
  const [product, setProduct] = useState<Product>(isFinancePath ? "finance" : "learning");

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

  const panelProps: SidebarPanelProps = {
    collapsed,
    onCollapsedChange,
    mobileOpen,
    onMobileClose: () => setMobileOpen(false),
    product,
    onProductChange: setProduct,
    activeNav,
    pathname,
    user,
    onLogout: handleLogout,
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-[14px] left-3 z-40"
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
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform lg:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarPanel {...panelProps} />
      </aside>

      {/* Desktop sidebar */}
      <aside className={cn(
        "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 bg-card border-r transition-all duration-300",
        collapsed ? "lg:w-16" : "lg:w-64"
      )}>
        <SidebarPanel {...panelProps} />
      </aside>
    </>
  );
}
