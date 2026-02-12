"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationTemplatesApi } from "@/lib/api";
import { NotificationTemplate } from "@/types";
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

interface TemplateModalProps {
  open: boolean;
  onClose: () => void;
  template?: NotificationTemplate | null;
}

interface TemplateFormData {
  type: "achievement" | "reminder" | "announcement" | "instructor_reply" | "chapter_unlocked" | "test_passed" | "child_test_passed" | "child_chapter_unlocked" | "weekly_progress" | "parent_announcement";
  title: string;
  message: string;
  isActive: boolean;
}

const types = [
  { value: "achievement", label: "Achievement" },
  { value: "reminder", label: "Reminder" },
  { value: "announcement", label: "Announcement" },
  { value: "instructor_reply", label: "Instructor Reply" },
  { value: "chapter_unlocked", label: "Chapter Unlocked" },
  { value: "test_passed", label: "Test Passed" },
  { value: "child_test_passed", label: "Child Test Passed" },
  { value: "child_chapter_unlocked", label: "Child Chapter Unlocked" },
  { value: "weekly_progress", label: "Weekly Progress" },
  { value: "parent_announcement", label: "Parent Announcement" },
];
export function TemplateModal({ open, onClose, template }: TemplateModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<TemplateFormData>();

  const selectedType = watch("type");

  useEffect(() => {
    if (template) {
      reset({
        type: template.type,
        title: template.title,
        message: template.message,
        isActive: template.isActive,
      });
    } else {
      reset({ type: "achievement", title: "", message: "", isActive: true });
    }
  }, [template, reset]);

  const mutation = useMutation({
    mutationFn: (data: TemplateFormData) =>
      template ? notificationTemplatesApi.update(template._id, data) : notificationTemplatesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
      toast.success(template ? "Template updated" : "Template created");
      onClose();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{template ? "Edit Template" : "Create Template"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div>
            <Label>Type *</Label>
            <Select value={selectedType} onValueChange={(val) => setValue("type", val as TemplateFormData["type"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {types.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Title *</Label>
            <Input {...register("title", { required: true })} placeholder="Notification title" />
            <p className="text-xs text-slate-500 mt-1">
              Placeholders: {"{studentName}"}, {"{chapterName}"}, {"{courseName}"}, {"{score}"}, {"{streak}"}
            </p>
          </div>

          <div>
            <Label>Message *</Label>
            <Textarea {...register("message", { required: true })} rows={4} placeholder="Notification message" />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" {...register("isActive")} id="isActive" className="h-4 w-4" />
            <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : template ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}