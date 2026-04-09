"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { NewsForm, NewsFormData } from "@/components/news/NewsForm";
import { newsApi } from "@/lib/api";
import { News } from "@/types";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewNewsPage() {
  const router = useRouter();

  const { data: allNewsData } = useQuery({
    queryKey: ["news-all"],
    queryFn: async () => {
      const response = await newsApi.getPublished();
      return response.data.data;
    },
  });

  const allNews: News[] = allNewsData?.news ?? [];

  const createMutation = useMutation({
    mutationFn: (data: NewsFormData) => newsApi.create(data),
    onSuccess: (res) => {
      toast.success("News created successfully");
      const newId = res.data.data._id;
      router.push(`/news/${newId}/edit`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <div>
      <Header title="New News" description="Create a new news article" />
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
          news={null}
          existingNews={allNews}
          onSubmit={async (data) => { await createMutation.mutateAsync(data); }}
          isSubmitting={createMutation.isPending}
          onCancel={() => router.push("/news")}
        />
      </div>
    </div>
  );
}