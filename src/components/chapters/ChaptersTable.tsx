"use client";

import { Chapter, Course } from "@/types";
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
import { Pencil, Trash2, HelpCircle, Video, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface ChaptersTableProps {
  chapters: Chapter[];
  isLoading: boolean;
  onEdit: (chapter: Chapter) => void;
  onDelete: (chapter: Chapter) => void;
}

export function ChaptersTable({ chapters, isLoading, onEdit, onDelete }: ChaptersTableProps) {
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
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Chapter #</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Thresholds</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {chapters.map((chapter) => {
            const course = typeof chapter.courseId === 'object' ? chapter.courseId as Course : null;
            return (
              <TableRow key={chapter._id}>
                <TableCell>
                  <Badge variant="outline">Ch {chapter.chapterNumber}</Badge>
                </TableCell>
                <TableCell className="font-medium">{chapter.title}</TableCell>
                <TableCell className="text-sm">
                  {course ? `${course.title} (Class ${course.class})` : 'Unknown'}
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {chapter.videoDuration ? `${Math.floor(chapter.videoDuration / 60)}m` : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {chapter.videoUrl && (
                      <Badge variant="secondary" className="text-xs">
                        <Video className="h-3 w-3 mr-1" />
                        Video
                      </Badge>
                    )}
                    {chapter.notesUrl && (
                      <Badge variant="secondary" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        Notes
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-slate-500">
                  Watch: {chapter.minimumWatchPercentage}%<br />
                  Test: {chapter.minimumTestPercentage}%
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/questions?chapterId=${chapter._id}`}>
                      <Button variant="ghost" size="sm">
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(chapter)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(chapter)}>
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