"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ResourcePage {
  _id: string;
  slug: string;
  section: string;
  title: string;
  isPublished: boolean;
  createdAt: string;
  createdBy?: { name: string; email: string };
}

interface ResourcePagesTableProps {
  pages: ResourcePage[];
  isLoading: boolean;
  onEdit: (page: ResourcePage) => void;
  onDelete: (page: ResourcePage) => void;
}

const SECTION_COLORS: Record<string, string> = {
  cbse: "bg-blue-100 text-blue-700",
  ncert: "bg-green-100 text-green-700",
  mcqs: "bg-orange-100 text-orange-700",
  worksheet: "bg-purple-100 text-purple-700",
  english: "bg-pink-100 text-pink-700",
};

export function ResourcePagesTable({
  pages,
  isLoading,
  onEdit,
  onDelete,
}: ResourcePagesTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 p-8 text-center text-slate-500">
        Loading pages...
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 p-8 text-center text-slate-500">
        No pages found.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead>Title</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.map((page) => (
            <TableRow key={page._id}>
              <TableCell className="max-w-[240px]">
                <p className="font-medium text-slate-900 truncate">{page.title}</p>
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${
                    SECTION_COLORS[page.section] ?? "bg-slate-100 text-slate-700"
                  }`}
                >
                  {page.section}
                </span>
              </TableCell>
              <TableCell className="max-w-[240px]">
                <p className="text-xs text-slate-500 font-mono truncate">/{page.slug}</p>
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    page.isPublished
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {page.isPublished ? "Published" : "Draft"}
                </span>
              </TableCell>
              <TableCell className="text-sm text-slate-600">
                {page.createdAt ? formatDate(page.createdAt) : "—"}
              </TableCell>
              <TableCell className="text-sm text-slate-600">  {/* ← add this */}
                {page.createdBy?.name ?? "—"}
                </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(page)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(page)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
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