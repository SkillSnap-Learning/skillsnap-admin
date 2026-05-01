"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { questionsApi } from "@/lib/api";
import { Question, QUESTION_SUBJECTS, QUESTION_CLASS_LEVELS } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { QuestionModal } from "@/components/questions/QuestionModal";
import { QuestionsTable } from "@/components/questions/QuestionsTable";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function QuestionsPage() {
  const queryClient = useQueryClient();

  const [filterSubject, setFilterSubject] = useState<string>("");
  const [filterClass, setFilterClass] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["questions", filterSubject, filterClass],
    queryFn: async () => {
      const res = await questionsApi.getAll({
        ...(filterSubject && { subject: filterSubject }),
        ...(filterClass && { classLevel: filterClass }),
      });
      return res.data.data as Question[];
    },
  });

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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Questions</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage MCQ questions by subject and class
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Question
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
            {QUESTION_SUBJECTS.map((s) => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
        </SelectContent>
        </Select>

        <Select
        value={filterClass || "all"}
        onValueChange={(val) => setFilterClass(val === "all" ? "" : val)}
        disabled={!filterSubject}
        >
        <SelectTrigger className="w-36">
            <SelectValue placeholder="All Classes" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {QUESTION_CLASS_LEVELS.map((c) => (
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

        {data && (
          <span className="text-sm text-slate-400 ml-auto">
            {data.length} question{data.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <QuestionsTable
        questions={data || []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={setDeletingQuestion}
      />

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