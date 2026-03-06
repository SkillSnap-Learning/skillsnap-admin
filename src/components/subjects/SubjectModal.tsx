"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { subjectsApi } from "@/lib/api";
import { Subject, SubjectName, ClassType } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

interface SubjectModalProps {
  open: boolean;
  onClose: () => void;
  subject?: Subject | null;
  planId: string;
}

interface SubjectFormData {
  planId: string;
  name: SubjectName;
  class: ClassType;
  description?: string;
  isActive: boolean;
}

const subjectOptions: { value: SubjectName; label: string }[] = [
  { value: "maths", label: "Maths" },
  { value: "science", label: "Science" },
  { value: "english", label: "English" },
  { value: "social_science", label: "Social Science" },
  { value: "coding", label: "Coding" },
  { value: "life_skills", label: "Life Skills" },
  { value: "general", label: "General" },
];

const classOptions: ClassType[] = ["6", "7", "8", "9", "10"];

export function SubjectModal({
  open,
  onClose,
  subject,
  planId,
}: SubjectModalProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SubjectFormData>();

  const selectedName = watch("name");
  const selectedClass = watch("class");
  const isActive = watch("isActive");

  useEffect(() => {
    if (subject) {
      reset({
        planId,
        name: subject.name,
        class: subject.class,
        description: subject.description || "",
        isActive: subject.isActive,
      });
    } else {
      reset({
        planId,
        name: "maths",
        class: "6",
        description: "",
        isActive: true,
      });
    }
  }, [subject, planId, reset]);

  const mutation = useMutation({
    mutationFn: (data: SubjectFormData) =>
      subject
        ? subjectsApi.update(subject._id, data)
        : subjectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects", planId] });
      toast.success(subject ? "Subject updated" : "Subject created");
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
          <DialogTitle>
            {subject ? "Edit Subject" : "Add Subject"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          className="space-y-4"
        >
          <div>
            <Label>Subject *</Label>
            <Select
              value={selectedName}
              onValueChange={(val) => setValue("name", val as SubjectName)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjectOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Class *</Label>
            <Select
              value={selectedClass}
              onValueChange={(val) => setValue("class", val as ClassType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classOptions.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    Class {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {mutation.isPending
                ? "Saving..."
                : subject
                ? "Update"
                : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}