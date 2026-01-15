"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { AssignLeadModal } from "@/components/leads/AssignLeadModal";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { leadsApi } from "@/lib/api";
import { Lead, LeadFilters as LeadFiltersType, LeadStatus } from "@/types";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { Download, RefreshCw, UserPlus } from "lucide-react";

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const { canAssignLeads, canExportLeads } = useAuthStore();

  // State
  const [filters, setFilters] = useState<LeadFiltersType>({
    page: 1,
    limit: 20,
  });
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Fetch leads
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["leads", filters],
    queryFn: async () => {
      const response = await leadsApi.getAll(filters);
      return response.data.data;
    },
  });

  const leads = data?.leads || [];
  const pagination = data?.pagination || { page: 1, total: 0, pages: 1, limit: 20 };

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: ({ leadId, status }: { leadId: string; status: LeadStatus }) =>
      leadsApi.updateStatus(leadId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Status updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Assign mutation
  const assignMutation = useMutation({
    mutationFn: ({ leadId, userId }: { leadId: string; userId: string }) =>
      leadsApi.assign(leadId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead assigned successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Bulk assign mutation
  const bulkAssignMutation = useMutation({
    mutationFn: async (userId: string) => {
      const promises = selectedLeads.map((leadId) =>
        leadsApi.assign(leadId, userId)
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setSelectedLeads([]);
      toast.success(`${selectedLeads.length} leads assigned`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Handlers
  const handleStatusChange = (leadId: string, status: LeadStatus) => {
    statusMutation.mutate({ leadId, status });
  };

  const handleAssign = async (leadId: string, userId: string) => {
    await assignMutation.mutateAsync({ leadId, userId });
  };

  const handleAssignClick = (lead: Lead) => {
    setSelectedLead(lead);
    setAssignModalOpen(true);
  };

  const handleSelectLead = (leadId: string, selected: boolean) => {
    if (selected) {
      setSelectedLeads([...selectedLeads, leadId]);
    } else {
      setSelectedLeads(selectedLeads.filter((id) => id !== leadId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedLeads(leads.map((lead: Lead) => lead.id || lead._id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleExport = async () => {
    try {
      const response = await leadsApi.export(filters);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `leads_export_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Leads exported");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  const handleAutoAssign = async () => {
    try {
      const response = await leadsApi.autoAssign();
      const { assigned, message } = response.data.data;
      toast.success(message || `${assigned} leads auto-assigned`);
      refetch();
    } catch (error) {
      toast.error("Auto-assign failed");
    }
  };

  return (
    <div>
      <Header title="Leads" description="Manage and track your leads" />

      <div className="p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {canAssignLeads() && (
              <Button
                onClick={handleAutoAssign}
                className="bg-blue-950 hover:bg-blue-900"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Auto-Assign
              </Button>
            )}
            {canExportLeads() && (
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedLeads.length > 0 && canAssignLeads() && (
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-sm text-blue-700">
                {selectedLeads.length} selected
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedLead(null);
                  setAssignModalOpen(true);
                }}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Assign Selected
              </Button>
            </div>
          )}
        </div>

        {/* Filters */}
        <LeadFilters filters={filters} onFiltersChange={setFilters} />

        {/* Table */}
        <LeadsTable
          leads={leads}
          isLoading={isLoading}
          selectedLeads={selectedLeads}
          onSelectLead={handleSelectLead}
          onSelectAll={handleSelectAll}
          onStatusChange={handleStatusChange}
          onAssignClick={handleAssignClick}
        />

        {/* Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={(page) => setFilters({ ...filters, page })}
        />
      </div>

      {/* Assign Modal */}
      <AssignLeadModal
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        lead={selectedLead}
        onAssign={handleAssign}
      />
    </div>
  );
}