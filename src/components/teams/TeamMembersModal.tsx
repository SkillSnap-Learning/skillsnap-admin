"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { teamsApi, usersApi } from "@/lib/api";
import { Team, User } from "@/types";
import { toast } from "sonner";
import { Loader2, Plus, X, UserCircle } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface TeamMembersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: Team | null;
}

export function TeamMembersModal({
  open,
  onOpenChange,
  team,
}: TeamMembersModalProps) {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // Fetch team members
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["teamMembers", team?._id || team?.id],
    queryFn: async () => {
      const teamId = team?._id || team?.id;
      if (!teamId) return [];
      const response = await teamsApi.getById(teamId);
      return response.data.data.members || [];
    },
    enabled: open && !!team,
  });

  // Fetch available users (not in any team or in this team)
  const { data: availableUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["availableUsersForTeam"],
    queryFn: async () => {
      const response = await usersApi.getAll({
        status: "active",
        limit: 100,
      });
      // Filter users who are not in a team or can be added
      return response.data.data.users.filter(
        (user: User) => 
          !user.team || 
          (typeof user.team === "object" && user.team?._id === (team?._id || team?.id))
      );
    },
    enabled: open && !!team,
  });

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: (userId: string) => {
      const teamId = team?._id || team?.id;
      if (!teamId) throw new Error("Team ID not found");
      return teamsApi.addMember(teamId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamMembers", team?._id || team?.id] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setSelectedUserId("");
      toast.success("Member added to team");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => {
      const teamId = team?._id || team?.id;
      if (!teamId) throw new Error("Team ID not found");
      return teamsApi.removeMember(teamId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamMembers", team?._id || team?.id] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Member removed from team");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleAddMember = () => {
    if (selectedUserId) {
      addMemberMutation.mutate(selectedUserId);
    }
  };

  const handleRemoveMember = (userId: string) => {
    removeMemberMutation.mutate(userId);
  };

  // Filter out users already in the team
  const memberIds = members?.map((m: User) => m._id || m.id) || [];
  const filteredAvailableUsers = availableUsers?.filter(
    (user: User) => !memberIds.includes(user._id) && !memberIds.includes(user.id)
  ) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Team Members</DialogTitle>
          <DialogDescription>
            Add or remove members from {team?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Add Member Section */}
          <div className="flex gap-2">
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              disabled={usersLoading || addMemberMutation.isPending}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select user to add..." />
              </SelectTrigger>
              <SelectContent>
                {filteredAvailableUsers?.map((user: User) => (
                  <SelectItem key={user._id || user.id} value={user._id || user.id}>
                    <div className="flex items-center gap-2">
                      <span>{user.name}</span>
                      <span className="text-xs text-slate-400 capitalize">
                        ({user.role.replace("-", " ")})
                      </span>
                    </div>
                  </SelectItem>
                ))}
                {filteredAvailableUsers?.length === 0 && (
                  <SelectItem value="none" disabled>
                    No available users
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <Button
              onClick={handleAddMember}
              disabled={!selectedUserId || addMemberMutation.isPending}
              className="bg-blue-950 hover:bg-blue-900"
            >
              {addMemberMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Members List */}
          <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
            {membersLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
              </div>
            ) : members?.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <UserCircle className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p>No members in this team</p>
              </div>
            ) : (
              members?.map((member: User) => (
                <div
                  key={member._id || member.id}
                  className="flex items-center justify-between p-3 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-950 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {getInitials(member.name)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-slate-400 capitalize">
                        {member.role.replace("-", " ")}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleRemoveMember(member._id || member.id)}
                    disabled={removeMemberMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <p className="text-xs text-slate-400 text-center">
            {members?.length || 0} member{members?.length !== 1 ? "s" : ""} in this team
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}