"use client";

import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { BlogForm, BlogFormData } from "@/components/blogs/BlogForm";
import { blogsApi, categoriesApi } from "@/lib/api";
import { Blog } from "@/types";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditBlogPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const { data: blogData, isLoading } = useQuery({
    queryKey: ["blog", id],
    queryFn: async () => {
      const response = await blogsApi.getById(id);
      return response.data.data;
    },
  });

  const { data: allBlogsData } = useQuery({
    queryKey: ["blogs-all"],
    queryFn: async () => {
      const response = await blogsApi.getPublished();
      return response.data.data;
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categoriesApi.getAll();
      return res.data.data;
    },
  });

  const allBlogs: Blog[] = allBlogsData?.blogs ?? [];

  const updateMutation = useMutation({
    mutationFn: (data: BlogFormData) => blogsApi.update(id, data),
    onSuccess: () => {
      toast.success("Blog updated successfully");
      router.push("/blogs");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <div>
        <Header title="Edit Blog" />
        <div className="p-6 text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Edit Blog" description={blogData?.title} />
      <div className="p-6 space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/blogs")}
          className="text-slate-600 hover:text-slate-900 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Blogs
        </Button>
        <BlogForm
          blog={blogData}
          existingBlogs={allBlogs}
          categories={categoriesData ?? []}
          onSubmit={async (data) => { await updateMutation.mutateAsync(data); }}
          isSubmitting={updateMutation.isPending}
          onCancel={() => router.push("/blogs")}
        />
      </div>
    </div>
  );
}