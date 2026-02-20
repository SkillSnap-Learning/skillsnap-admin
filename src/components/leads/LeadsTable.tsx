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
import { MoreHorizontal, Eye, UserPlus, MessageSquare } from "lucide-react";
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
      <div className="bg-white rounded-xl border">
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
      <div className="bg-white rounded-xl border p-12 text-center">
        <p className="text-slate-500">No leads found</p>
        <p className="text-sm text-slate-400 mt-1">
          Try adjusting your filters
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="w-12 px-4 py-3">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={onSelectAll}
                />
              </th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">
                Name
              </th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">
                Contact
              </th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                Source
              </th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                Board
              </th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">
                Status
              </th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                Assigned To
              </th>
              <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                Created
              </th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead, index) => (
              <tr
                key={lead.id || lead._id || index}
                className={`hover:bg-slate-50 transition-colors ${
                  selectedLeads.includes(lead.id || lead._id) ? "bg-blue-50" : ""
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
                    className="font-medium text-blue-950 hover:text-blue-600"
                  >
                    {lead.name}
                  </Link>
                  <p className="text-xs text-slate-400 sm:hidden mt-0.5">
                    {lead.phone}
                  </p>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <p className="text-sm text-slate-600">{formatPhone(lead.phone)}</p>
                  {lead.email && (
                    <p className="text-xs text-slate-400 truncate max-w-[200px]">
                      {lead.email}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-sm text-slate-600 capitalize">
                    {lead.source?.replace("_", " ") || "-"}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-sm text-slate-600">
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
                    <span className="text-sm text-slate-600">
                      {lead.assignedTo.name}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">Unassigned</span>
                  )}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-sm text-slate-500">
                    {formatRelativeTime(lead.createdAt)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/leads/${lead.id || lead._id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      {canAssignLeads() && (
                        <DropdownMenuItem onClick={() => onAssignClick(lead)}>
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