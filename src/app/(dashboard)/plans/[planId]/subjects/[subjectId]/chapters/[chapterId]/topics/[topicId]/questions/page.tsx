"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  plansApi,
  subjectsApi,
  chaptersApi,
  topicsApi,
  questionsApi,
} from "@/lib/api";
import { Question, Plan, Subject, Chapter, Topic } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { QuestionsTable } from "@/components/questions/QuestionsTable";
import { QuestionModal } from "@/components/questions/QuestionModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function QuestionsPage() {
  const { planId, subjectId, chapterId, topicId } = useParams<{
    planId: string;
    subjectId: string;
    chapterId: string;
    topicId: string;
  }>();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(
    null
  );

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

  const { data: chapter } = useQuery({
    queryKey: ["chapters", chapterId],
    queryFn: async () => {
      const res = await chaptersApi.getById(chapterId);
      return res.data.data as Chapter;
    },
  });

  const { data: topic } = useQuery({
    queryKey: ["topics", topicId],
    queryFn: async () => {
      const res = await topicsApi.getById(topicId);
      return res.data.data as Topic;
    },
  });

  const { data: questions, isLoading } = useQuery({
    queryKey: ["questions", topicId],
    queryFn: async () => {
      const res = await questionsApi.getByTopic(topicId);
      return res.data.data as Question[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => questionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions", topicId] });
      toast.success("Question deleted");
      setDeletingQuestion(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const subjectLabel = subject
    ? `${subject.name
        .replace("_", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())} (Class ${subject.class})`
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
        <Link
          href={`/plans/${planId}/subjects/${subjectId}/chapters`}
          className="hover:text-blue-950"
        >
          {subjectLabel}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href={`/plans/${planId}/subjects/${subjectId}/chapters/${chapterId}/topics`}
          className="hover:text-blue-950"
        >
          {chapter ? `Ch ${chapter.chapterNumber}: ${chapter.title}` : "..."}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-blue-950 font-medium">
          {topic ? `T${topic.topicNumber}: ${topic.title}` : "..."}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Questions</h1>
          <p className="text-sm text-slate-500 mt-1">
            {topic?.title} — MCQ test questions
          </p>
        </div>
        <div className="flex items-center gap-3">
          {questions && (
            <Badge
              className={
                questions.length >= 5
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }
            >
              {questions.length} question{questions.length !== 1 ? "s" : ""}
              {questions.length < 5 && " (min 5 needed)"}
            </Badge>
          )}
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      <QuestionsTable
        questions={questions || []}
        isLoading={isLoading}
        onEdit={(question) => {
          setEditingQuestion(question);
          setModalOpen(true);
        }}
        onDelete={setDeletingQuestion}
      />

      <QuestionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingQuestion(null);
        }}
        question={editingQuestion}
        topicId={topicId}
      />

      <ConfirmDialog
        open={!!deletingQuestion}
        onOpenChange={(open) => !open && setDeletingQuestion(null)}
        onConfirm={() =>
          deletingQuestion && deleteMutation.mutate(deletingQuestion._id)
        }
        title="Delete Question"
        description="Delete this question? This cannot be undone."
        confirmText="Delete"
        isDestructive
      />
    </div>
  );
}