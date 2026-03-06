"use client";

import { Question, Topic } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface QuestionsTableProps {
  questions: Question[];
  isLoading: boolean;
  onEdit: (question: Question) => void;
  onDelete: (question: Question) => void;
}

const difficultyColors: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

const optionLabels = ["A", "B", "C", "D"];

export function QuestionsTable({
  questions,
  isLoading,
  onEdit,
  onDelete,
}: QuestionsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-slate-500">No questions found</p>
        <p className="text-sm text-slate-400 mt-1">
          Add at least 5 questions for the test to work
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Question</TableHead>
            <TableHead>Options</TableHead>
            <TableHead>Answer</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question, index) => (
            <TableRow key={question._id}>
              <TableCell className="text-slate-500 text-sm">
                {index + 1}
              </TableCell>
              <TableCell className="max-w-xs">
                <p className="font-medium text-sm line-clamp-2">
                  {question.questionText}
                </p>
                {question.explanation && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                    Explanation: {question.explanation}
                  </p>
                )}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {question.options.map((option, i) => (
                    <div
                      key={i}
                      className={`text-xs flex items-center gap-1.5 ${
                        i === question.correctAnswer
                          ? "text-green-700 font-medium"
                          : "text-slate-500"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                          i === question.correctAnswer
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {optionLabels[i]}
                      </span>
                      <span className="line-clamp-1">{option}</span>
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Badge className="bg-green-100 text-green-700">
                  {optionLabels[question.correctAnswer]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    difficultyColors[question.difficulty] ||
                    difficultyColors.medium
                  }
                >
                  {question.difficulty}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(question)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(question)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}