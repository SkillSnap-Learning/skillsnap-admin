"use client";

import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { NewsForm, NewsFormData } from "@/components/news/NewsForm";
import { newsApi } from "@/lib/api";
import { News } from "@/types";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditNewsPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const { data: newsData, isLoading } = useQuery({
    queryKey: ["news", id],
    queryFn: async () => {
      const response = await newsApi.getById(id);
      return response.data.data;
    },
  });

  const { data: allNewsData } = useQuery({
    queryKey: ["news-all"],
    queryFn: async () => {
      const response = await newsApi.getPublished();
      return response.data.data;
    },
  });

  const allNews: News[] = allNewsData?.news ?? [];

  const updateMutation = useMutation({
    mutationFn: (data: NewsFormData) => newsApi.update(id, data),
    onSuccess: () => {
      toast.success("News updated successfully");
      router.push("/news");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <div>
        <Header title="Edit News" />
        <div className="p-6 text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Edit News" description={newsData?.title} />
      <div className="p-6 space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/news")}
          className="text-slate-600 hover:text-slate-900 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to News
        </Button>
        <NewsForm
          news={newsData}
          existingNews={allNews}
          onSubmit={async (data) => { await updateMutation.mutateAsync(data); }}
          isSubmitting={updateMutation.isPending}
          onCancel={() => router.push("/news")}
        />
      </div>
    </div>
  );
}