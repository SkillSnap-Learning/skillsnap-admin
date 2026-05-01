"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { questionsApi } from "@/lib/api";
import { Question, QuestionSubject, QuestionClassLevel, DifficultyType, QUESTION_SUBJECTS, QUESTION_CLASS_LEVELS } from "@/types";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface QuestionModalProps {
  open: boolean;
  onClose: () => void;
  question?: Question | null;
}

interface QuestionFormData {
  subject: QuestionSubject;
  classLevel: QuestionClassLevel;
  questionText: string;
  options: [string, string, string, string];
  correctAnswer: number;
  explanation?: string;
  difficulty: DifficultyType;
  isActive: boolean;
}

const OPTION_LABELS = ["A", "B", "C", "D"];

export function QuestionModal({ open, onClose, question }: QuestionModalProps) {
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
  const subject = watch("subject");
  const classLevel = watch("classLevel");
  const isActive = watch("isActive");

  useEffect(() => {
    if (question) {
      reset({
        subject: question.subject,
        classLevel: question.classLevel,
        questionText: question.questionText,
        options: question.options as [string, string, string, string],
        correctAnswer: question.correctAnswer,
        explanation: question.explanation || "",
        difficulty: question.difficulty,
        isActive: question.isActive,
      });
    } else {
      reset({
        subject: undefined,
        classLevel: undefined,
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
        difficulty: "medium",
        isActive: true,
      });
    }
  }, [question, reset]);

  const mutation = useMutation({
    mutationFn: (data: QuestionFormData) =>
      question
        ? questionsApi.update(question._id, data)
        : questionsApi.create(data),
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
    mutation.mutate({
      ...data,
      correctAnswer: Number(data.correctAnswer),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{question ? "Edit Question" : "Add Question"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Subject + Class */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Subject *</Label>
              <Select
                value={subject}
                onValueChange={(val) => setValue("subject", val as QuestionSubject, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" {...register("subject", { required: "Subject is required" })} />
              {errors.subject && <p className="text-xs text-red-600">{errors.subject.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Class *</Label>
              <Select
                value={classLevel}
                onValueChange={(val) => setValue("classLevel", val as QuestionClassLevel, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_CLASS_LEVELS.map((c) => (
                    <SelectItem key={c} value={c}>Class {c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" {...register("classLevel", { required: "Class is required" })} />
              {errors.classLevel && <p className="text-xs text-red-600">{errors.classLevel.message}</p>}
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-1.5">
            <Label>Question *</Label>
            <Textarea
              {...register("questionText", { required: "Question text is required" })}
              placeholder="Enter the question..."
              rows={3}
            />
            {errors.questionText && <p className="text-xs text-red-600">{errors.questionText.message}</p>}
          </div>

          {/* Options */}
          <div className="space-y-2">
            <Label>Options * — click the letter to mark correct answer</Label>
            {OPTION_LABELS.map((label, i) => (
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
                    required: `Option ${label} is required`,
                  })}
                  placeholder={`Option ${label}`}
                />
              </div>
            ))}
            {errors.options && <p className="text-xs text-red-600">All 4 options are required</p>}
          </div>

          {/* Difficulty + Active */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Difficulty</Label>
              <Select
                value={difficulty}
                onValueChange={(val) => setValue("difficulty", val as DifficultyType)}
              >
                <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={isActive ? "true" : "false"}
                onValueChange={(val) => setValue("isActive", val === "true")}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-1.5">
            <Label>Explanation <span className="text-slate-400 text-xs">(optional)</span></Label>
            <Textarea
              {...register("explanation")}
              placeholder="Why is this the correct answer?"
              rows={2}
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : question ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}