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
import { TextTooltip } from "../ui/text-tooltip";

interface BlogsTableProps {
  blogs: Blog[];
  isLoading: boolean;
  onEdit: (blog: Blog) => void;
  onDelete: (blog: Blog) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  featured: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  new: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  hot: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
};

export function BlogsTable({ blogs, isLoading, onEdit, onDelete }: BlogsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
        Loading blogs...
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
        No blogs found.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Read Time</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead>Published At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {blogs.map((blog) => (
            <TableRow key={blog._id}>
              {/* Title + Excerpt */}
              <TableCell className="max-w-[260px]">
                <TextTooltip text={blog.title}>
                  <p className="font-medium text-foreground truncate">{blog.title}</p>
                </TextTooltip>
                <TextTooltip text={blog.excerpt}>
                  <p className="text-xs text-muted-foreground/60 truncate mt-0.5">{blog.excerpt}</p>
                </TextTooltip>
                <TextTooltip text={`/${blog.slug}`}>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">/{blog.slug}</p>
                </TextTooltip>
              </TableCell>

              {/* Category */}
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${CATEGORY_COLORS[typeof blog.category === "object" ? blog.category.slug : String(blog.category)] ?? "bg-muted text-foreground"}`}
                >
                   {typeof blog.category === "object" ? blog.category.name : blog.category}
                </span>
              </TableCell>

              {/* Published Status */}
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    blog.isPublished
                      ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
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
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                  {blog.tags.length > 2 && (
                    <span className="text-xs text-muted-foreground/60">
                      +{blog.tags.length - 2}
                    </span>
                  )}
                </div>
              </TableCell>

              {/* Read Time */}
              <TableCell className="text-sm text-muted-foreground">
                {blog.readTime ?? "—"}
              </TableCell>

              {/* Created At */}
              <TableCell className="text-sm text-muted-foreground">
                {blog.createdAt ? formatDate(blog.createdAt) : "—"}
              </TableCell>

              {/* Updated At */}
              <TableCell className="text-sm text-muted-foreground">
                {blog.updatedAt ? formatDate(blog.updatedAt) : "—"}
              </TableCell>

              {/* Published At */}
              <TableCell className="text-sm text-muted-foreground">
                {blog.publishedAt ? formatDate(blog.publishedAt) : "—"}
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
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 dark:hover:text-red-400"
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