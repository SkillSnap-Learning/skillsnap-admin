"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { financeBlogsApi } from "@/lib/api";
import { FinanceBlog } from "@/types";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, ExternalLink } from "lucide-react";

export default function FinanceBlogsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [publishedFilter, setPublishedFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<FinanceBlog | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const params: Record<string, unknown> = { page, limit: 10 };
  if (search) params.search = search;
  if (publishedFilter !== "all") params.isPublished = publishedFilter === "published";

  const { data, isLoading } = useQuery({
    queryKey: ["finance-blogs", params],
    queryFn: async () => {
      const res = await financeBlogsApi.getAll(params);
      return res.data.data;
    },
  });

  const blogs: FinanceBlog[] = data?.blogs ?? [];
  const pagination = data?.pagination ?? { page: 1, total: 0, totalPages: 1, limit: 10 };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeBlogsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-blogs"] });
      setDeleteOpen(false);
      setSelected(null);
      toast.success("Blog deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <Header title="Finance Blogs" description="Manage articles for SkillSnap Finance" />
      <div className="p-6 space-y-6">

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search blogs..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-10" />
            </div>
            <Select value={publishedFilter} onValueChange={val => { setPublishedFilter(val); setPage(1); }}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => router.push("/finance-blogs/new")} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" /> New Blog
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-slate-500 font-semibold">Title</th>
                <th className="text-left px-4 py-3 text-slate-500 font-semibold">Slug</th>
                <th className="text-left px-4 py-3 text-slate-500 font-semibold">Category</th>
                <th className="text-left px-4 py-3 text-slate-500 font-semibold">Status</th>
                <th className="text-right px-4 py-3 text-slate-500 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : blogs.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No blogs yet</td></tr>
              ) : blogs.map(blog => (
                <tr key={blog._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-xs truncate">{blog.title}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{blog.slug}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {typeof blog.category === "object" ? blog.category.name : blog.category}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${blog.isPublished ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {blog.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <a href={`http://localhost:3000/${typeof blog.category === "object" ? blog.category.slug : "blog"}/${blog.slug}`}
                        target="_blank" rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded" title="Preview">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button onClick={() => router.push(`/finance-blogs/${blog._id}/edit`)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => { setSelected(blog); setDeleteOpen(true); }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`px-3 py-1.5 rounded text-sm font-medium ${p === page ? "bg-blue-950 text-white" : "bg-white border border-slate-200 text-muted-foreground hover:bg-slate-50"}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Blog"
        description={`Delete "${selected?.title}"? This cannot be undone.`}
        confirmText="Delete"
        onConfirm={() => { if (selected) deleteMutation.mutate(selected._id); }}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}