"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Copy, Check } from "lucide-react";
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
  cbse: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  ncert: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  mcqs: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  worksheet: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  english: "bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400",
};

function SlugCell({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="mt-1 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted hover:bg-muted/80 transition-colors cursor-pointer max-w-fit"
      title="Copy slug"
    >
      <span className="text-xs text-muted-foreground font-mono break-all">
        /{slug}
      </span>
      {copied ? (
        <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
      ) : (
        <Copy className="h-3 w-3 text-muted-foreground/60 flex-shrink-0" />
      )}
    </button>
  );
}

export function ResourcePagesTable({
  pages,
  isLoading,
  onEdit,
  onDelete,
}: ResourcePagesTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
        Loading pages...
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
        No pages found.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Title</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.map((page) => (
            <TableRow key={page._id}>
              <TableCell className="max-w-[320px]">
                <p className="font-medium text-foreground truncate">{page.title}</p>
                <SlugCell slug={page.slug} />
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${
                    SECTION_COLORS[page.section] ?? "bg-muted text-foreground"
                  }`}
                >
                  {page.section}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    page.isPublished
                      ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {page.isPublished ? "Published" : "Draft"}
                </span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {page.createdAt ? formatDate(page.createdAt) : "—"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
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
