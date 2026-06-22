"use client";

import { useState } from "react";
import { Lead } from "@/types";
import { formatRelativeTime, formatPhone } from "@/lib/utils";
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Copy, Check } from "lucide-react";
import Link from "next/link";

interface RecentLeadsTableProps {
  leads: Lead[];
  isLoading: boolean;
}

function PhoneCell({ phone }: { phone: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-1 mt-0.5 group/phone">
      <span className="text-xs text-muted-foreground">{formatPhone(phone)}</span>
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

export function RecentLeadsTable({ leads, isLoading }: RecentLeadsTableProps) {
  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border">
        <div className="p-4 border-b flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Recent Leads</h2>
        <Link href="/leads">
          <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {leads.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          No leads found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Name
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                  Assigned To
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leads.map((lead, index) => (
                <tr key={lead.id || lead._id || index} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/leads/${lead.id || lead._id}`}
                      className="font-medium text-foreground hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {lead.name}
                    </Link>
                    <PhoneCell phone={lead.phone} />
                  </td>
                  <td className="px-4 py-3">
                    <LeadStatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                    {lead.assignedTo?.name || (
                      <span className="text-muted-foreground/50">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatRelativeTime(lead.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
