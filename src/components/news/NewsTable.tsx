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
import { News } from "@/types";
import { formatDate } from "@/lib/utils";

interface NewsTableProps {
  news: News[];
  isLoading: boolean;
  onEdit: (news: News) => void;
  onDelete: (news: News) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  featured: "bg-blue-100 text-blue-700",
  new: "bg-green-100 text-green-700",
  hot: "bg-orange-100 text-orange-700",
};

export function NewsTable({ news, isLoading, onEdit, onDelete }: NewsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 p-8 text-center text-slate-500">
        Loading news...
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 p-8 text-center text-slate-500">
        No news found.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Read Time</TableHead>
            <TableHead>Published At</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {news.map((item) => (
            <TableRow key={item._id}>
              <TableCell className="max-w-[260px]">
                <p className="font-medium text-slate-900 truncate">{item.title}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{item.excerpt}</p>
                <p className="text-xs text-slate-400 mt-0.5">/{item.slug}</p>
              </TableCell>

              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${CATEGORY_COLORS[item.category] ?? "bg-slate-100 text-slate-700"}`}>
                  {item.category}
                </span>
              </TableCell>

              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.isPublished ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                  {item.isPublished ? "Published" : "Draft"}
                </span>
              </TableCell>

              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-[160px]">
                  {item.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 2 && (
                    <span className="text-xs text-slate-400">+{item.tags.length - 2}</span>
                  )}
                </div>
              </TableCell>

              <TableCell className="text-sm text-slate-600">
                {item.readTime ?? "—"}
              </TableCell>

              <TableCell className="text-sm text-slate-600">
                {item.publishedAt ? formatDate(item.publishedAt) : "—"}
              </TableCell>

              <TableCell className="text-sm text-slate-600">
                {item.createdAt ? formatDate(item.createdAt) : "—"}
              </TableCell>

              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item)}
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