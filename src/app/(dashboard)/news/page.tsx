"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { NewsTable } from "@/components/news/NewsTable";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { newsApi } from "@/lib/api";
import { News } from "@/types";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";

export default function NewsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [publishedFilter, setPublishedFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const queryParams: Record<string, unknown> = { page, limit: 10 };
  if (search) queryParams.search = search;
  if (categoryFilter !== "all") queryParams.category = categoryFilter;
  if (publishedFilter !== "all")
    queryParams.isPublished = publishedFilter === "published";

  const { data, isLoading } = useQuery({
    queryKey: ["news", queryParams],
    queryFn: async () => {
      const response = await newsApi.getAll(queryParams);
      return response.data.data;
    },
  });

  const newsList: News[] = data?.news ?? [];
  const pagination = data?.pagination ?? {
    page: 1, total: 0, totalPages: 1, limit: 10,
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => newsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news"] });
      setDeleteDialogOpen(false);
      setSelectedNews(null);
      toast.success("News deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <div>
      <Header title="News" description="Manage news articles" />

      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search news..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(val) => { setCategoryFilter(val); setPage(1); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
              </SelectContent>
            </Select>
            <Select value={publishedFilter} onValueChange={(val) => { setPublishedFilter(val); setPage(1); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => router.push("/news/new")}
            className="bg-blue-950 hover:bg-blue-900"
          >
            <Plus className="h-4 w-4 mr-2" />
            New News
          </Button>
        </div>

        <NewsTable
          news={newsList}
          isLoading={isLoading}
          onEdit={(news) => router.push(`/news/${news._id}/edit`)}
          onDelete={(news) => { setSelectedNews(news); setDeleteDialogOpen(true); }}
        />

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={setPage}
        />
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete News"
        description={`Are you sure you want to delete "${selectedNews?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={() => { if (selectedNews) deleteMutation.mutate(selectedNews._id); }}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}