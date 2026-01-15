"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { TeamsTable } from "@/components/teams/TeamsTable";
import { TeamModal, TeamFormData } from "@/components/teams/TeamModal";
import { TeamMembersModal } from "@/components/teams/TeamMembersModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { teamsApi } from "@/lib/api";
import { Team } from "@/types";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";

export default function TeamsPage() {
  const queryClient = useQueryClient();

  // Filters state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  // Modal states
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // Build query params
  const queryParams: Record<string, any> = {
    page,
    limit: 20,
  };
  if (search) queryParams.search = search;
  if (statusFilter && statusFilter !== "all") queryParams.status = statusFilter;

  // Fetch teams
  const { data, isLoading } = useQuery({
    queryKey: ["teams", queryParams],
    queryFn: async () => {
      const response = await teamsApi.getAll(queryParams);
      return response.data.data;
    },
  });

  const teams = data?.teams || [];
  const pagination = data?.pagination || { page: 1, total: 0, pages: 1, limit: 20 };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: TeamFormData) => teamsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setTeamModalOpen(false);
      toast.success("Team created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TeamFormData }) =>
      teamsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setTeamModalOpen(false);
      setSelectedTeam(null);
      toast.success("Team updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => teamsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setDeleteDialogOpen(false);
      setSelectedTeam(null);
      toast.success("Team deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Handlers
  const handleCreateTeam = () => {
    setSelectedTeam(null);
    setTeamModalOpen(true);
  };

  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team);
    setTeamModalOpen(true);
  };

  const handleDeleteTeam = (team: Team) => {
    setSelectedTeam(team);
    setDeleteDialogOpen(true);
  };

  const handleManageMembers = (team: Team) => {
    setSelectedTeam(team);
    setMembersModalOpen(true);
  };

  const handleSubmitTeam = async (data: TeamFormData) => {
    if (selectedTeam) {
      await updateMutation.mutateAsync({
        id: selectedTeam._id || selectedTeam.id || "",
        data,
      });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedTeam) {
      deleteMutation.mutate(selectedTeam._id || selectedTeam.id || "");
    }
  };

  return (
    <div>
      <Header title="Teams" description="Manage your teams" />

      <div className="p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search teams..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Create Button */}
          <Button
            onClick={handleCreateTeam}
            className="bg-blue-950 hover:bg-blue-900"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </Button>
        </div>

        {/* Teams Table */}
        <TeamsTable
          teams={teams}
          isLoading={isLoading}
          onEdit={handleEditTeam}
          onDelete={handleDeleteTeam}
          onManageMembers={handleManageMembers}
        />

        {/* Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={setPage}
        />
      </div>

      {/* Team Modal */}
      <TeamModal
        open={teamModalOpen}
        onOpenChange={setTeamModalOpen}
        team={selectedTeam}
        onSubmit={handleSubmitTeam}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Team Members Modal */}
      <TeamMembersModal
        open={membersModalOpen}
        onOpenChange={setMembersModalOpen}
        team={selectedTeam}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Team"
        description={`Are you sure you want to delete "${selectedTeam?.name}"? All members will be removed from this team.`}
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}