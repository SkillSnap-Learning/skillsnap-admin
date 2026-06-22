"use client";

import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Course } from "@/types";
import { formatDate } from "@/lib/utils";

interface CoursesTableProps {
  courses: Course[];
  isLoading: boolean;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
}

const PLAN_COLORS: Record<string, string> = {
  core: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  achiever: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  "future-plus": "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
};

const PLAN_LABELS: Record<string, string> = {
  core: "Core",
  achiever: "Achiever",
  "future-plus": "Future Plus",
};

export function CoursesTable({ courses, isLoading, onEdit, onDelete }: CoursesTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
        Loading courses...
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
        No courses found. Create your first course.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Title</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Plan Type</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Subjects</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course._id}>
              <TableCell className="max-w-[220px]">
                <p className="font-medium text-foreground truncate">{course.title}</p>
                {course.tagline && (
                  <p className="text-xs text-muted-foreground/60 truncate mt-0.5">{course.tagline}</p>
                )}
                <p className="text-xs text-muted-foreground/60 mt-0.5">/{course.slug}</p>
              </TableCell>

              <TableCell>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
                  Class {course.class}
                </span>
              </TableCell>

              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PLAN_COLORS[course.planType] ?? "bg-muted text-foreground"}`}>
                  {PLAN_LABELS[course.planType] ?? course.planType}
                </span>
              </TableCell>

              <TableCell>
                <p className="text-sm font-medium text-foreground">₹{course.price.toLocaleString()}</p>
                {course.originalPrice > course.price && (
                  <p className="text-xs text-muted-foreground/60 line-through">₹{course.originalPrice.toLocaleString()}</p>
                )}
              </TableCell>

              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-[160px]">
                  {course.subjectTags.slice(0, 2).map((tag) => (
                    <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-50 text-green-700">
                      {tag}
                    </span>
                  ))}
                  {course.subjectTags.length > 2 && (
                    <span className="text-xs text-muted-foreground/60">+{course.subjectTags.length - 2}</span>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${course.isPublished ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" : "bg-muted text-muted-foreground"}`}>
                  {course.isPublished ? "Published" : "Draft"}
                </span>
              </TableCell>

              <TableCell className="text-sm text-muted-foreground">
                {course.createdAt ? formatDate(course.createdAt) : "—"}
              </TableCell>

              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(course)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(course)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
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