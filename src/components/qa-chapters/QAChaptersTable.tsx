"use client";

import { QAChapter, QASubject } from "@/types";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface QAChaptersTableProps {
  chapters: QAChapter[];
  isLoading: boolean;
  onEdit: (chapter: QAChapter) => void;
  onDelete: (chapter: QAChapter) => void;
}

export function QAChaptersTable({ chapters, isLoading, onEdit, onDelete }: QAChaptersTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-slate-500">No chapters found</p>
        <p className="text-sm text-slate-400 mt-1">Add a chapter or adjust filters</p>
      </div>
    );
  }

  const getSubjectName = (subject: QAChapter["subject"]) => {
    if (typeof subject === "object" && subject !== null) {
      return (subject as QASubject).name;
    }
    return "—";
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Chapter Name</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {chapters.map((chapter, index) => (
            <TableRow key={chapter._id}>
              <TableCell className="text-slate-500 text-sm">{index + 1}</TableCell>
              <TableCell className="font-medium">{chapter.name}</TableCell>
              <TableCell className="text-sm">{getSubjectName(chapter.subject)}</TableCell>
              <TableCell>
                <Badge className="bg-blue-100 text-blue-700">
                  Class {chapter.classLevel}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-slate-500">{chapter.order}</TableCell>
              <TableCell>
                <Badge className={chapter.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}>
                  {chapter.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(chapter)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(chapter)}>
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