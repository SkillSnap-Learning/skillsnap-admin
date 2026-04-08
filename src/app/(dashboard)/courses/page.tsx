"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { CoursesTable } from "@/components/courses/CoursesTable";
import { CourseModal, CourseFormData } from "@/components/courses/CourseModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { coursesApi } from "@/lib/api";
import { Course } from "@/types";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export default function CoursesPage() {
  const queryClient = useQueryClient();

  const [classFilter, setClassFilter] = useState("all");
  const [planTypeFilter, setPlanTypeFilter] = useState("all");

  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const queryParams: Record<string, unknown> = {};
  if (classFilter !== "all") queryParams.class = classFilter;
  if (planTypeFilter !== "all") queryParams.planType = planTypeFilter;

  const { data, isLoading } = useQuery({
    queryKey: ["courses", queryParams],
    queryFn: async () => {
      const response = await coursesApi.getAll(queryParams);
      return response.data.data as Course[];
    },
  });

  const courses: Course[] = data ?? [];

  const createMutation = useMutation({
    mutationFn: (data: CourseFormData) => coursesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setCourseModalOpen(false);
      toast.success("Course created successfully");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CourseFormData }) =>
      coursesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setCourseModalOpen(false);
      setSelectedCourse(null);
      toast.success("Course updated successfully");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => coursesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setDeleteDialogOpen(false);
      setSelectedCourse(null);
      toast.success("Course deleted successfully");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleCreate = () => {
    setSelectedCourse(null);
    setCourseModalOpen(true);
  };

  const handleEdit = async (course: Course) => {
    try {
      const response = await coursesApi.getById(course._id);
      setSelectedCourse(response.data.data);
    } catch {
      toast.error("Failed to load course");
      return;
    }
    setCourseModalOpen(true);
  };

  const handleDelete = (course: Course) => {
    setSelectedCourse(course);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: CourseFormData) => {
    if (selectedCourse) {
      await updateMutation.mutateAsync({ id: selectedCourse._id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  return (
    <div>
      <Header title="Courses" description="Manage course plans per class" />

      <div className="p-6 space-y-6">
        {/* Filters + Create */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-3">
            <Select
              value={classFilter}
              onValueChange={(val) => setClassFilter(val)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {["6", "7", "8", "9", "10"].map((c) => (
                  <SelectItem key={c} value={c}>Class {c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={planTypeFilter}
              onValueChange={(val) => setPlanTypeFilter(val)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Plan Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plan Types</SelectItem>
                <SelectItem value="core">Core</SelectItem>
                <SelectItem value="achiever">Achiever</SelectItem>
                <SelectItem value="future-plus">Future Plus</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleCreate} className="bg-blue-950 hover:bg-blue-900">
            <Plus className="h-4 w-4 mr-2" />
            New Course
          </Button>
        </div>

        <CoursesTable
          courses={courses}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <CourseModal
        open={courseModalOpen}
        onOpenChange={setCourseModalOpen}
        course={selectedCourse}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Course"
        description={`Are you sure you want to delete "${selectedCourse?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={() => { if (selectedCourse) deleteMutation.mutate(selectedCourse._id); }}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}