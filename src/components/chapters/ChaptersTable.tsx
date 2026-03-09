"use client";

import { useState, Fragment } from "react";
import { Chapter } from "@/types";
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
import { Pencil, Trash2, ChevronRight, Upload } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { ChapterNotesUploadPanel } from "./ChapterNotesUploadPanel";

interface ChaptersTableProps {
  chapters: Chapter[];
  isLoading: boolean;
  planId: string;
  subjectId: string;
  onEdit: (chapter: Chapter) => void;
  onDelete: (chapter: Chapter) => void;
}

export function ChaptersTable({
  chapters,
  isLoading,
  planId,
  subjectId,
  onEdit,
  onDelete,
}: ChaptersTableProps) {
  const [uploadingChapterId, setUploadingChapterId] = useState<string | null>(null);

  const handleUpload = (chapter: Chapter) => {
    setUploadingChapterId((prev) =>
      prev === chapter._id ? null : chapter._id
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-slate-500">No chapters found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">No.</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Assessment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chapters.map((chapter) => (
              <Fragment key={chapter._id}>
                <TableRow>
                  <TableCell>
                    <Badge variant="outline">Ch {chapter.chapterNumber}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{chapter.title}</TableCell>
                  <TableCell className="text-sm text-slate-500 max-w-xs truncate">
                    {chapter.description || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        chapter.notesUrl
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }
                    >
                      {chapter.notesUrl ? "Uploaded" : "None"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        chapter.assessmentUrl
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }
                    >
                      {chapter.assessmentUrl ? "Uploaded" : "None"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        chapter.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-700"
                      }
                    >
                      {chapter.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {chapter.createdAt
                      ? formatDistanceToNow(new Date(chapter.createdAt), {
                          addSuffix: true,
                        })
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Upload Chapter Notes"
                        onClick={() => handleUpload(chapter)}
                        className={
                          uploadingChapterId === chapter._id
                            ? "bg-blue-50 text-blue-600"
                            : ""
                        }
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                      <Link
                        href={`/plans/${planId}/subjects/${subjectId}/chapters/${chapter._id}/topics`}
                      >
                        <Button variant="ghost" size="sm" title="View Topics">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(chapter)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(chapter)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Inline upload panel */}
                {uploadingChapterId === chapter._id && (
                  <TableRow key={`${chapter._id}-upload`}>
                    <TableCell colSpan={8} className="p-3 bg-slate-50">
                      <ChapterNotesUploadPanel
                        chapter={chapter}
                        subjectId={subjectId}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}