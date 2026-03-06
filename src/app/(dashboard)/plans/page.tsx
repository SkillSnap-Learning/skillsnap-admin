"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { plansApi } from "@/lib/api";
import { Plan } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { PlansTable } from "@/components/plans/PlansTable";
import { PlanModal } from "@/components/plans/PlanModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function PlansPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["plans", { type: typeFilter }],
    queryFn: async () => {
      const params: Record<string, unknown> = {};
      if (typeFilter === "guest") params.isGuestPlan = true;
      if (typeFilter === "paid") params.isGuestPlan = false;
      const res = await plansApi.getAll(params);
      return res.data.data as Plan[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => plansApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Plan deleted successfully");
      setDeletingPlan(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const filtered = data?.filter((plan) =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.slug.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Plans</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage learning plans and their content structure
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Plan
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="guest">Guest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <PlansTable
        plans={filtered}
        isLoading={isLoading}
        onEdit={(plan) => {
          setEditingPlan(plan);
          setModalOpen(true);
        }}
        onDelete={setDeletingPlan}
      />

      <PlanModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingPlan(null);
        }}
        plan={editingPlan}
      />

      <ConfirmDialog
        open={!!deletingPlan}
        onOpenChange={(open) => !open && setDeletingPlan(null)}
        onConfirm={() =>
          deletingPlan && deleteMutation.mutate(deletingPlan._id)
        }
        title="Delete Plan"
        description={`Delete "${deletingPlan?.name}"? This will remove all subjects, chapters, topics and questions under it.`}
        confirmText="Delete"
        isDestructive
      />
    </div>
  );
}