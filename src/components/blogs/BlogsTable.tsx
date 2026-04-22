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
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { Blog } from "@/types";
import { formatDate } from "@/lib/utils";

interface BlogsTableProps {
  blogs: Blog[];
  isLoading: boolean;
  onEdit: (blog: Blog) => void;
  onDelete: (blog: Blog) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  featured: "bg-blue-100 text-blue-700",
  new: "bg-green-100 text-green-700",
  hot: "bg-orange-100 text-orange-700",
};

export function BlogsTable({ blogs, isLoading, onEdit, onDelete }: BlogsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 p-8 text-center text-slate-500">
        Loading blogs...
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 p-8 text-center text-slate-500">
        No blogs found.
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
          {blogs.map((blog) => (
            <TableRow key={blog._id}>
              {/* Title + Excerpt */}
              <TableCell className="max-w-[260px]">
                <p className="font-medium text-slate-900 truncate">{blog.title}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{blog.excerpt}</p>
                <p className="text-xs text-slate-400 mt-0.5">/{blog.slug}</p>
              </TableCell>

              {/* Category */}
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${CATEGORY_COLORS[blog.category] ?? "bg-slate-100 text-slate-700"}`}
                >
                   {typeof blog.category === "object" ? blog.category.name : blog.category}
                </span>
              </TableCell>

              {/* Published Status */}
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    blog.isPublished
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {blog.isPublished ? "Published" : "Draft"}
                </span>
              </TableCell>

              {/* Tags */}
              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-[160px]">
                  {blog.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                  {blog.tags.length > 2 && (
                    <span className="text-xs text-slate-400">
                      +{blog.tags.length - 2}
                    </span>
                  )}
                </div>
              </TableCell>

              {/* Read Time */}
              <TableCell className="text-sm text-slate-600">
                {blog.readTime ?? "—"}
              </TableCell>

              {/* Published At */}
              <TableCell className="text-sm text-slate-600">
                {blog.publishedAt ? formatDate(blog.publishedAt) : "—"}
              </TableCell>

              {/* Created At */}
              <TableCell className="text-sm text-slate-600">
                {blog.createdAt ? formatDate(blog.createdAt) : "—"}
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(blog)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(blog)}
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