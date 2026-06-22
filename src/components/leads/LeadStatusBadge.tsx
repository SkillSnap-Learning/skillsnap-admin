"use client";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LeadStatus } from "@/types";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";

const statusConfig: Record<
  LeadStatus,
  { label: string; dot: string; badge: string; item: string }
> = {
  new: {
    label: "New",
    dot: "bg-blue-500",
    badge:
      "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    item: "text-blue-700 dark:text-blue-400",
  },
  contacted: {
    label: "Contacted",
    dot: "bg-amber-500",
    badge:
      "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    item: "text-amber-700 dark:text-amber-400",
  },
  converted: {
    label: "Converted",
    dot: "bg-green-500",
    badge:
      "bg-green-50 text-green-700 border border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
    item: "text-green-700 dark:text-green-400",
  },
  lost: {
    label: "Lost",
    dot: "bg-red-500",
    badge:
      "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
    item: "text-red-700 dark:text-red-400",
  },
};

interface LeadStatusBadgeProps {
  status: LeadStatus;
  editable?: boolean;
  onStatusChange?: (status: LeadStatus) => void;
  disabled?: boolean;
}

export function LeadStatusBadge({
  status,
  editable = false,
  onStatusChange,
  disabled = false,
}: LeadStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.new;

  const trigger = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        config.badge
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dot)} />
      {config.label}
      {editable && !disabled && (
        <ChevronDown className="h-3 w-3 ml-0.5 opacity-60" />
      )}
    </span>
  );

  if (!editable || disabled) return trigger;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none cursor-pointer">{trigger}</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40 p-1">
        {(Object.entries(statusConfig) as [LeadStatus, typeof config][]).map(
          ([value, cfg]) => (
            <DropdownMenuItem
              key={value}
              onClick={() => onStatusChange?.(value)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer"
            >
              <span className={cn("w-2 h-2 rounded-full shrink-0", cfg.dot)} />
              <span className={cn("text-xs font-medium flex-1", cfg.item)}>
                {cfg.label}
              </span>
              {value === status && (
                <Check className="h-3.5 w-3.5 text-foreground/50" />
              )}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
