"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi } from "@/lib/api";
import { Course, ClassType, SubjectType } from "@/types";
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

interface CourseModalProps {
  open: boolean;
  onClose: () => void;
  course?: Course | null;
}

interface CourseFormData {
  title: string;
  class: ClassType;
  subject: SubjectType;
  description?: string;
  totalChapters: number;
}

const classes: ClassType[] = ["6", "7", "8", "9", "10"];
const subjects: SubjectType[] = ["english", "maths", "science", "social_science"];

export function CourseModal({ open, onClose, course }: CourseModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CourseFormData>();

  const selectedClass = watch("class");
  const selectedSubject = watch("subject");

  useEffect(() => {
    if (course) {
      reset({
        title: course.title,
        class: course.class as ClassType,
        subject: course.subject as SubjectType,
        description: course.description || "",
        totalChapters: course.totalChapters,
        });
    } else {
      reset({ title: "", class: "6", subject: "english", description: "" });
    }
  }, [course, reset]);

  const mutation = useMutation({
    mutationFn: (data: CourseFormData) =>
      course ? coursesApi.update(course._id, data) : coursesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success(course ? "Course updated" : "Course created");
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: CourseFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{course ? "Edit Course" : "Create Course"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register("title", { required: "Title is required" })}
              placeholder="e.g., Advanced Mathematics"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="class">Class *</Label>
            <Select value={selectedClass} onValueChange={(val) => setValue("class", val as ClassType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    Class {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subject">Subject *</Label>
            <Select value={selectedSubject} onValueChange={(val) => setValue("subject", val as SubjectType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="maths">Maths</SelectItem>
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="social_science">Social Science</SelectItem>
            </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Brief description of the course"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="totalChapters">Total Chapters *</Label>
            <Input
                id="totalChapters"
                type="number"
                min="1"
                {...register("totalChapters", { 
                required: "Total chapters is required",
                valueAsNumber: true,
                min: 1 
                })}
                placeholder="e.g., 10"
            />
            {errors.totalChapters && (
                <p className="text-sm text-red-600 mt-1">{errors.totalChapters.message}</p>
            )}
            </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : course ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}