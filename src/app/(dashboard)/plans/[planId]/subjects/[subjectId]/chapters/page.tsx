"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { plansApi, subjectsApi, chaptersApi } from "@/lib/api";
import { Chapter, Plan, Subject } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { ChaptersTable } from "@/components/chapters/ChaptersTable";
import { ChapterModal } from "@/components/chapters/ChapterModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import Link from "next/link";

export default function ChaptersPage() {
  const { planId, subjectId } = useParams<{
    planId: string;
    subjectId: string;
  }>();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [deletingChapter, setDeletingChapter] = useState<Chapter | null>(null);

  const queryClient = useQueryClient();

  const { data: plan } = useQuery({
    queryKey: ["plans", planId],
    queryFn: async () => {
      const res = await plansApi.getById(planId);
      return res.data.data as Plan;
    },
  });

  const { data: subject } = useQuery({
    queryKey: ["subjects", subjectId],
    queryFn: async () => {
      const res = await subjectsApi.getById(subjectId);
      return res.data.data as Subject;
    },
  });

  const { data: chapters, isLoading } = useQuery({
    queryKey: ["chapters", subjectId],
    queryFn: async () => {
      const res = await chaptersApi.getBySubject(subjectId);
      return res.data.data as Chapter[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => chaptersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters", subjectId] });
      toast.success("Chapter deleted");
      setDeletingChapter(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const subjectLabel = subject
    ? `${subject.name.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())} (Class ${subject.class})`
    : "...";

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
        <Link href="/plans" className="hover:text-blue-950">
          Plans
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href={`/plans/${planId}/subjects`}
          className="hover:text-blue-950"
        >
          {plan?.name || "..."}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-blue-950 font-medium">{subjectLabel}</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Chapters</h1>
          <p className="text-sm text-slate-500 mt-1">
            {plan?.name} — {subjectLabel}
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Chapter
        </Button>
      </div>

      <ChaptersTable
        chapters={chapters || []}
        isLoading={isLoading}
        planId={planId}
        subjectId={subjectId}
        onEdit={(chapter) => {
          setEditingChapter(chapter);
          setModalOpen(true);
        }}
        onDelete={setDeletingChapter}
      />

      <ChapterModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingChapter(null);
        }}
        chapter={editingChapter}
        subjectId={subjectId}
      />

      <ConfirmDialog
        open={!!deletingChapter}
        onOpenChange={(open) => !open && setDeletingChapter(null)}
        onConfirm={() =>
          deletingChapter && deleteMutation.mutate(deletingChapter._id)
        }
        title="Delete Chapter"
        description={`Delete "${deletingChapter?.title}"? All topics and questions under it will also be removed.`}
        confirmText="Delete"
        isDestructive
      />
    </div>
  );
}