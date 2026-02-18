"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chaptersApi } from "@/lib/api";
import { Chapter, Course } from "@/types";
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

interface ChapterModalProps {
  open: boolean;
  onClose: () => void;
  chapter?: Chapter | null;
  courses: Course[];
}

interface ChapterFormData {
  courseId: string;
  chapterNumber: number;
  title: string;
  description?: string;
  videoUrl?: string;
  videoDuration?: number;
  notesUrl?: string;
  minimumWatchPercentage: number;
  minimumTestPercentage: number;
}

export function ChapterModal({ open, onClose, chapter, courses }: ChapterModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ChapterFormData>();
  const [selectedCourse, setSelectedCourse] = useState("");

  useEffect(() => {
    if (chapter) {
      const courseId = typeof chapter.courseId === 'object' 
        ? (chapter.courseId as Course)._id 
        : chapter.courseId;
      
      setSelectedCourse(courseId);
      reset({
        courseId,
        chapterNumber: chapter.chapterNumber,
        title: chapter.title,
        description: chapter.description || "",
        videoUrl: chapter.videoUrl || "",
        videoDuration: chapter.videoDuration || undefined,
        notesUrl: chapter.notesUrl || "",
        minimumWatchPercentage: chapter.minimumWatchPercentage,
        minimumTestPercentage: chapter.minimumTestPercentage,
      });
    } else {
      reset({
        courseId: "",
        chapterNumber: 1,
        title: "",
        description: "",
        minimumWatchPercentage: 85,
        minimumTestPercentage: 85,
      });
      setSelectedCourse("");
    }
  }, [chapter, reset]);

  const mutation = useMutation({
    mutationFn: (data: ChapterFormData) =>
      chapter ? chaptersApi.update(chapter._id, data) : chaptersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success(chapter ? "Chapter updated" : "Chapter created");
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: ChapterFormData) => {
    if (chapter) {
      // Strip fields that shouldn't be updated
      const { courseId, chapterNumber, ...updateData } = data;
      mutation.mutate(updateData as ChapterFormData);
    } else {
      mutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{chapter ? "Edit Chapter" : "Create Chapter"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Course *</Label>
              <Select value={selectedCourse} onValueChange={(val) => {
                setSelectedCourse(val);
                setValue("courseId", val);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.title} (Class {course.class})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.courseId && (
                <p className="text-sm text-red-600 mt-1">Course is required</p>
              )}
            </div>

            <div>
              <Label>Chapter Number *</Label>
              <Input
                type="number"
                {...register("chapterNumber", { 
                  required: true, 
                  min: 1,
                  valueAsNumber: true 
                })}
                min="1"
              />
            </div>

            <div>
              <Label>Title *</Label>
              <Input
                {...register("title", { required: true })}
                placeholder="e.g., Introduction to Algebra"
              />
            </div>

            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea
                {...register("description")}
                rows={2}
              />
            </div>

            <div>
              <Label>Video URL (Stream ID)</Label>
              <Input
                {...register("videoUrl")}
                placeholder="Cloudflare Stream ID"
              />
            </div>

            <div>
              <Label>Video Duration (seconds)</Label>
              <Input
                type="number"
                {...register("videoDuration", { valueAsNumber: true })}
              />
            </div>

            <div className="col-span-2">
              <Label>Notes URL</Label>
              <Input
                {...register("notesUrl")}
                placeholder="R2 PDF URL"
              />
            </div>

            <div>
              <Label>Min Watch % *</Label>
              <Input
                type="number"
                {...register("minimumWatchPercentage", { 
                  required: true,
                  min: 0,
                  max: 100,
                  valueAsNumber: true 
                })}
                min="0"
                max="100"
              />
            </div>

            <div>
              <Label>Min Test % *</Label>
              <Input
                type="number"
                {...register("minimumTestPercentage", { 
                  required: true,
                  min: 0,
                  max: 100,
                  valueAsNumber: true 
                })}
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : chapter ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}