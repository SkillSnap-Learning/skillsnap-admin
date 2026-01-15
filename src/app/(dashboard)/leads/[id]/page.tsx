"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { LeadInfoCard } from "@/components/leads/LeadInfoCard";
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge";
import { NotesTimeline } from "@/components/leads/NotesTimeline";
import { AssignmentHistory } from "@/components/leads/AssignmentHistory";
import { AssignLeadModal } from "@/components/leads/AssignLeadModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { leadsApi, usersApi } from "@/lib/api";
import { Lead, LeadStatus } from "@/types";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useState } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function LeadDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { canAssignLeads } = useAuthStore();

  const [assignModalOpen, setAssignModalOpen] = useState(false);

  // Fetch lead details
  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      const response = await leadsApi.getById(id);
      return response.data.data as Lead;
    },
  });

  // Fetch sales users for quick assign
  const { data: salesUsers } = useQuery({
    queryKey: ["salesUsers"],
    queryFn: async () => {
      const response = await usersApi.getSalesUsers();
      return response.data.data;
    },
    enabled: canAssignLeads(),
  });

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: (status: LeadStatus) => leadsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", id] });
      toast.success("Status updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Add note mutation
  const noteMutation = useMutation({
    mutationFn: (content: string) => leadsApi.addNote(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", id] });
      toast.success("Note added");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Assign mutation
  const assignMutation = useMutation({
    mutationFn: (userId: string) => leadsApi.assign(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", id] });
      toast.success("Lead assigned");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleStatusChange = (status: LeadStatus) => {
    statusMutation.mutate(status);
  };

  const handleAddNote = async (content: string) => {
    await noteMutation.mutateAsync(content);
  };

  const handleAssign = async (leadId: string, userId: string) => {
    await assignMutation.mutateAsync(userId);
  };

  const handleQuickAssign = (userId: string) => {
    if (userId) {
      assignMutation.mutate(userId);
    }
  };

  if (isLoading) {
    return (
      <div>
        <Header title="Lead Details" />
        <div className="p-6 space-y-6">
          <Skeleton className="h-10 w-32" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64 lg:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div>
        <Header title="Lead Not Found" />
        <div className="p-6">
          <p className="text-slate-500">The requested lead could not be found.</p>
          <Button onClick={() => router.push("/leads")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title={lead.name} description="Lead Details" />

      <div className="p-6 space-y-6">
        {/* Back button and actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button variant="ghost" onClick={() => router.push("/leads")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Status:</span>
              <LeadStatusBadge
                status={lead.status}
                editable={true}
                onStatusChange={handleStatusChange}
                disabled={statusMutation.isPending}
              />
            </div>

            {/* Quick Assign */}
            {canAssignLeads() && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Assigned:</span>
                <Select
                  value={lead.assignedTo?._id || "unassigned"}
                  onValueChange={(value) => {
                    if (value !== "unassigned") {
                      handleQuickAssign(value);
                    }
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select user..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned" disabled>
                      Unassigned
                    </SelectItem>
                    {salesUsers?.map((user: any) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Lead Info */}
          <div className="space-y-6">
            <LeadInfoCard lead={lead} />
            <AssignmentHistory history={lead.assignmentHistory || []} />
          </div>

          {/* Right Column - Notes */}
          <div className="lg:col-span-2">
            <NotesTimeline
              notes={lead.notes || []}
              onAddNote={handleAddNote}
              isAdding={noteMutation.isPending}
            />
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      <AssignLeadModal
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        lead={lead}
        onAssign={handleAssign}
      />
    </div>
  );
}