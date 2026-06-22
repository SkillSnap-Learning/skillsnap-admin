"use client";

import { NotificationTemplate } from "@/types";
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
import { Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TemplatesTableProps {
  templates: NotificationTemplate[];
  isLoading: boolean;
  onEdit: (template: NotificationTemplate) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

const typeLabels: Record<string, string> = {
  achievement: "Achievement",
  reminder: "Reminder",
  announcement: "Announcement",
  instructor_reply: "Instructor Reply",
  chapter_unlocked: "Chapter Unlocked",
  test_passed: "Test Passed",
  child_test_passed: "Child Test Passed",
  child_chapter_unlocked: "Child Chapter Unlocked",
  weekly_progress: "Weekly Progress",
  parent_announcement: "Parent Announcement",
};

const typeColors: Record<string, string> = {
  achievement: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  reminder: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
  announcement: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  instructor_reply: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  chapter_unlocked: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
  test_passed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  child_test_passed: "bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400",
  child_chapter_unlocked: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  weekly_progress: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  parent_announcement: "bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
};

export function TemplatesTable({ templates, isLoading, onEdit, onToggleActive }: TemplatesTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No templates found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template._id}>
              <TableCell>
                <Badge className={typeColors[template.type]}>
                  {typeLabels[template.type]}
                </Badge>
              </TableCell>
              <TableCell className="font-medium max-w-xs truncate">
                {template.title}
              </TableCell>
              <TableCell className="max-w-md truncate text-sm text-muted-foreground">
                {template.message}
              </TableCell>
              <TableCell>
                <Badge variant={template.isActive ? "default" : "secondary"}>
                  {template.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleActive(template._id, !template.isActive)}
                  >
                    {template.isActive ? (
                      <ToggleRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 text-muted-foreground/60" />
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(template)}>
                    <Pencil className="h-4 w-4" />
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