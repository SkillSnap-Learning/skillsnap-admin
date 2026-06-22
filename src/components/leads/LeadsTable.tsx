"use client";

import { useState } from "react";
import Link from "next/link";
import { Lead, LeadStatus } from "@/types";
import { formatRelativeTime, formatPhone } from "@/lib/utils";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, UserPlus, Copy, Check } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

interface LeadsTableProps {
  leads: Lead[];
  isLoading: boolean;
  selectedLeads: string[];
  onSelectLead: (leadId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  onAssignClick: (lead: Lead) => void;
}

function PhoneCell({ phone }: { phone: string }) {
  const [copied, setCopied] = useState(false);
  const formatted = formatPhone(phone);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-1 mt-0.5 group/phone">
      <span className="text-xs text-muted-foreground">{formatted}</span>
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover/phone:opacity-100 transition-opacity cursor-pointer"
        title="Copy phone"
      >
        {copied
          ? <Check className="h-3 w-3 text-green-500" />
          : <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />}
      </button>
    </div>
  );
}

export function LeadsTable({
  leads,
  isLoading,
  selectedLeads,
  onSelectLead,
  onSelectAll,
  onStatusChange,
  onAssignClick,
}: LeadsTableProps) {
  const { canAssignLeads } = useAuthStore();
  const allSelected = leads.length > 0 && selectedLeads.length === leads.length;
  const someSelected = selectedLeads.length > 0 && selectedLeads.length < leads.length;

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border">
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-10 flex-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="bg-card rounded-xl border p-12 text-center">
        <p className="text-muted-foreground">No leads found</p>
        <p className="text-sm text-muted-foreground/60 mt-1">
          Try adjusting your filters
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="w-12 px-4 py-3">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={onSelectAll}
                />
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Name
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                Source
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                Board
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Status
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                Assigned To
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                Created
              </th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {leads.map((lead, index) => (
              <tr
                key={lead.id || lead._id || index}
                className={`hover:bg-muted/50 transition-colors ${
                  selectedLeads.includes(lead.id || lead._id) ? "bg-blue-50 dark:bg-blue-950/20" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedLeads.includes(lead.id || lead._id)}
                    onCheckedChange={(checked) =>
                      onSelectLead(lead.id || lead._id, checked as boolean)
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/leads/${lead.id || lead._id}`}
                    className="font-medium text-foreground hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {lead.name}
                  </Link>
                  <PhoneCell phone={lead.phone} />
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-sm text-muted-foreground capitalize">
                    {lead.source?.replace("_", " ") || "-"}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {lead.board || "-"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <LeadStatusBadge
                    status={lead.status}
                    editable={true}
                    onStatusChange={(status) => onStatusChange(lead.id || lead._id, status)}
                  />
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {lead.assignedTo ? (
                    <span className="text-sm text-muted-foreground">
                      {lead.assignedTo.name}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground/50">Unassigned</span>
                  )}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {formatRelativeTime(lead.createdAt)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/leads/${lead.id || lead._id}`} className="cursor-pointer">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      {canAssignLeads() && (
                        <DropdownMenuItem onClick={() => onAssignClick(lead)} className="cursor-pointer">
                          <UserPlus className="h-4 w-4 mr-2" />
                          {lead.assignedTo ? "Reassign" : "Assign"}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
