"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qaSubjectsApi } from "@/lib/api";
import { QASubject, QAClassLevel } from "@/types";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "sonner";

interface QASubjectModalProps {
  open: boolean;
  onClose: () => void;
  subject?: QASubject | null;
}

interface QASubjectFormData {
  name: string;
  classLevels: QAClassLevel[];
  icon: string;
  order: number;
  isActive: boolean;
}

const ALL_CLASS_LEVELS: QAClassLevel[] = ['6', '7', '8', '9', '10', '11', '12'];

export function QASubjectModal({ open, onClose, subject }: QASubjectModalProps) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<QASubjectFormData>();

  const classLevels = watch("classLevels") || [];
  const isActive = watch("isActive");

  useEffect(() => {
    if (subject) {
      reset({
        name: subject.name,
        classLevels: subject.classLevels,
        icon: subject.icon || "",
        order: subject.order,
        isActive: subject.isActive,
      });
    } else {
      reset({
        name: "",
        classLevels: [],
        icon: "",
        order: 0,
        isActive: true,
      });
    }
  }, [subject, reset]);

  const toggleClass = (cls: QAClassLevel) => {
    const current = classLevels || [];
    if (current.includes(cls)) {
      setValue("classLevels", current.filter((c) => c !== cls), { shouldValidate: true });
    } else {
      setValue("classLevels", [...current, cls].sort(), { shouldValidate: true });
    }
  };

  const mutation = useMutation({
    mutationFn: (data: QASubjectFormData) =>
      subject
        ? qaSubjectsApi.update(subject._id, data)
        : qaSubjectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qa-subjects"] });
      toast.success(subject ? "Subject updated" : "Subject created");
      onClose();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const onSubmit = (data: QASubjectFormData) => {
    if (!data.classLevels || data.classLevels.length === 0) {
      toast.error("Select at least one class level");
      return;
    }
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{subject ? "Edit Subject" : "Add Subject"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Name */}
          <div className="space-y-1.5">
            <Label>Subject Name *</Label>
            <Input
              {...register("name", { required: "Name is required" })}
              placeholder="e.g. Physics, Maths"
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          </div>

          {/* Icon */}
          <div className="space-y-1.5">
            <Label>Icon <span className="text-muted-foreground/60 text-xs">(emoji, optional)</span></Label>
            <Input
              {...register("icon")}
              placeholder="e.g. 🔬 or ➕"
            />
          </div>

          {/* Class Levels */}
          <div className="space-y-2">
            <Label>Available for Classes *</Label>
            <div className="flex flex-wrap gap-2">
              {ALL_CLASS_LEVELS.map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => toggleClass(cls)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    classLevels.includes(cls)
                      ? "bg-blue-600 text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Class {cls}
                </button>
              ))}
            </div>
            {classLevels.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {classLevels.map((cls) => (
                  <Badge key={cls} className="bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 gap-1">
                    Class {cls}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => toggleClass(cls)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Order + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Display Order</Label>
              <Input
                type="number"
                {...register("order", { valueAsNumber: true })}
                placeholder="0"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={isActive ? "true" : "false"}
                onValueChange={(val) => setValue("isActive", val === "true")}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : subject ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}