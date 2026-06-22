"use client";

import { Question, QASubject, QAChapter } from "@/types";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TextTooltip } from "@/components/ui/text-tooltip";

interface QuestionsTableProps {
  questions: Question[];
  isLoading: boolean;
  onEdit: (question: Question) => void;
  onDelete: (question: Question) => void;
}

const difficultyColors: Record<string, string> = {
  easy: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
  hard: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

const OPTION_LABELS = ["A", "B", "C", "D"];

function CopySlugButton({ slug }: { slug?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!slug) return;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    await navigator.clipboard.writeText(`${siteUrl}/question-answer/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      title={slug ? `Copy: ${slug}` : "No slug"}
      disabled={!slug}
      className={`transition-all duration-200 ${
        copied ? "text-green-600 bg-green-50 hover:bg-green-50 hover:text-green-600" : ""
      }`}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}

export function QuestionsTable({ questions, isLoading, onEdit, onDelete }: QuestionsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No questions found</p>
        <p className="text-sm text-muted-foreground/60 mt-1">Use the filters above or add a new question</p>
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
            <TableHead>Subject</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Chapter</TableHead>
            <TableHead>Options</TableHead>
            <TableHead>Answer</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question, index) => (
            <TableRow key={question._id}>
              <TableCell className="text-muted-foreground text-sm">{index + 1}</TableCell>
              <TableCell className="max-w-xs">
                <TextTooltip text={question.questionText}>
                  <p className="font-medium text-sm line-clamp-2">{question.questionText}</p>
                </TextTooltip>
                {question.explanation && (
                  <TextTooltip text={question.explanation}>
                    <p className="text-xs text-muted-foreground/60 mt-1 line-clamp-1">
                      Explanation: {question.explanation}
                    </p>
                  </TextTooltip>
                )}
              </TableCell>
              <TableCell className="text-sm">
                {typeof question.subject === "object" ? (question.subject as QASubject).name : question.subject}
              </TableCell>
              <TableCell>
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">Class {question.classLevel}</Badge>
              </TableCell>
              <TableCell className="text-sm">
                {typeof question.chapter === "object" ? (question.chapter as QAChapter).name : "—"}
              </TableCell>
              <TableCell>
                {question.options && question.options.length > 0 ? (
                  <div className="space-y-1">
                    {question.options.map((option, i) => (
                      <div
                        key={i}
                        className={`text-xs flex items-center gap-1.5 ${
                          i === question.correctAnswer ? "text-green-700 font-medium" : "text-muted-foreground"
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                          i === question.correctAnswer ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" : "bg-muted text-muted-foreground"
                        }`}>
                          {OPTION_LABELS[i]}
                        </span>
                        <span className="line-clamp-1">{option}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-purple-600 font-medium">Descriptive</span>
                )}
              </TableCell>
              <TableCell>
                {question.questionType === "descriptive" ? (
                  <span className="text-xs text-muted-foreground/60">—</span>
                ) : (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400">
                    {OPTION_LABELS[question.correctAnswer]}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge className={difficultyColors[question.difficulty] || difficultyColors.medium}>
                  {question.difficulty}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={question.isActive ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" : "bg-muted text-muted-foreground"}>
                  {question.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <CopySlugButton slug={question.slug} />
                  <Button variant="ghost" size="sm" onClick={() => onEdit(question)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(question)}>
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