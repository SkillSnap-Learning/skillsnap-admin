"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { topicsApi } from "@/lib/api";
import { Topic } from "@/types";
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

interface TopicModalProps {
  open: boolean;
  onClose: () => void;
  topic?: Topic | null;
  chapterId: string;
}

interface TopicFormData {
  chapterId: string;
  topicNumber: number;
  title: string;
  description?: string;
  minimumWatchPercentage: number;
  minimumTestPercentage: number;
  isActive: boolean;
}

export function TopicModal({
  open,
  onClose,
  topic,
  chapterId,
}: TopicModalProps) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TopicFormData>();

  const isActive = watch("isActive");

  useEffect(() => {
    if (topic) {
      reset({
        chapterId,
        topicNumber: topic.topicNumber,
        title: topic.title,
        description: topic.description || "",
        minimumWatchPercentage: topic.minimumWatchPercentage,
        minimumTestPercentage: topic.minimumTestPercentage,
        isActive: topic.isActive,
      });
    } else {
      reset({
        chapterId,
        topicNumber: 1,
        title: "",
        description: "",
        minimumWatchPercentage: 85,
        minimumTestPercentage: 85,
        isActive: true,
      });
    }
  }, [topic, chapterId, reset]);

  const mutation = useMutation({
    mutationFn: (data: TopicFormData) =>
      topic ? topicsApi.update(topic._id, data) : topicsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics", chapterId] });
      toast.success(topic ? "Topic updated" : "Topic created");
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: TopicFormData) => {
    if (topic) {
      const { chapterId: _, topicNumber: __, ...updateData } = data;
      mutation.mutate(updateData as TopicFormData);
    } else {
      mutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{topic ? "Edit Topic" : "Add Topic"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Topic Number *</Label>
            <Input
              type="number"
              min="1"
              {...register("topicNumber", {
                required: "Topic number is required",
                valueAsNumber: true,
                min: 1,
              })}
              disabled={!!topic}
            />
            {errors.topicNumber && (
              <p className="text-sm text-red-600 mt-1">
                {errors.topicNumber.message}
              </p>
            )}
          </div>

          <div>
            <Label>Title *</Label>
            <Input
              {...register("title", { required: "Title is required" })}
              placeholder="e.g., Introduction to Variables"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              {...register("description")}
              placeholder="Brief description of the topic"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Min Watch % *</Label>
              <Input
                type="number"
                min="0"
                max="100"
                {...register("minimumWatchPercentage", {
                  required: true,
                  valueAsNumber: true,
                  min: 0,
                  max: 100,
                })}
              />
            </div>
            <div>
              <Label>Min Test % *</Label>
              <Input
                type="number"
                min="0"
                max="100"
                {...register("minimumTestPercentage", {
                  required: true,
                  valueAsNumber: true,
                  min: 0,
                  max: 100,
                })}
              />
            </div>
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
              {mutation.isPending ? "Saving..." : topic ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}