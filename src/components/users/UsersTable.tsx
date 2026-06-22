"use client";

import { User } from "@/types";
import { formatDate, getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, KeyRound } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onResetPassword: (user: User) => void;
}

const roleColors: Record<string, string> = {
  superadmin: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  admin: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  "sales-manager": "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  "team-lead": "bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
  sales: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  support: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
  instructor: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  student: "bg-muted text-muted-foreground",
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  inactive: "bg-muted text-muted-foreground",
  suspended: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

export function UsersTable({
  users,
  isLoading,
  onEdit,
  onDelete,
  onResetPassword,
}: UsersTableProps) {
  const { hasRole } = useAuthStore();
  const isSuperAdmin = hasRole("superadmin");

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border">
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 flex-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-card rounded-xl border p-12 text-center">
        <p className="text-muted-foreground">No users found</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                User
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">
                Email
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Role
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                Team
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                Status
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                Created
              </th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user, index) => (
              <tr
                key={user._id || user.id || index}
                className="hover:bg-muted/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-950 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-white">
                        {getInitials(user.name)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground/60 sm:hidden">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant="secondary"
                    className={`capitalize ${roleColors[user.role] || ""}`}
                  >
                    {user.role.replace("-", " ")}
                  </Badge>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {typeof user.team === "object" && user.team ? (
                    <span className="text-sm text-muted-foreground">
                      {user.team.name}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground/60">-</span>
                  )}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <Badge
                    variant="secondary"
                    className={`capitalize ${statusColors[user.status] || ""}`}
                  >
                    {user.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user.role !== "superadmin" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(user)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onResetPassword(user)}>
                          <KeyRound className="h-4 w-4 mr-2" />
                          Reset Password
                        </DropdownMenuItem>
                        {isSuperAdmin && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDelete(user)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}