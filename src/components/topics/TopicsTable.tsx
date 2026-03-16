"use client";

import { Topic } from "@/types";
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
import { Pencil, Trash2, Video, FileText, Upload } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface TopicsTableProps {
  topics: Topic[];
  isLoading: boolean;
  onEdit: (topic: Topic) => void;
  onDelete: (topic: Topic) => void;
  onUpload: (topic: Topic) => void;
  uploadingTopicId?: string;
}

const videoStatusColors: Record<string, string> = {
  none: "bg-slate-100 text-slate-600",
  uploading: "bg-yellow-100 text-yellow-700",
  ready: "bg-green-100 text-green-700",
};

export function TopicsTable({
  topics,
  isLoading,
  onEdit,
  onDelete,
  onUpload,
  uploadingTopicId,
}: TopicsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-slate-500">No topics found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">No.</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Video</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Min Watch %</TableHead>
            <TableHead>Min Test %</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topics.map((topic) => (
            <TableRow key={topic._id}>
              <TableCell>
                <Badge variant="outline">T{topic.topicNumber}</Badge>
              </TableCell>
              <TableCell className="font-medium">{topic.title}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5 text-slate-400" />
                  <Badge
                    className={
                      videoStatusColors[topic.videoStatus] ||
                      videoStatusColors.none
                    }
                  >
                    {topic.videoStatus}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                {topic.notesUrl ? (
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-xs text-green-600">Uploaded</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">None</span>
                )}
              </TableCell>
              <TableCell>{topic.minimumWatchPercentage}%</TableCell>
              <TableCell>{topic.minimumTestPercentage}%</TableCell>
              <TableCell>
                <Badge
                  className={
                    topic.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-700"
                  }
                >
                  {topic.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-slate-500">
                {topic.createdAt
                    ? formatDistanceToNow(new Date(topic.createdAt), { addSuffix: true })
                    : "—"}
              </TableCell>
              <TableCell className="text-right">
            <div className="flex items-center justify-end gap-2">
                <Button
                variant="ghost"
                size="sm"
                title="Upload Content"
                onClick={() => onUpload(topic)}
                className={
                    uploadingTopicId === topic._id
                    ? "bg-blue-50 text-blue-600"
                    : ""
                }
                >
                <Upload className="h-4 w-4" />
                </Button>
                <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(topic)}
                >
                <Pencil className="h-4 w-4" />
                </Button>
                <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(topic)}
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