"use client";

import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { ResourcePageForm, ResourcePageFormData } from "@/components/resource-pages/ResourcePageForm";
import { resourcePagesApi } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditResourcePagePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const { data: pageData, isLoading } = useQuery({
    queryKey: ["resource-page", id],
    queryFn: async () => {
      const response = await resourcePagesApi.getById(id);
      return response.data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ResourcePageFormData) => resourcePagesApi.update(id, data),
    onSuccess: () => {
      toast.success("Page updated successfully");
      router.push("/resource-pages");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <div>
        <Header title="Edit Resource Page" />
        <div className="p-6 text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Edit Resource Page" description={pageData?.title} />
      <div className="p-6 space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/resource-pages")}
          className="text-slate-600 hover:text-slate-900 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Resource Pages
        </Button>
        <ResourcePageForm
          page={pageData}
          onSubmit={async (data) => { await updateMutation.mutateAsync(data); }}
          isSubmitting={updateMutation.isPending}
          onCancel={() => router.push("/resource-pages")}
        />
      </div>
    </div>
  );
}