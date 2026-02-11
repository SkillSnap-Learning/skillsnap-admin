"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi } from "@/lib/api";
import { Course } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { CourseModal } from "@/components/courses/CourseModal";
import { CoursesTable } from "@/components/courses/CoursesTable";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["courses", { search: searchTerm, class: classFilter, subject: subjectFilter }],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (classFilter !== "all") params.class = classFilter;
      if (subjectFilter !== "all") params.subject = subjectFilter;
      const res = await coursesApi.getAll(params);
      return res.data.data as Course[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => coursesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course deleted successfully");
      setDeletingCourse(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setModalOpen(true);
  };

  const handleDelete = (course: Course) => {
    setDeletingCourse(course);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCourse(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-950">Courses</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            <SelectItem value="6">Class 6</SelectItem>
            <SelectItem value="7">Class 7</SelectItem>
            <SelectItem value="8">Class 8</SelectItem>
            <SelectItem value="9">Class 9</SelectItem>
            <SelectItem value="10">Class 10</SelectItem>
          </SelectContent>
        </Select>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            <SelectItem value="Math">Math</SelectItem>
            <SelectItem value="Science">Science</SelectItem>
            <SelectItem value="English">English</SelectItem>
            <SelectItem value="Social Science">Social Science</SelectItem>
            <SelectItem value="Computer Science">Computer Science</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <CoursesTable
        courses={data || []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CourseModal
        open={modalOpen}
        onClose={handleCloseModal}
        course={editingCourse}
      />

      <ConfirmDialog
        open={!!deletingCourse}
        onOpenChange={(open) => !open && setDeletingCourse(null)}
        onConfirm={() => deletingCourse && deleteMutation.mutate(deletingCourse._id)}
        title="Delete Course"
        description={`Are you sure you want to delete "${deletingCourse?.title}"? This will also delete all associated chapters and questions.`}
        confirmText="Delete"
        isDestructive
      />
    </div>
  );
}