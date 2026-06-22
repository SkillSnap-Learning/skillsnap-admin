"use client";

import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { CalculatorForm, CalculatorFormData } from "@/components/calculators/CalculatorForm";
import { calculatorsApi } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditCalculatorPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["calculator", id],
    queryFn: async () => {
      const res = await calculatorsApi.getById(id);
      return res.data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CalculatorFormData) => calculatorsApi.update(id, data as any),
    onSuccess: () => {
      toast.success("Calculator updated successfully");
      router.push("/calculators");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div>
        <Header title="Edit Calculator" />
        <div className="p-6 text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Edit Calculator" description={data?.heading} />
      <div className="p-6 space-y-6">
        <Button variant="ghost" onClick={() => router.push("/calculators")}
          className="text-muted-foreground hover:text-foreground -ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Calculators
        </Button>
        <CalculatorForm
          calculator={data}
          onSubmit={async (formData) => { await updateMutation.mutateAsync(formData); }}
          isSubmitting={updateMutation.isPending}
          onCancel={() => router.push("/calculators")}
        />
      </div>
    </div>
  );
}