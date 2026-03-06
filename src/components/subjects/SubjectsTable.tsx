"use client";

import { Subject } from "@/types";
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
import { Pencil, Trash2, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface SubjectsTableProps {
  subjects: Subject[];
  isLoading: boolean;
  planId: string;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
}

const subjectColors: Record<string, string> = {
  maths: "bg-blue-100 text-blue-700",
  science: "bg-green-100 text-green-700",
  english: "bg-purple-100 text-purple-700",
  social_science: "bg-orange-100 text-orange-700",
  coding: "bg-pink-100 text-pink-700",
  life_skills: "bg-teal-100 text-teal-700",
  general: "bg-slate-100 text-slate-700",
};

export function SubjectsTable({
  subjects,
  isLoading,
  planId,
  onEdit,
  onDelete,
}: SubjectsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-slate-500">No subjects found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.map((subject) => (
            <TableRow key={subject._id}>
              <TableCell>
                <Badge
                  className={
                    subjectColors[subject.name] || "bg-slate-100 text-slate-700"
                  }
                >
                  {subject.name
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">Class {subject.class}</Badge>
              </TableCell>
              <TableCell className="text-sm text-slate-500 max-w-xs truncate">
                {subject.description || "—"}
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    subject.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-700"
                  }
                >
                  {subject.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-slate-500">
                {subject.createdAt
                    ? formatDistanceToNow(new Date(subject.createdAt), { addSuffix: true })
                    : "—"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/plans/${planId}/subjects/${subject._id}/chapters`}
                  >
                    <Button variant="ghost" size="sm" title="View Chapters">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(subject)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(subject)}
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