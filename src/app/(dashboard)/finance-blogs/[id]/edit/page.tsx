"use client";

import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { FinanceBlogForm, FinanceBlogFormData } from "@/components/finance/FinanceBlogForm";
import { financeBlogsApi, financeCategoriesApi } from "@/lib/api";
import { FinanceBlog } from "@/types";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditFinanceBlogPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const { data: blogData, isLoading } = useQuery({
    queryKey: ["finance-blog", id],
    queryFn: async () => {
      const res = await financeBlogsApi.getById(id);
      return res.data.data as FinanceBlog;
    },
  });

  const { data: allBlogsData } = useQuery({
    queryKey: ["finance-blogs-all"],
    queryFn: async () => {
      const res = await financeBlogsApi.getPublished();
      return res.data.data;
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["finance-categories"],
    queryFn: async () => {
      const res = await financeCategoriesApi.getAll();
      return res.data.data;
    },
  });

  const allBlogs: FinanceBlog[] = allBlogsData?.blogs ?? [];

  const updateMutation = useMutation({
    mutationFn: (data: FinanceBlogFormData) => financeBlogsApi.update(id, data as any),
    onSuccess: () => {
      toast.success("Blog updated");
      router.push("/finance-blogs");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return (
    <div><Header title="Edit Finance Blog" /><div className="p-6 text-slate-500">Loading...</div></div>
  );

  return (
    <div>
      <Header title="Edit Finance Blog" description={blogData?.title} />
      <div className="p-6 space-y-6">
        <Button variant="ghost" onClick={() => router.push("/finance-blogs")}
          className="text-muted-foreground hover:text-slate-900 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Finance Blogs
        </Button>
        <FinanceBlogForm
          blog={blogData}
          existingBlogs={allBlogs}
          categories={categoriesData ?? []}
          onSubmit={async (data) => { await updateMutation.mutateAsync(data); }}
          isSubmitting={updateMutation.isPending}
          onCancel={() => router.push("/finance-blogs")}
        />
      </div>
    </div>
  );
}