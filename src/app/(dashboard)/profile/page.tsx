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

  // fetch fresh profile
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

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div>
      <Header title="Profile" description="Manage your account details and security" />

      <div className="p-6 max-w-3xl space-y-6">

        {/* Identity card */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 bg-blue-950 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-white text-2xl font-bold">
                {user ? getInitials(user.name) : "?"}
              </span>
            </div>

            <div className="flex-1 space-y-4">
              {/* Name row */}
              <div className="space-y-1">
                <Label className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-3 w-3" /> Name
                </Label>
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      className="h-9 max-w-xs"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") updateProfileMutation.mutate(nameValue);
                        if (e.key === "Escape") setEditingName(false);
                      }}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 text-green-600 hover:text-green-700 hover:bg-green-50"
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
                      className="h-9 w-9 text-slate-400 hover:text-slate-600"
                      onClick={() => setEditingName(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {isLoading
                      ? <div className="h-6 w-40 bg-slate-100 rounded animate-pulse" />
                      : <p className="text-base font-semibold text-slate-900">{user?.name}</p>}
                    <button
                      onClick={startEditName}
                      className="text-slate-400 hover:text-blue-950 transition-colors"
                      title="Edit name"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <Label className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="h-3 w-3" /> Email
                </Label>
                {isLoading
                  ? <div className="h-5 w-56 bg-slate-100 rounded animate-pulse" />
                  : <p className="text-sm text-slate-700">{user?.email}</p>}
              </div>

              {/* Role + Team */}
              <div className="flex flex-wrap gap-6">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="h-3 w-3" /> Role
                  </Label>
                  {isLoading
                    ? <div className="h-5 w-24 bg-slate-100 rounded animate-pulse" />
                    : <Badge className="bg-blue-950 text-white capitalize">
                        {user?.role.replace(/-/g, " ")}
                      </Badge>}
                </div>

                {user?.team && (
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="h-3 w-3" /> Team
                    </Label>
                    <p className="text-sm text-slate-700">{user.team.name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-sm font-semibold text-blue-950 mb-4">Permissions</h2>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(user?.permissions ?? {}).map(([key, granted]) => (
                <div
                  key={key}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border ${
                    granted
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}
                >
                  {granted
                    ? <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                    : <ShieldOff className="h-3.5 w-3.5 shrink-0" />}
                  {PERMISSION_LABELS[key] ?? key}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Change password */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-sm font-semibold text-blue-950 mb-1 flex items-center gap-2">
            <Lock className="h-4 w-4" /> Change Password
          </h2>
          <p className="text-xs text-slate-400 mb-5">
            Choose a strong password of at least 6 characters.
          </p>

          <div className="space-y-4 max-w-sm">
            {(["current", "next", "confirm"] as const).map((field) => {
              const labels = { current: "Current Password", next: "New Password", confirm: "Confirm New Password" };
              return (
                <div key={field} className="space-y-1.5">
                  <Label className="text-sm">{labels[field]}</Label>
                  <div className="relative">
                    <Input
                      type={showPw[field] ? "text" : "password"}
                      value={pwForm[field]}
                      onChange={(e) => {
                        setPwForm(prev => ({ ...prev, [field]: e.target.value }));
                        if (pwErrors[field]) setPwErrors(prev => ({ ...prev, [field]: "" }));
                      }}
                      placeholder="••••••••"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(prev => ({ ...prev, [field]: !prev[field] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      tabIndex={-1}
                    >
                      {showPw[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {pwErrors[field] && (
                    <p className="text-xs text-red-500">{pwErrors[field]}</p>
                  )}
                </div>
              );
            })}

            <Button
              onClick={handleChangePassword}
              disabled={changePasswordMutation.isPending}
              className="bg-blue-950 hover:bg-blue-900 w-full"
            >
              {changePasswordMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Update Password
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
