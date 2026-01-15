"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { usersApi } from "@/lib/api";
import { Lead } from "@/types";
import { Loader2 } from "lucide-react";

interface AssignLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  onAssign: (leadId: string, userId: string) => Promise<void>;
}

export function AssignLeadModal({
  open,
  onOpenChange,
  lead,
  onAssign,
}: AssignLeadModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch sales users
  const { data: salesUsers, isLoading } = useQuery({
    queryKey: ["salesUsers"],
    queryFn: async () => {
      const response = await usersApi.getSalesUsers();
      return response.data.data;
    },
    enabled: open,
  });

  const handleSubmit = async () => {
    if (!lead || !selectedUserId) return;

    setIsSubmitting(true);
    try {
      await onAssign(lead._id, selectedUserId);
      onOpenChange(false);
      setSelectedUserId("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {lead?.assignedTo ? "Reassign Lead" : "Assign Lead"}
          </DialogTitle>
          <DialogDescription>
            {lead?.assignedTo
              ? `Reassign "${lead?.name}" to a different team member.`
              : `Assign "${lead?.name}" to a team member.`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Select User
          </label>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : (
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a team member..." />
              </SelectTrigger>
              <SelectContent>
                {salesUsers?.map((user: any) => (
                  <SelectItem key={user._id} value={user._id}>
                    <div className="flex flex-col">
                      <span>{user.name}</span>
                      <span className="text-xs text-slate-400 capitalize">
                        {user.role?.replace("-", " ")}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {lead?.assignedTo && (
            <p className="text-sm text-slate-500 mt-2">
              Currently assigned to: <strong>{lead.assignedTo.name}</strong>
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedUserId || isSubmitting}
            className="bg-blue-950 hover:bg-blue-900"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {lead?.assignedTo ? "Reassign" : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}