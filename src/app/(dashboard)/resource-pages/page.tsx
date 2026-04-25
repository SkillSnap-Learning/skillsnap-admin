"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { ResourcePagesTable } from "@/components/resource-pages/ResourcePagesTable";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { resourcePagesApi } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";

interface ResourcePage {
  _id: string;
  slug: string;
  section: string;
  title: string;
  isPublished: boolean;
  createdAt: string;
}

const SECTIONS = [
  { value: "cbse", label: "CBSE" },
  { value: "ncert", label: "NCERT" },
  { value: "mcqs", label: "MCQs" },
  { value: "worksheet", label: "Worksheet" },
  { value: "english", label: "English" },
];

export default function ResourcePagesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [publishedFilter, setPublishedFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedPage, setSelectedPage] = useState<ResourcePage | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const queryParams: Record<string, unknown> = { page, limit: 20 };
  if (search) queryParams.search = search;
  if (sectionFilter !== "all") queryParams.section = sectionFilter;
  if (publishedFilter !== "all")
    queryParams.isPublished = publishedFilter === "published";

  const { data, isLoading } = useQuery({
    queryKey: ["resource-pages", queryParams],
    queryFn: async () => {
      const response = await resourcePagesApi.getAll(queryParams);
      return response.data.data;
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ["resource-pages-stats"],
    queryFn: async () => {
      const [published, drafts] = await Promise.all([
        resourcePagesApi.getAll({ isPublished: true, limit: 1 }),
        resourcePagesApi.getAll({ isPublished: false, limit: 1 }),
      ]);
      return {
        published: published.data.data.pagination.total,
        drafts: drafts.data.data.pagination.total,
      };
    },
  });

  const pages: ResourcePage[] = data?.pages ?? [];
  const pagination = data?.pagination ?? {
    page: 1,
    total: 0,
    totalPages: 1,
    limit: 20,
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => resourcePagesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resource-pages"] });
      setDeleteDialogOpen(false);
      setSelectedPage(null);
      toast.success("Page deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <div>
      <Header
        title="Resource Pages"
        description="Manage study resource pages"
      />

      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by title or slug..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={sectionFilter}
              onValueChange={(val) => {
                setSectionFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Sections" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {SECTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={publishedFilter}
              onValueChange={(val) => {
                setPublishedFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            {/* Stats */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-700">
                  {statsData?.published ?? "—"} Published
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span className="text-sm font-medium text-slate-600">
                  {statsData?.drafts ?? "—"} Drafts
                </span>
              </div>
            </div>
          </div>
          <Button
            onClick={() => router.push("/resource-pages/new")}
            className="bg-blue-950 hover:bg-blue-900"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Page
          </Button>
        </div>

        <ResourcePagesTable
          pages={pages}
          isLoading={isLoading}
          onEdit={(p) => router.push(`/resource-pages/${p._id}/edit`)}
          onDelete={(p) => {
            setSelectedPage(p);
            setDeleteDialogOpen(true);
          }}
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
        title="Delete Page"
        description={`Are you sure you want to delete "${selectedPage?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={() => {
          if (selectedPage) deleteMutation.mutate(selectedPage._id);
        }}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
