"use client";

import { Question, Chapter } from "@/types";
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

const difficultyColors = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

export function QuestionsTable({ questions, isLoading, onEdit, onDelete }: QuestionsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-slate-500">No questions found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">Question</TableHead>
            <TableHead>Chapter</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Answer</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question) => {
            const chapter = typeof question.chapterId === 'object' ? question.chapterId as Chapter : null;
            return (
              <TableRow key={question._id}>
                <TableCell className="font-medium">
                  <div className="line-clamp-2">{question.questionText}</div>
                  {question.images && question.images.length > 0 && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {question.images.length} image(s)
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {chapter ? `Ch ${chapter.chapterNumber}: ${chapter.title}` : 'Unknown'}
                </TableCell>
                <TableCell>
                  <Badge className={difficultyColors[question.difficulty]}>
                    {question.difficulty}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  Option {question.correctAnswer + 1}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(question)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(question)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}