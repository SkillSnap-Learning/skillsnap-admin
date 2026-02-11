"use client";

import { Course } from "@/types";
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
import { Pencil, Trash2, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface CoursesTableProps {
  courses: Course[];
  isLoading: boolean;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
}

const subjectColors: Record<string, string> = {
  maths: "bg-blue-100 text-blue-700",
  science: "bg-green-100 text-green-700",
  english: "bg-purple-100 text-purple-700",
  social_science: "bg-orange-100 text-orange-700",
};

export function CoursesTable({ courses, isLoading, onEdit, onDelete }: CoursesTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-slate-500">No courses found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Chapters</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course._id}>
              <TableCell className="font-medium">{course.title}</TableCell>
              <TableCell>
                <Badge variant="outline">Class {course.class}</Badge>
              </TableCell>
              <TableCell>
                <Badge className={subjectColors[course.subject] || "bg-slate-100 text-slate-700"}>
                    {course.subject.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </TableCell>
              <TableCell>{course.totalChapters}</TableCell>
              <TableCell className="text-sm text-slate-500">
                {formatDistanceToNow(new Date(course.createdAt), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/chapters?courseId=${course._id}`}>
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(course)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(course)}>
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