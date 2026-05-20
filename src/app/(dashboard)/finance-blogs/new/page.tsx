"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { FinanceBlogForm, FinanceBlogFormData } from "@/components/finance/FinanceBlogForm";
import { financeBlogsApi, financeCategoriesApi } from "@/lib/api";
import { FinanceBlog } from "@/types";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewFinanceBlogPage() {
  const router = useRouter();

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

  const createMutation = useMutation({
    mutationFn: (data: FinanceBlogFormData) => financeBlogsApi.create(data as any),
    onSuccess: (res) => {
      toast.success("Blog created");
      router.push(`/finance-blogs/${res.data.data._id}/edit`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <Header title="New Finance Blog" description="Create a new article for SkillSnap Finance" />
      <div className="p-6 space-y-6">
        <Button variant="ghost" onClick={() => router.push("/finance-blogs")}
          className="text-slate-600 hover:text-slate-900 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Finance Blogs
        </Button>
        <FinanceBlogForm
          blog={null}
          existingBlogs={allBlogs}
          categories={categoriesData ?? []}
          onSubmit={async (data) => { await createMutation.mutateAsync(data); }}
          isSubmitting={createMutation.isPending}
          onCancel={() => router.push("/finance-blogs")}
        />
      </div>
    </div>
  );
}