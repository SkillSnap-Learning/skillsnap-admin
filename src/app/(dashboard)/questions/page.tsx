"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { questionsApi,qaSubjectsApi, qaChaptersApi } from "@/lib/api";
import { Question, QASubject, QAChapter } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { QuestionModal } from "@/components/questions/QuestionModal";
import { QuestionsTable } from "@/components/questions/QuestionsTable";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pagination } from "@/components/ui/pagination";

export default function QuestionsPage() {
  const queryClient = useQueryClient();

  const [filterSubject, setFilterSubject] = useState<string>("");
  const [filterClass, setFilterClass] = useState<string>("");
  const [filterChapter, setFilterChapter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null);

  const { data: subjects } = useQuery({
    queryKey: ["qa-subjects"],
    queryFn: async () => {
      const res = await qaSubjectsApi.getAll();
      return res.data.data as QASubject[];
    },
  });

  const { data: filterChapters } = useQuery({
    queryKey: ["qa-chapters", filterSubject, filterClass],
    queryFn: async () => {
      if (!filterSubject || !filterClass) return [];
      const res = await qaChaptersApi.getAll({ subject: filterSubject, classLevel: filterClass });
      return res.data.data as QAChapter[];
    },
    enabled: !!filterSubject && !!filterClass,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["questions", filterSubject, filterClass, filterChapter, page],
    queryFn: async () => {
      const res = await questionsApi.getAll({
        ...(filterSubject && { subject: filterSubject }),
        ...(filterClass && { classLevel: filterClass }),
        ...(filterChapter && { chapter: filterChapter }),
        page,
        limit: 100,
      });
      return res.data.data as { questions: Question[]; pagination: { total: number; page: number; totalPages: number; limit: number } };
    },
  });

  const questions = data?.questions ?? [];
  const pagination = data?.pagination;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => questionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success("Question deleted");
      setDeletingQuestion(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingQuestion(null);
  };

  return (
    <div className="p-6 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Questions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage MCQ questions by subject and class
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Question
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select
          value={filterSubject || "all"}
          onValueChange={(val) => {
            setFilterSubject(val === "all" ? "" : val);
            setFilterClass("");
            setFilterChapter("");
            setPage(1);
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
          onValueChange={(val) => {
            setFilterClass(val === "all" ? "" : val);
            setFilterChapter("");
            setPage(1);
          }}
          disabled={!filterSubject}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {['6','7','8','9','10','11','12'].map((c) => (
              <SelectItem key={c} value={c}>Class {c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterChapter || "all"}
          onValueChange={(val) => { setFilterChapter(val === "all" ? "" : val); setPage(1); }}
          disabled={!filterSubject || !filterClass}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Chapters" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Chapters</SelectItem>
            {filterChapters?.map((c) => (
              <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(filterSubject || filterClass || filterChapter) && (
          <Button
            variant="ghost"
            onClick={() => {
              setFilterSubject("");
              setFilterClass("");
              setFilterChapter("");
              setPage(1);
            }}
          >
            Clear filters
          </Button>
        )}

        {pagination && (
          <span className="text-sm text-muted-foreground/60 ml-auto">
            {pagination.total} question{pagination.total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <QuestionsTable
        questions={questions}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={setDeletingQuestion}
      />

      {pagination && pagination.totalPages > 1 && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-20 bg-card border-t px-6 py-3">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            totalItems={pagination.total}
            itemsPerPage={100}
          />
        </div>
      )}

      {modalOpen && (
        <QuestionModal
          open={modalOpen}
          onClose={handleModalClose}
          question={editingQuestion}
        />
      )}

      {deletingQuestion && (
        <ConfirmDialog
            open={!!deletingQuestion}
            onOpenChange={(open) => { if (!open) setDeletingQuestion(null); }}
            title="Delete Question"
            description="Are you sure you want to delete this question? This cannot be undone."
            onConfirm={() => deleteMutation.mutate(deletingQuestion!._id)}
            isLoading={deleteMutation.isPending}
            isDestructive
        />
      )}
    </div>
  );
}