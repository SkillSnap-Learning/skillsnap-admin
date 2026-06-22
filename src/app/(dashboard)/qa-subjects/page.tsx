"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qaSubjectsApi } from "@/lib/api";
import { QASubject } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { QASubjectModal } from "@/components/qa-subjects/QASubjectModal";
import { QASubjectsTable } from "@/components/qa-subjects/QASubjectsTable";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function QASubjectsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<QASubject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<QASubject | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["qa-subjects"],
    queryFn: async () => {
      const res = await qaSubjectsApi.getAll();
      return res.data.data as QASubject[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => qaSubjectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qa-subjects"] });
      toast.success("Subject deleted");
      setDeletingSubject(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleEdit = (subject: QASubject) => {
    setEditingSubject(subject);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingSubject(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">QA Subjects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage subjects available for question & answer
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Subject
        </Button>
      </div>

      <QASubjectsTable
        subjects={data || []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={setDeletingSubject}
      />

      {modalOpen && (
        <QASubjectModal
          open={modalOpen}
          onClose={handleModalClose}
          subject={editingSubject}
        />
      )}

      {deletingSubject && (
        <ConfirmDialog
          open={!!deletingSubject}
          onOpenChange={(open) => { if (!open) setDeletingSubject(null); }}
          title="Delete Subject"
          description="Are you sure? This cannot be undone."
          onConfirm={() => deleteMutation.mutate(deletingSubject._id)}
          isLoading={deleteMutation.isPending}
          isDestructive
        />
      )}
    </div>
  );
}