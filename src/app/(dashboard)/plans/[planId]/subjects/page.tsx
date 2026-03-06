"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { plansApi, subjectsApi } from "@/lib/api";
import { Subject, Plan } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { SubjectsTable } from "@/components/subjects/SubjectsTable";
import { SubjectModal } from "@/components/subjects/SubjectModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import Link from "next/link";

export default function SubjectsPage() {
  const { planId } = useParams<{ planId: string }>();
  const [classFilter, setClassFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);

  const queryClient = useQueryClient();

  const { data: plan } = useQuery({
    queryKey: ["plans", planId],
    queryFn: async () => {
      const res = await plansApi.getById(planId);
      return res.data.data as Plan;
    },
  });

  const { data: subjects, isLoading } = useQuery({
    queryKey: ["subjects", planId, classFilter],
    queryFn: async () => {
      const res = await subjectsApi.getByPlan(
        planId,
        classFilter !== "all" ? classFilter : undefined
      );
      return res.data.data as Subject[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => subjectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects", planId] });
      toast.success("Subject deleted");
      setDeletingSubject(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/plans" className="hover:text-blue-950">
          Plans
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-blue-950 font-medium">
          {plan?.name || "..."}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Subjects</h1>
          <p className="text-sm text-slate-500 mt-1">
            {plan?.name} — manage subjects by class
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>
      </div>

      {/* Class filter */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-500">Filter by class:</span>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            <SelectItem value="6">Class 6</SelectItem>
            <SelectItem value="7">Class 7</SelectItem>
            <SelectItem value="8">Class 8</SelectItem>
            <SelectItem value="9">Class 9</SelectItem>
            <SelectItem value="10">Class 10</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <SubjectsTable
        subjects={subjects || []}
        isLoading={isLoading}
        planId={planId}
        onEdit={(subject) => {
          setEditingSubject(subject);
          setModalOpen(true);
        }}
        onDelete={setDeletingSubject}
      />

      <SubjectModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingSubject(null);
        }}
        subject={editingSubject}
        planId={planId}
      />

      <ConfirmDialog
        open={!!deletingSubject}
        onOpenChange={(open) => !open && setDeletingSubject(null)}
        onConfirm={() =>
          deletingSubject && deleteMutation.mutate(deletingSubject._id)
        }
        title="Delete Subject"
        description={`Delete this subject? All chapters, topics and questions under it will also be removed.`}
        confirmText="Delete"
        isDestructive
      />
    </div>
  );
}