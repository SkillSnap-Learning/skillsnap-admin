"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { questionsApi } from "@/lib/api";
import { Question, Chapter, DifficultyType } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface QuestionModalProps {
  open: boolean;
  onClose: () => void;
  question?: Question | null;
  chapters: Chapter[];
}

interface QuestionFormData {
  chapterId: string;
  questionText: string;
  options: [string, string, string, string];
  correctAnswer: number;
  explanation?: string;
  difficulty: DifficultyType;
}

export function QuestionModal({ open, onClose, question, chapters }: QuestionModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<QuestionFormData>();
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyType>("easy");
  const [selectedAnswer, setSelectedAnswer] = useState(0);

  useEffect(() => {
    if (question) {
      const chapterId = typeof question.chapterId === 'object' 
        ? (question.chapterId as Chapter)._id 
        : question.chapterId;
      
      setSelectedChapter(chapterId);
      setSelectedDifficulty(question.difficulty);
      setSelectedAnswer(question.correctAnswer);
      
      reset({
        chapterId,
        questionText: question.questionText,
        options: question.options as [string, string, string, string],
        correctAnswer: question.correctAnswer,
        explanation: question.explanation || "",
        difficulty: question.difficulty,
      });
    } else {
      reset({
        chapterId: "",
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
        difficulty: "easy",
      });
      setSelectedChapter("");
      setSelectedDifficulty("easy");
      setSelectedAnswer(0);
    }
  }, [question, reset]);

  const mutation = useMutation({
    mutationFn: (data: QuestionFormData) =>
      question ? questionsApi.update(question._id, data) : questionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      toast.success(question ? "Question updated" : "Question created");
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: QuestionFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{question ? "Edit Question" : "Create Question"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Chapter *</Label>
              <Select value={selectedChapter} onValueChange={(val) => {
                setSelectedChapter(val);
                setValue("chapterId", val);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select chapter" />
                </SelectTrigger>
                <SelectContent>
                  {chapters.map((ch) => (
                    <SelectItem key={ch._id} value={ch._id}>
                      Ch {ch.chapterNumber}: {ch.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Difficulty *</Label>
              <Select value={selectedDifficulty} onValueChange={(val) => {
                setSelectedDifficulty(val as DifficultyType);
                setValue("difficulty", val as DifficultyType);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Question Text *</Label>
            <Textarea
              {...register("questionText", { required: true })}
              rows={3}
              placeholder="Enter the question"
            />
          </div>

          <div className="space-y-3">
            <Label>Options * (Select correct answer)</Label>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex gap-2">
                <Input
                  {...register(`options.${i}` as const, { required: true })}
                  placeholder={`Option ${i + 1}`}
                  className={selectedAnswer === i ? "border-green-500 border-2" : ""}
                />
                <Button
                  type="button"
                  variant={selectedAnswer === i ? "default" : "outline"}
                  onClick={() => {
                    setSelectedAnswer(i);
                    setValue("correctAnswer", i);
                  }}
                  className="w-32"
                >
                  {selectedAnswer === i ? "Correct ✓" : "Mark Correct"}
                </Button>
              </div>
            ))}
          </div>

          <div>
            <Label>Explanation (optional)</Label>
            <Textarea
              {...register("explanation")}
              rows={2}
              placeholder="Explain the correct answer"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : question ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}