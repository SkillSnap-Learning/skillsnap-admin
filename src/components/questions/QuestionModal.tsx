"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { questionsApi } from "@/lib/api";
import { Question, DifficultyType } from "@/types";
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
  topicId: string;
}

interface QuestionFormData {
  topicId: string;
  questionText: string;
  options: [string, string, string, string];
  correctAnswer: number;
  explanation?: string;
  difficulty: DifficultyType;
}

const optionLabels = ["A", "B", "C", "D"];

export function QuestionModal({
  open,
  onClose,
  question,
  topicId,
}: QuestionModalProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<QuestionFormData>();

  const difficulty = watch("difficulty");
  const correctAnswer = watch("correctAnswer");

  useEffect(() => {
    if (question) {
      reset({
        topicId,
        questionText: question.questionText,
        options: question.options as [string, string, string, string],
        correctAnswer: question.correctAnswer,
        explanation: question.explanation || "",
        difficulty: question.difficulty,
      });
    } else {
      reset({
        topicId,
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
        difficulty: "medium",
      });
    }
  }, [question, topicId, reset]);

  const mutation = useMutation({
    mutationFn: (data: QuestionFormData) =>
      question
        ? questionsApi.update(question._id, data)
        : questionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions", topicId] });
      toast.success(question ? "Question updated" : "Question created");
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: QuestionFormData) => {
    if (question) {
      // Strip topicId on update — backend doesn't allow changing it
      const { topicId: _, ...updateData } = data;
      mutation.mutate({
        ...updateData,
        correctAnswer: Number(data.correctAnswer),
      } as QuestionFormData);
    } else {
      mutation.mutate({
        ...data,
        correctAnswer: Number(data.correctAnswer),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {question ? "Edit Question" : "Add Question"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Question *</Label>
            <Textarea
              {...register("questionText", {
                required: "Question text is required",
              })}
              placeholder="Enter the question..."
              rows={3}
            />
            {errors.questionText && (
              <p className="text-sm text-red-600 mt-1">
                {errors.questionText.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Options * (select the correct answer)</Label>
            {optionLabels.map((label, i) => (
              <div key={i} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setValue("correctAnswer", i)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 transition-colors ${
                    Number(correctAnswer) === i
                      ? "bg-green-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
                <Input
                  {...register(`options.${i}` as `options.${0 | 1 | 2 | 3}`, {
                    required: "Option is required",
                  })}
                  placeholder={`Option ${label}`}
                />
              </div>
            ))}
            <p className="text-xs text-slate-500">
              Click the letter button to mark it as the correct answer
            </p>
          </div>

          <div>
            <Label>Difficulty *</Label>
            <Select
              value={difficulty}
              onValueChange={(val) =>
                setValue("difficulty", val as DifficultyType)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Explanation (optional)</Label>
            <Textarea
              {...register("explanation")}
              placeholder="Explain why the correct answer is correct..."
              rows={2}
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? "Saving..."
                : question
                ? "Update"
                : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}