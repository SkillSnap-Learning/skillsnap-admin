"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { BlogsTable } from "@/components/blogs/BlogsTable";
import { BlogModal, BlogFormData } from "@/components/blogs/BlogModal";
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
import { blogsApi } from "@/lib/api";
import { Blog } from "@/types";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";

export default function BlogsPage() {
  const queryClient = useQueryClient();

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [publishedFilter, setPublishedFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Modal states
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Build query params
  const queryParams: Record<string, unknown> = { page, limit: 10 };
  if (search) queryParams.search = search;
  if (categoryFilter !== "all") queryParams.category = categoryFilter;
  if (publishedFilter !== "all")
    queryParams.isPublished = publishedFilter === "published";

  // Fetch blogs
  const { data, isLoading } = useQuery({
    queryKey: ["blogs", queryParams],
    queryFn: async () => {
      console.log('queryParams for blogs: ', queryParams)
      const response = await blogsApi.getAll(queryParams);
      return response.data.data;
    },
  });

  // Fetch all published blogs for related posts picker
  const { data: allBlogsData } = useQuery({
    queryKey: ["blogs-all"],
    queryFn: async () => {
      const response = await blogsApi.getPublished();
      return response.data.data;
    },
  });

  const blogs: Blog[] = data?.blogs ?? [];
  const pagination = data?.pagination ?? {
    page: 1,
    total: 0,
    totalPages: 1,
    limit: 10,
  };
  const allBlogs: Blog[] = allBlogsData?.blogs ?? [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: BlogFormData) => blogsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      setBlogModalOpen(false);
      toast.success("Blog created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BlogFormData }) =>
      blogsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      setBlogModalOpen(false);
      setSelectedBlog(null);
      toast.success("Blog updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      setDeleteDialogOpen(false);
      setSelectedBlog(null);
      toast.success("Blog deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Handlers
  const handleCreate = () => {
    setSelectedBlog(null);
    setBlogModalOpen(true);
  };

  const handleEdit = async (blog: Blog) => {
    try {
      const response = await blogsApi.getById(blog._id);
      setSelectedBlog(response.data.data);
    } catch (e) {
      toast.error("Failed to load blog");
      return;
    }
    setBlogModalOpen(true);
  };

  const handleDelete = (blog: Blog) => {
    setSelectedBlog(blog);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: BlogFormData) => {
    if (selectedBlog) {
      await updateMutation.mutateAsync({ id: selectedBlog._id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedBlog) {
      deleteMutation.mutate(selectedBlog._id);
    }
  };

  return (
    <div>
      <Header title="Blogs" description="Manage blog posts" />

      <div className="p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search blogs..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select
              value={categoryFilter}
              onValueChange={(val) => {
                setCategoryFilter(val);
                setPage(1);
              }}
            >
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

            {/* Published Filter */}
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
          </div>

          {/* Create Button */}
          <Button
            onClick={handleCreate}
            className="bg-blue-950 hover:bg-blue-900"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Blog
          </Button>
        </div>

        {/* Table */}
        <BlogsTable
          blogs={blogs}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={setPage}
        />
      </div>

      {/* Blog Modal */}
      <BlogModal
        open={blogModalOpen}
        onOpenChange={setBlogModalOpen}
        blog={selectedBlog}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        existingBlogs={allBlogs}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Blog"
        description={`Are you sure you want to delete "${selectedBlog?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}