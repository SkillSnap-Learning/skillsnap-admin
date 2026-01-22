"use client";

import { useAuthStore } from "@/stores/authStore";
import { getInitials } from "@/lib/utils";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import { ChangePasswordModal } from "@/components/profile/ChangePasswordModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, User, KeyRound } from "lucide-react";

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return authApi.changePassword(data.currentPassword, data.newPassword);
    },
    onSuccess: () => {
      toast.success("Password changed successfully");
      setChangePasswordOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to change password");
    },
  });

  const handleChangePassword = async (data: { currentPassword: string; newPassword: string }) => {
    await changePasswordMutation.mutateAsync(data);
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">
      <div>
        <h1 className="text-xl font-semibold text-blue-950">{title}</h1>
        {description && (
          <p className="text-sm text-slate-500">{description}</p>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 hover:bg-slate-100"
          >
            <div className="w-8 h-8 bg-blue-950 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user ? getInitials(user.name) : "?"}
              </span>
            </div>
            <span className="hidden sm:inline text-sm font-medium">
              {user?.name}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setChangePasswordOpen(true)}
            className="cursor-pointer"
          >
            <KeyRound className="mr-2 h-4 w-4" />
            Change Password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangePasswordModal
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
        onSubmit={handleChangePassword}
        isSubmitting={changePasswordMutation.isPending}
      />
    </header>
  );
}