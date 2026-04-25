"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { ResourcePageForm, ResourcePageFormData } from "@/components/resource-pages/ResourcePageForm";
import { resourcePagesApi } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewResourcePagePage() {
  const router = useRouter();

  const createMutation = useMutation({
    mutationFn: (data: ResourcePageFormData) => resourcePagesApi.create(data as unknown as Record<string, unknown>),
    onSuccess: (res) => {
      toast.success("Page created successfully");
      const newId = res.data.data._id;
      router.push(`/resource-pages/${newId}/edit`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <div>
      <Header title="New Resource Page" description="Create a new study resource page" />
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
          page={null}
          onSubmit={async (data) => { await createMutation.mutateAsync(data); }}
          isSubmitting={createMutation.isPending}
          onCancel={() => router.push("/resource-pages")}
        />
      </div>
    </div>
  );
}