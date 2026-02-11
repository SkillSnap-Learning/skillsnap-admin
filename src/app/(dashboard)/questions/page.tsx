"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { questionsApi, chaptersApi, coursesApi } from "@/lib/api";
import { Question, Chapter, Course } from "@/types";
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
import { QuestionModal } from "@/components/questions/QuestionModal";
import { QuestionsTable } from "@/components/questions/QuestionsTable";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function QuestionsPage() {
  const searchParams = useSearchParams();
  const chapterIdFromUrl = searchParams.get("chapterId");

  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [chapterFilter, setChapterFilter] = useState<string>(chapterIdFromUrl || "all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null);

  const queryClient = useQueryClient();

  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await coursesApi.getAll();
      return res.data.data as Course[];
    },
  });

  const { data: chapters } = useQuery({
    queryKey: ["chapters", courseFilter],
    queryFn: async () => {
      if (courseFilter === "all") {
        const res = await chaptersApi.getAll();
        return res.data.data as Chapter[];
      }
      const res = await chaptersApi.getByCourse(courseFilter);
      return res.data.data as Chapter[];
    },
  });

  const { data: questions, isLoading } = useQuery({
    queryKey: ["questions", { search: searchTerm, chapterId: chapterFilter, difficulty: difficultyFilter }],
    queryFn: async () => {
      if (chapterFilter !== "all") {
        const res = await questionsApi.getByChapter(chapterFilter);
        return res.data.data as Question[];
      }
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (difficultyFilter !== "all") params.difficulty = difficultyFilter;
      const res = await questionsApi.getAll(params);
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

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingQuestion(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-950">Questions</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={courseFilter} onValueChange={(val) => {
          setCourseFilter(val);
          setChapterFilter("all");
        }}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses?.map((c) => (
              <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={chapterFilter} onValueChange={setChapterFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Chapter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Chapters</SelectItem>
            {chapters?.map((ch) => (
              <SelectItem key={ch._id} value={ch._id}>Ch {ch.chapterNumber}: {ch.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <QuestionsTable
        questions={questions || []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={setDeletingQuestion}
      />

      <QuestionModal
        open={modalOpen}
        onClose={handleCloseModal}
        question={editingQuestion}
        chapters={chapters || []}
      />

      <ConfirmDialog
        open={!!deletingQuestion}
        onOpenChange={(open) => !open && setDeletingQuestion(null)}
        onConfirm={() => deletingQuestion && deleteMutation.mutate(deletingQuestion._id)}
        title="Delete Question"
        description="Delete this question? This cannot be undone."
        confirmText="Delete"
        isDestructive
      />
    </div>
  );
}