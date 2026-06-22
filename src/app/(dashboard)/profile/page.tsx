"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { getInitials } from "@/lib/utils";
import { AuthUser } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Eye, EyeOff, Loader2, Pencil, X, Check,
  ShieldCheck, ShieldOff, User, Mail, Building2, Lock,
} from "lucide-react";

const PERMISSION_LABELS: Record<string, string> = {
  canManageUsers: "Manage Users",
  canManageTeams: "Manage Teams",
  canViewAllLeads: "View All Leads",
  canAssignLeads: "Assign Leads",
  canDeleteLeads: "Delete Leads",
  canExportLeads: "Export Leads",
  canViewReports: "View Reports",
  canViewAllReports: "View All Reports",
  canEditSettings: "Edit Settings",
  canManageContent: "Manage Content",
  canManageBlog: "Manage Blog",
  canViewSalesFeedback: "View Sales Feedback",
  canManageOtherFeedback: "Manage Feedback",
};

export default function ProfilePage() {
  const { user: storeUser, updateUser } = useAuthStore();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await authApi.getMe();
      return res.data.data as AuthUser;
    },
  });

  const user = profile ?? storeUser;

  // ── Edit name ──────────────────────────────────────────────────────
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");

  const updateProfileMutation = useMutation({
    mutationFn: (name: string) => authApi.updateProfile({ name }),
    onSuccess: (_, name) => {
      updateUser({ name });
      setEditingName(false);
      toast.success("Name updated");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update profile"),
  });

  const startEditName = () => {
    setNameValue(user?.name ?? "");
    setEditingName(true);
  };

  // ── Change password ────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});

  const changePasswordMutation = useMutation({
    mutationFn: () => authApi.changePassword(pwForm.current, pwForm.next),
    onSuccess: () => {
      toast.success("Password changed successfully");
      setPwForm({ current: "", next: "", confirm: "" });
      setPwErrors({});
    },
    onError: (err: Error) => toast.error(err.message || "Failed to change password"),
  });

  const validatePw = () => {
    const errs: Record<string, string> = {};
    if (!pwForm.current) errs.current = "Required";
    if (!pwForm.next) errs.next = "Required";
    else if (pwForm.next.length < 6) errs.next = "Min 6 characters";
    if (!pwForm.confirm) errs.confirm = "Required";
    else if (pwForm.next !== pwForm.confirm) errs.confirm = "Passwords do not match";
    if (pwForm.current && pwForm.next && pwForm.current === pwForm.next)
      errs.next = "Must differ from current password";
    setPwErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChangePassword = () => {
    if (validatePw()) changePasswordMutation.mutate();
  };

  const pwFields = [
    { key: "current" as const, label: "Current Password" },
    { key: "next" as const, label: "New Password" },
    { key: "confirm" as const, label: "Confirm New Password" },
  ];

  return (
    <div>
      <Header title="Profile" description="Manage your account details and security" />

      <div className="p-6 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Identity */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your personal details on SkillSnap Admin.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Avatar + name */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-950 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-white text-2xl font-bold">
                      {user ? getInitials(user.name) : "?"}
                    </span>
                  </div>
                  <div>
                    {isLoading
                      ? <Skeleton className="h-6 w-40 mb-1" />
                      : <p className="text-lg font-semibold">{user?.name}</p>}
                    {isLoading
                      ? <Skeleton className="h-4 w-28" />
                      : <Badge className="bg-blue-950 text-white capitalize mt-1">
                          {user?.role.replace(/-/g, " ")}
                        </Badge>}
                  </div>
                </div>

                <Separator />

                {/* Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  {/* Name */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <User className="h-3 w-3" /> Name
                    </Label>
                    {editingName ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={nameValue}
                          onChange={(e) => setNameValue(e.target.value)}
                          className="h-9"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") updateProfileMutation.mutate(nameValue);
                            if (e.key === "Escape") setEditingName(false);
                          }}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 shrink-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => updateProfileMutation.mutate(nameValue)}
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Check className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 shrink-0"
                          onClick={() => setEditingName(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 h-9">
                        {isLoading
                          ? <Skeleton className="h-5 w-36" />
                          : <span className="text-sm">{user?.name}</span>}
                        <button
                          onClick={startEditName}
                          className="text-muted-foreground hover:text-blue-950 transition-colors"
                          title="Edit name"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="h-3 w-3" /> Email
                    </Label>
                    <div className="flex items-center h-9">
                      {isLoading
                        ? <Skeleton className="h-5 w-48" />
                        : <span className="text-sm text-muted-foreground">{user?.email}</span>}
                    </div>
                  </div>

                  {/* Team */}
                  {user?.team && (
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="h-3 w-3" /> Team
                      </Label>
                      <div className="flex items-center h-9">
                        <span className="text-sm">{user.team.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Change password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Change Password
                </CardTitle>
                <CardDescription>
                  Choose a strong password of at least 6 characters.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pwFields.map(({ key, label }) => (
                  <div key={key} className="space-y-1.5">
                    <Label>{label}</Label>
                    <div className="relative">
                      <Input
                        type={showPw[key] ? "text" : "password"}
                        value={pwForm[key]}
                        onChange={(e) => {
                          setPwForm(prev => ({ ...prev, [key]: e.target.value }));
                          if (pwErrors[key]) setPwErrors(prev => ({ ...prev, [key]: "" }));
                        }}
                        placeholder="••••••••"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(prev => ({ ...prev, [key]: !prev[key] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showPw[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {pwErrors[key] && (
                      <p className="text-xs text-destructive">{pwErrors[key]}</p>
                    )}
                  </div>
                ))}

                <Button
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isPending}
                  className="w-full bg-blue-950 hover:bg-blue-900"
                >
                  {changePasswordMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Update Password
                </Button>
              </CardContent>
            </Card>

          </div>

          {/* ── Right column — Permissions ── */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Permissions
                </CardTitle>
                <CardDescription>Access rights for your role.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(8)].map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {Object.entries(user?.permissions ?? {}).map(([key, granted]) => (
                      <div
                        key={key}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium border ${
                          granted
                            ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400"
                            : "bg-muted border-border text-muted-foreground"
                        }`}
                      >
                        {granted
                          ? <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                          : <ShieldOff className="h-3.5 w-3.5 shrink-0" />}
                        <span>{PERMISSION_LABELS[key] ?? key}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
