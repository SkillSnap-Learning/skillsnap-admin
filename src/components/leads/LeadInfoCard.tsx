"use client";

import { Lead } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatPhone } from "@/lib/utils";
import { Mail, Phone, Calendar, Globe, Building2 } from "lucide-react";

interface LeadInfoCardProps {
  lead: Lead;
}

export function LeadInfoCard({ lead }: LeadInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Phone className="h-4 w-4 text-slate-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Phone</p>
            <p className="font-medium">{formatPhone(lead.phone)}</p>
          </div>
        </div>

        {lead.email && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Mail className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="font-medium">{lead.email}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Globe className="h-4 w-4 text-slate-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Source</p>
            <p className="font-medium capitalize">
              {lead.source?.replace("_", " ") || "Unknown"}
            </p>
          </div>
        </div>

        {lead.board && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Building2 className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Board</p>
              <p className="font-medium">
                {lead.board === 'State Board' && lead.stateBoardName
                  ? `State Board (${lead.stateBoardName})`
                  : lead.board}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Calendar className="h-4 w-4 text-slate-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Created</p>
            <p className="font-medium">{formatDate(lead.createdAt)}</p>
          </div>
        </div>

        {lead.team && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Building2 className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Team</p>
              <p className="font-medium">{lead.team.name}</p>
            </div>
          </div>
        )}

        {lead.message && (
          <div className="pt-4 border-t">
            <p className="text-xs text-slate-500 mb-2">Message</p>
            <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
              {lead.message}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}