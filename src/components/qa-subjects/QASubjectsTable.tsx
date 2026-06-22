"use client";

import { QASubject } from "@/types";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface QASubjectsTableProps {
  subjects: QASubject[];
  isLoading: boolean;
  onEdit: (subject: QASubject) => void;
  onDelete: (subject: QASubject) => void;
}

export function QASubjectsTable({ subjects, isLoading, onEdit, onDelete }: QASubjectsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No subjects found</p>
        <p className="text-sm text-muted-foreground/60 mt-1">Add a subject to get started</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Icon</TableHead>
            <TableHead>Classes</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.map((subject, index) => (
            <TableRow key={subject._id}>
              <TableCell className="text-muted-foreground text-sm">{index + 1}</TableCell>
              <TableCell className="font-medium">{subject.name}</TableCell>
              <TableCell className="text-lg">{subject.icon || "—"}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {subject.classLevels.sort().map((cls) => (
                    <Badge key={cls} className="bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 text-xs">
                      Class {cls}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{subject.order}</TableCell>
              <TableCell>
                <Badge className={subject.isActive ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" : "bg-muted text-muted-foreground"}>
                  {subject.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(subject)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(subject)}>
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