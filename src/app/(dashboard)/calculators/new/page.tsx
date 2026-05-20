"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { CalculatorForm, CalculatorFormData } from "@/components/calculators/CalculatorForm";
import { calculatorsApi } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewCalculatorPage() {
  const router = useRouter();

  const createMutation = useMutation({
    mutationFn: (data: CalculatorFormData) => calculatorsApi.create(data as any),
    onSuccess: (res) => {
      toast.success("Calculator created successfully");
      router.push(`/calculators/${res.data.data._id}/edit`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <Header title="New Calculator" description="Create a new finance calculator" />
      <div className="p-6 space-y-6">
        <Button variant="ghost" onClick={() => router.push("/calculators")}
          className="text-slate-600 hover:text-slate-900 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Calculators
        </Button>
        <CalculatorForm
          calculator={null}
          onSubmit={async (data) => { await createMutation.mutateAsync(data); }}
          isSubmitting={createMutation.isPending}
          onCancel={() => router.push("/calculators")}
        />
      </div>
    </div>
  );
}