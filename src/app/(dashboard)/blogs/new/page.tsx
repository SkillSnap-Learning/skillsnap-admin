"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { BlogForm, BlogFormData } from "@/components/blogs/BlogForm";
import { blogsApi, categoriesApi } from "@/lib/api";
import { Blog } from "@/types";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewBlogPage() {
  const router = useRouter();

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

  const createMutation = useMutation({
    mutationFn: (data: BlogFormData) => blogsApi.create(data),
    onSuccess: (res) => {
      toast.success("Blog created successfully");
      const newId = res.data.data._id;
      // Redirect to edit page so cover/image uploads work immediately
      router.push(`/blogs/${newId}/edit`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <div>
      <Header title="New Blog" description="Create a new blog post" />
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
          blog={null}
          existingBlogs={allBlogs}
          categories={categoriesData ?? []}
          onSubmit={async (data) => { await createMutation.mutateAsync(data); }}
          isSubmitting={createMutation.isPending}
          onCancel={() => router.push("/blogs")}
        />
      </div>
    </div>
  );
}