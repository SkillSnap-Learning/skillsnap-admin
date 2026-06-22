"use client";

import { Subject } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface SubjectsTableProps {
  subjects: Subject[];
  isLoading: boolean;
  planId: string;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
}

const subjectColors: Record<string, { badge: string; dot: string }> = {
  maths: { badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400", dot: "bg-blue-500" },
  science: { badge: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400", dot: "bg-green-500" },
  english: { badge: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400", dot: "bg-purple-500" },
  social_science: { badge: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400", dot: "bg-orange-500" },
  coding: { badge: "bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400", dot: "bg-pink-500" },
  life_skills: { badge: "bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400", dot: "bg-teal-500" },
  general: { badge: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
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
      <div className="bg-card rounded-xl border">
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-10 flex-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="bg-card rounded-xl border p-12 text-center">
        <p className="text-muted-foreground">No subjects found</p>
        <p className="text-sm text-muted-foreground/60 mt-1">Add subjects for this plan</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Subject
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Class
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                Description
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                Status
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                Created
              </th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {subjects.map((subject) => {
              const colors = subjectColors[subject.name] ?? subjectColors.general;
              const label = subject.name.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());

              return (
                <tr key={subject._id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${colors.dot}`} />
                      <span className="font-medium text-foreground">{label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs">Class {subject.class}</Badge>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
                      {subject.description || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={
                        subject.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {subject.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {subject.createdAt
                        ? formatDistanceToNow(new Date(subject.createdAt), { addSuffix: true })
                        : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/plans/${planId}/subjects/${subject._id}/chapters`}>
                        <Button variant="ghost" size="sm" title="View Chapters" className="h-8 w-8 p-0">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(subject)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(subject)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
