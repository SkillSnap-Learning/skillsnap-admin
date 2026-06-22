"use client";

import { Plan } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, BookOpen, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface PlansTableProps {
  plans: Plan[];
  isLoading: boolean;
  onEdit: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
}

export function PlansTable({ plans, isLoading, onEdit, onDelete }: PlansTableProps) {
  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border">
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-10 flex-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="bg-card rounded-xl border p-12 text-center">
        <p className="text-muted-foreground">No plans found</p>
        <p className="text-sm text-muted-foreground/60 mt-1">Create your first plan to get started</p>
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
                Plan
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">
                Type
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                Price
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Status
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                Created
              </th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {plans.map((plan) => (
              <tr key={plan._id} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      plan.isGuestPlan
                        ? "bg-orange-500/10"
                        : "bg-blue-500/10"
                    }`}>
                      <BookOpen className={`h-4 w-4 ${plan.isGuestPlan ? "text-orange-500" : "text-blue-500"}`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{plan.name}</p>
                      <button
                        onClick={() => navigator.clipboard.writeText(plan.slug)}
                        className="mt-0.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 transition-colors cursor-pointer max-w-fit"
                        title="Copy slug"
                      >
                        <span className="text-xs text-muted-foreground font-mono">{plan.slug}</span>
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  {plan.isGuestPlan ? (
                    <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">Guest</Badge>
                  ) : (
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">Paid</Badge>
                  )}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {plan.isGuestPlan ? (
                    <span className="text-sm text-muted-foreground/60">Free</span>
                  ) : (
                    <span className="text-sm font-medium text-foreground">
                      ₹{plan.price.amount.toLocaleString()}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    className={
                      plan.isActive
                        ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {plan.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {plan.createdAt
                      ? formatDistanceToNow(new Date(plan.createdAt), { addSuffix: true })
                      : "—"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/plans/${plan._id}/subjects`}>
                      <Button variant="ghost" size="sm" title="View Subjects" className="h-8 w-8 p-0">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(plan)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(plan)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
