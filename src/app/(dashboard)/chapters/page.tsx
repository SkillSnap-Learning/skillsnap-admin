"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { chaptersApi, coursesApi } from "@/lib/api";
import { Chapter, Course } from "@/types";
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
import { ChapterModal } from "@/components/chapters/ChapterModal";
import { ChaptersTable } from "@/components/chapters/ChaptersTable";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function ChaptersPage() {
  const searchParams = useSearchParams();
  const courseIdFromUrl = searchParams.get("courseId");

  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>(courseIdFromUrl || "all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [deletingChapter, setDeletingChapter] = useState<Chapter | null>(null);

  const queryClient = useQueryClient();

  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await coursesApi.getAll();
      return res.data.data as Course[];
    },
  });

  const { data: chapters, isLoading } = useQuery({
    queryKey: ["chapters", { search: searchTerm, courseId: courseFilter }],
    queryFn: async () => {
      if (courseFilter !== "all") {
        const res = await chaptersApi.getByCourse(courseFilter);
        return res.data.data as Chapter[];
      }
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      const res = await chaptersApi.getAll(params);
      return res.data.data as Chapter[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => chaptersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      toast.success("Chapter deleted successfully");
      setDeletingChapter(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleEdit = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingChapter(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-950">Chapters</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Chapter
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search chapters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses?.map((course) => (
              <SelectItem key={course._id} value={course._id}>
                {course.title} (Class {course.class})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ChaptersTable
        chapters={chapters || []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={setDeletingChapter}
      />

      <ChapterModal
        open={modalOpen}
        onClose={handleCloseModal}
        chapter={editingChapter}
        courses={courses || []}
      />

      <ConfirmDialog
        open={!!deletingChapter}
        onOpenChange={(open) => !open && setDeletingChapter(null)}
        onConfirm={() => deletingChapter && deleteMutation.mutate(deletingChapter._id)}
        title="Delete Chapter"
        description={`Delete "${deletingChapter?.title}"? This will also delete all associated questions.`}
        confirmText="Delete"
        isDestructive
      />
    </div>
  );
}