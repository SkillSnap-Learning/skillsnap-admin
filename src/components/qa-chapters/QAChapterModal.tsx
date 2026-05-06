"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qaChaptersApi } from "@/lib/api";
import { QAChapter, QASubject, QAClassLevel } from "@/types";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface QAChapterModalProps {
  open: boolean;
  onClose: () => void;
  chapter?: QAChapter | null;
  subjects: QASubject[];
}

interface QAChapterFormData {
  name: string;
  subject: string;
  classLevel: QAClassLevel;
  order: number;
  isActive: boolean;
}

const ALL_CLASS_LEVELS: QAClassLevel[] = ['6', '7', '8', '9', '10', '11', '12'];

export function QAChapterModal({ open, onClose, chapter, subjects }: QAChapterModalProps) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } =
    useForm<QAChapterFormData>();

  const selectedSubject = watch("subject");
  const selectedClass = watch("classLevel");
  const isActive = watch("isActive");

  // Available classes filtered by selected subject
  const availableClasses = selectedSubject
    ? subjects.find((s) => s._id === selectedSubject)?.classLevels || ALL_CLASS_LEVELS
    : ALL_CLASS_LEVELS;

  useEffect(() => {
    if (chapter) {
      const subjectId = typeof chapter.subject === "object"
        ? (chapter.subject as QASubject)._id
        : chapter.subject;

      reset({
        name: chapter.name,
        subject: subjectId,
        classLevel: chapter.classLevel,
        order: chapter.order,
        isActive: chapter.isActive,
      });
    } else {
      reset({
        name: "",
        subject: "",
        classLevel: undefined,
        order: 0,
        isActive: true,
      });
    }
  }, [chapter, reset]);

  // Reset classLevel if it's not valid for newly selected subject
  useEffect(() => {
    if (selectedClass && !availableClasses.includes(selectedClass)) {
      setValue("classLevel", undefined as any);
    }
  }, [selectedSubject]);

  const mutation = useMutation({
    mutationFn: (data: QAChapterFormData) =>
      chapter
        ? qaChaptersApi.update(chapter._id, data)
        : qaChaptersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qa-chapters"] });
      toast.success(chapter ? "Chapter updated" : "Chapter created");
      onClose();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const onSubmit = (data: QAChapterFormData) => {
    mutation.mutate({ ...data, order: Number(data.order) });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{chapter ? "Edit Chapter" : "Add Chapter"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Name */}
          <div className="space-y-1.5">
            <Label>Chapter Name *</Label>
            <Input
              {...register("name", { required: "Name is required" })}
              placeholder="e.g. Light, Heat, Motion"
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <Label>Subject *</Label>
            <Select
              value={selectedSubject}
              onValueChange={(val) => setValue("subject", val, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" {...register("subject", { required: "Subject is required" })} />
            {errors.subject && <p className="text-xs text-red-600">{errors.subject.message}</p>}
          </div>

          {/* Class Level */}
          <div className="space-y-1.5">
            <Label>Class *</Label>
            <Select
              value={selectedClass}
              onValueChange={(val) => setValue("classLevel", val as QAClassLevel, { shouldValidate: true })}
              disabled={!selectedSubject}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedSubject ? "Select class" : "Select subject first"} />
              </SelectTrigger>
              <SelectContent>
                {availableClasses.map((c) => (
                  <SelectItem key={c} value={c}>Class {c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" {...register("classLevel", { required: "Class is required" })} />
            {errors.classLevel && <p className="text-xs text-red-600">{errors.classLevel.message}</p>}
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
              {mutation.isPending ? "Saving..." : chapter ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}