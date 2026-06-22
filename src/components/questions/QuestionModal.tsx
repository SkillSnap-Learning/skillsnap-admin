"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { questionsApi, qaSubjectsApi, qaChaptersApi } from "@/lib/api";
import { Question, QASubject, QAChapter, QAClassLevel, DifficultyType } from "@/types";
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
  subject: string;
  classLevel: QAClassLevel;
  chapter: string;
  questionType: 'mcq' | 'descriptive';
  questionText: string;
  options: [string, string, string, string];
  correctAnswer: number;
  explanation?: string;
  difficulty: DifficultyType;
  isActive: boolean;
  force?: boolean;
}

const OPTION_LABELS = ["A", "B", "C", "D"];

export function QuestionModal({ open, onClose, question }: QuestionModalProps) {
  const queryClient = useQueryClient();
  const [duplicateWarning, setDuplicateWarning] = useState<{ existingQuestion: string; pendingData: QuestionFormData } | null>(null);

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
  const questionType = watch("questionType");

  const { data: subjects } = useQuery({
    queryKey: ["qa-subjects"],
    queryFn: async () => {
      const res = await qaSubjectsApi.getAll();
      return res.data.data as QASubject[];
    },
  });

  const { data: chapters } = useQuery({
    queryKey: ["qa-chapters", subject, classLevel],
    queryFn: async () => {
      if (!subject || !classLevel) return [];
      const res = await qaChaptersApi.getAll({ subject, classLevel });
      return res.data.data as QAChapter[];
    },
    enabled: !!subject && !!classLevel,
  });

  useEffect(() => {
    if (question) {
      reset({
        subject: typeof question.subject === "object" ? (question.subject as QASubject)._id : question.subject,
        classLevel: question.classLevel,
        chapter: typeof question.chapter === "object" ? (question.chapter as QAChapter)._id : question.chapter,
        questionType: question.questionType || "mcq",
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
        chapter: undefined,
        questionType: "mcq",
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
      setDuplicateWarning(null);
      onClose();
    },
    onError: (error: any) => {
      if (error.response?.data?.code === 'DUPLICATE_QUESTION') {
        setDuplicateWarning({
          existingQuestion: error.response.data.existingQuestion,
          pendingData: error.config ? JSON.parse(error.config.data) : {},
        });
        return;
      }
      toast.error(error.message);
    },
  });

  const onSubmit = (data: QuestionFormData) => {
    const payload: Partial<QuestionFormData> = { ...data };

    if (data.questionType === "descriptive") {
      delete payload.options;
      delete payload.correctAnswer;
    } else {
      payload.correctAnswer = Number(data.correctAnswer);
    }

    mutation.mutate(payload as QuestionFormData);
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
                onValueChange={(val) => {
                  setValue("subject", val, { shouldValidate: true });
                  setValue("chapter", "");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects?.map((s) => (
                    <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
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
                onValueChange={(val) => {
                  setValue("classLevel", val as QAClassLevel, { shouldValidate: true });
                  setValue("chapter", "");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {['6','7','8','9','10','11','12'].map((c) => (
                    <SelectItem key={c} value={c}>Class {c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" {...register("classLevel", { required: "Class is required" })} />
              {errors.classLevel && <p className="text-xs text-red-600">{errors.classLevel.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Chapter *</Label>
            <Select
              value={watch("chapter")}
              onValueChange={(val) => setValue("chapter", val, { shouldValidate: true })}
              disabled={!subject || !classLevel}
            >
              <SelectTrigger>
                <SelectValue placeholder={!subject || !classLevel ? "Select subject & class first" : "Select chapter"} />
              </SelectTrigger>
              <SelectContent>
                {chapters?.map((c) => (
                  <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" {...register("chapter", { required: "Chapter is required" })} />
            {errors.chapter && <p className="text-xs text-red-600">{errors.chapter.message}</p>}
          </div>

          {/* Question Type */}
          <div className="space-y-1.5">
            <Label>Question Type</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setValue("questionType", "mcq")}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  questionType === "mcq" || !questionType
                    ? "bg-[#1A3A8F] text-white border-[#1A3A8F]"
                    : "bg-white text-muted-foreground border-slate-200 hover:border-slate-300"
                }`}
              >
                MCQ
              </button>
              <button
                type="button"
                onClick={() => setValue("questionType", "descriptive")}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  questionType === "descriptive"
                    ? "bg-[#1A3A8F] text-white border-[#1A3A8F]"
                    : "bg-white text-muted-foreground border-slate-200 hover:border-slate-300"
                }`}
              >
                Descriptive
              </button>
            </div>
            <input type="hidden" {...register("questionType")} />
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

          {/* Options — MCQ only */}
          {(questionType === "mcq" || !questionType) && (
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
                        : "bg-muted text-muted-foreground hover:bg-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                  <Input
                    {...register(`options.${i}` as `options.${0 | 1 | 2 | 3}`, {
                      required: questionType === "mcq" ? `Option ${label} is required` : false,
                    })}
                    placeholder={`Option ${label}`}
                  />
                </div>
              ))}
              {errors.options && <p className="text-xs text-red-600">All 4 options are required</p>}
            </div>
          )}

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

          {/* Explanation / Answer */}
          <div className="space-y-1.5">
            <Label>
              {questionType === "descriptive" ? "Answer / Description *" : "Explanation"}
              {questionType !== "descriptive" && (
                <span className="text-slate-400 text-xs ml-1">(optional)</span>
              )}
            </Label>
            <Textarea
              {...register("explanation", {
                required: questionType === "descriptive" ? "Answer is required for descriptive questions" : false,
              })}
              placeholder={
                questionType === "descriptive"
                  ? "Write the full answer or description here..."
                  : "Why is this the correct answer?"
              }
              rows={questionType === "descriptive" ? 6 : 2}
            />
            {errors.explanation && (
              <p className="text-xs text-red-600">{errors.explanation.message}</p>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : question ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
      {duplicateWarning && (
        <Dialog open={!!duplicateWarning} onOpenChange={() => setDuplicateWarning(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-yellow-600">⚠️ Similar Question Exists</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
              ⚠️ A question with similar text already exists:
            </p>
            <p className="text-sm font-medium text-slate-800 bg-slate-50 rounded-lg p-3 border">
              {duplicateWarning.existingQuestion}
            </p>
            <p className="text-sm text-slate-500">Do you still want to save this question?</p>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setDuplicateWarning(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => mutation.mutate({ ...duplicateWarning.pendingData, force: true })}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Saving..." : "Save Anyway"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}