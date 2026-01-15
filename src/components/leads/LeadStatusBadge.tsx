"use client";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadStatus } from "@/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  new: {
    label: "New",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  },
  contacted: {
    label: "Contacted",
    className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
  },
  converted: {
    label: "Converted",
    className: "bg-green-100 text-green-700 hover:bg-green-200",
  },
  lost: {
    label: "Lost",
    className: "bg-red-100 text-red-700 hover:bg-red-200",
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
  const config = statusConfig[status] || statusConfig.new;

  if (!editable) {
    return (
      <Badge variant="secondary" className={cn("font-medium", config.className)}>
        {config.label}
      </Badge>
    );
  }

  return (
    <Select
      value={status}
      onValueChange={(value) => onStatusChange?.(value as LeadStatus)}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          "h-7 w-[110px] border-0 text-xs font-medium",
          config.className
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(statusConfig).map(([value, { label, className }]) => (
          <SelectItem key={value} value={value}>
            <span className={cn("px-2 py-0.5 rounded text-xs", className)}>
              {label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}