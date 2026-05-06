"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qaChaptersApi, qaSubjectsApi } from "@/lib/api";
import { QAChapter, QASubject } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { QAChapterModal } from "@/components/qa-chapters/QAChapterModal";
import { QAChaptersTable } from "@/components/qa-chapters/QAChaptersTable";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const CLASS_LEVELS = ['6', '7', '8', '9', '10', '11', '12'];

export default function QAChaptersPage() {
  const queryClient = useQueryClient();
  const [filterSubject, setFilterSubject] = useState<string>("");
  const [filterClass, setFilterClass] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<QAChapter | null>(null);
  const [deletingChapter, setDeletingChapter] = useState<QAChapter | null>(null);

  const { data: subjects } = useQuery({
    queryKey: ["qa-subjects"],
    queryFn: async () => {
      const res = await qaSubjectsApi.getAll();
      return res.data.data as QASubject[];
    },
  });

  const { data: chapters, isLoading } = useQuery({
    queryKey: ["qa-chapters", filterSubject, filterClass],
    queryFn: async () => {
      const res = await qaChaptersApi.getAll({
        ...(filterSubject && { subject: filterSubject }),
        ...(filterClass && { classLevel: filterClass }),
      });
      return res.data.data as QAChapter[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => qaChaptersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qa-chapters"] });
      toast.success("Chapter deleted");
      setDeletingChapter(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleEdit = (chapter: QAChapter) => {
    setEditingChapter(chapter);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingChapter(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">QA Chapters</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage chapters for question & answer
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Chapter
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select
          value={filterSubject || "all"}
          onValueChange={(val) => {
            setFilterSubject(val === "all" ? "" : val);
            setFilterClass("");
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects?.map((s) => (
              <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterClass || "all"}
          onValueChange={(val) => setFilterClass(val === "all" ? "" : val)}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {CLASS_LEVELS.map((c) => (
              <SelectItem key={c} value={c}>Class {c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(filterSubject || filterClass) && (
          <Button
            variant="ghost"
            onClick={() => { setFilterSubject(""); setFilterClass(""); }}
          >
            Clear filters
          </Button>
        )}

        {chapters && (
          <span className="text-sm text-slate-400 ml-auto">
            {chapters.length} chapter{chapters.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <QAChaptersTable
        chapters={chapters || []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={setDeletingChapter}
      />

      {modalOpen && (
        <QAChapterModal
          open={modalOpen}
          onClose={handleModalClose}
          chapter={editingChapter}
          subjects={subjects || []}
        />
      )}

      {deletingChapter && (
        <ConfirmDialog
          open={!!deletingChapter}
          onOpenChange={(open) => { if (!open) setDeletingChapter(null); }}
          title="Delete Chapter"
          description="Are you sure? This cannot be undone."
          onConfirm={() => deleteMutation.mutate(deletingChapter._id)}
          isLoading={deleteMutation.isPending}
          isDestructive
        />
      )}
    </div>
  );
}