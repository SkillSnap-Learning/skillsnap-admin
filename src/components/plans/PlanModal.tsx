"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { plansApi } from "@/lib/api";
import { Plan } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface PlanModalProps {
  open: boolean;
  onClose: () => void;
  plan?: Plan | null;
}

interface PlanFormData {
  name: string;
  slug: string;
  description?: string;
  isGuestPlan: boolean;
  price: {
    amount: number;
    originalAmount: number;
    currency: string;
  };
  isActive: boolean;
}

export function PlanModal({ open, onClose, plan }: PlanModalProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PlanFormData>();

  const isGuestPlan = watch("isGuestPlan");
  const isActive = watch("isActive");

  useEffect(() => {
    if (plan) {
      reset({
        name: plan.name,
        slug: plan.slug,
        description: plan.description || "",
        isGuestPlan: plan.isGuestPlan,
        price: {
            amount: plan.price.amount,
            originalAmount: plan.price.originalAmount,
            currency: plan.price.currency || "INR",
        },
        isActive: plan.isActive,
        });
    } else {
      reset({
        name: "",
        slug: "",
        description: "",
        isGuestPlan: false,
        price: { amount: 0, originalAmount: 0, currency: "INR" },
        isActive: true,
        });
    }
  }, [plan, reset]);

  const mutation = useMutation({
    mutationFn: (data: PlanFormData) =>
      plan ? plansApi.update(plan._id, data) : plansApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success(plan ? "Plan updated" : "Plan created");
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{plan ? "Edit Plan" : "Create Plan"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          className="space-y-4"
        >
          <div>
            <Label>Name *</Label>
            <Input
              {...register("name", { required: "Name is required" })}
              placeholder="e.g., Basic Plan"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label>Slug *</Label>
            <Input
              {...register("slug", { required: "Slug is required" })}
              placeholder="e.g., basic"
            />
            <p className="text-xs text-slate-500 mt-1">
              Lowercase, no spaces (e.g. basic, advanced, elite, guest)
            </p>
            {errors.slug && (
              <p className="text-sm text-red-600 mt-1">{errors.slug.message}</p>
            )}
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              {...register("description")}
              placeholder="Brief description"
              rows={2}
            />
          </div>

          <div>
            <Label>Plan Type *</Label>
            <Select
              value={isGuestPlan ? "true" : "false"}
              onValueChange={(val) =>
                setValue("isGuestPlan", val === "true")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">Paid Plan</SelectItem>
                <SelectItem value="true">Guest Plan (Free)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isGuestPlan && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price (₹) *</Label>
                <Input
                  type="number"
                  {...register("price.amount", {
                    valueAsNumber: true,
                    min: 0,
                  })}
                  placeholder="e.g., 7999"
                />
              </div>
              <div>
                <Label>Original Price (₹)</Label>
                <Input
                  type="number"
                  {...register("price.originalAmount", {
                    valueAsNumber: true,
                    min: 0,
                  })}
                  placeholder="e.g., 12999"
                />
              </div>
            </div>
          )}

          <div>
            <Label>Status *</Label>
            <Select
              value={isActive ? "true" : "false"}
              onValueChange={(val) => setValue("isActive", val === "true")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : plan ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}