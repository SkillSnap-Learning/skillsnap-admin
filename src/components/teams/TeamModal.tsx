"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usersApi } from "@/lib/api";
import { Team, TeamStatus } from "@/types";
import { Loader2 } from "lucide-react";

interface TeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: Team | null;
  onSubmit: (data: TeamFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export interface TeamFormData {
  name: string;
  description: string;
  teamLead?: string;
  status: TeamStatus;
}

const statuses: { value: TeamStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export function TeamModal({
  open,
  onOpenChange,
  team,
  onSubmit,
  isSubmitting,
}: TeamModalProps) {
  const isEditing = !!team;

  const [formData, setFormData] = useState<TeamFormData>({
    name: "",
    description: "",
    teamLead: "",
    status: "active",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch users who can be team leads
  const { data: users } = useQuery({
    queryKey: ["usersForTeamLead"],
    queryFn: async () => {
      const response = await usersApi.getAll({ 
        role: "team-lead",
        status: "active",
        limit: 100 
      });
      return response.data.data.users;
    },
    enabled: open,
  });

  // Reset form when modal opens/closes or team changes
  useEffect(() => {
    if (open) {
      if (team) {
        setFormData({
          name: team.name,
          description: team.description || "",
          teamLead: typeof team.teamLead === "object" 
            ? team.teamLead?._id 
            : team.teamLead || "",
          status: team.status,
        });
      } else {
        setFormData({
          name: "",
          description: "",
          teamLead: "",
          status: "active",
        });
      }
      setErrors({});
    }
  }, [open, team]);

  const handleChange = (field: keyof TeamFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Team name is required";
    } else if (formData.name.length > 50) {
      newErrors.name = "Team name must be 50 characters or less";
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = "Description must be 200 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const submitData = { ...formData };
    if (!submitData.teamLead) {
      delete submitData.teamLead;
    }

    await onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Team" : "Create Team"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update team information below."
              : "Fill in the details to create a new team."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Team Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Sales Team A"
              maxLength={50}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Brief description of the team..."
              rows={3}
              maxLength={200}
            />
            <div className="flex justify-between">
              {errors.description && (
                <p className="text-xs text-red-500">{errors.description}</p>
              )}
              <p className="text-xs text-slate-400 ml-auto">
                {formData.description.length}/200
              </p>
            </div>
          </div>

          {/* Team Lead & Status Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Team Lead */}
            <div className="space-y-2">
              <Label>Team Lead</Label>
              <Select
                value={formData.teamLead || "none"}
                onValueChange={(value) =>
                  handleChange("teamLead", value === "none" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lead" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Lead</SelectItem>
                  {users?.map((user: any) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-950 hover:bg-blue-900"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? "Save Changes" : "Create Team"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}