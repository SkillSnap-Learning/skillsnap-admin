"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { plansApi, subjectsApi, chaptersApi, topicsApi } from "@/lib/api";
import { Topic, Plan, Subject, Chapter } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, Upload } from "lucide-react";
import { toast } from "sonner";
import { TopicsTable } from "@/components/topics/TopicsTable";
import { TopicModal } from "@/components/topics/TopicModal";
import { ContentUploadPanel } from "@/components/topics/ContentUploadPanel";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import Link from "next/link";

export default function TopicsPage() {
  const { planId, subjectId, chapterId } = useParams<{
    planId: string;
    subjectId: string;
    chapterId: string;
  }>();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [deletingTopic, setDeletingTopic] = useState<Topic | null>(null);
  const [uploadingTopic, setUploadingTopic] = useState<Topic | null>(null);

  const queryClient = useQueryClient();

  const { data: plan } = useQuery({
    queryKey: ["plans", planId],
    queryFn: async () => {
      const res = await plansApi.getById(planId);
      return res.data.data as Plan;
    },
  });

  const { data: subject } = useQuery({
    queryKey: ["subjects", subjectId],
    queryFn: async () => {
      const res = await subjectsApi.getById(subjectId);
      return res.data.data as Subject;
    },
  });

  const { data: chapter } = useQuery({
    queryKey: ["chapters", chapterId],
    queryFn: async () => {
      const res = await chaptersApi.getById(chapterId);
      return res.data.data as Chapter;
    },
  });

  const { data: topics, isLoading } = useQuery({
    queryKey: ["topics", chapterId],
    queryFn: async () => {
      const res = await topicsApi.getByChapter(chapterId);
      return res.data.data as Topic[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => topicsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics", chapterId] });
      toast.success("Topic deleted");
      setDeletingTopic(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const subjectLabel = subject
    ? `${subject.name
        .replace("_", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())} (Class ${subject.class})`
    : "...";

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
        <Link href="/plans" className="hover:text-blue-950">
          Plans
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href={`/plans/${planId}/subjects`}
          className="hover:text-blue-950"
        >
          {plan?.name || "..."}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href={`/plans/${planId}/subjects/${subjectId}/chapters`}
          className="hover:text-blue-950"
        >
          {subjectLabel}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-blue-950 font-medium">
          {chapter ? `Ch ${chapter.chapterNumber}: ${chapter.title}` : "..."}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Topics</h1>
          <p className="text-sm text-slate-500 mt-1">
            {chapter?.title} — manage topics and upload content
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Topic
        </Button>
      </div>

      {/* Content upload panel — shows when a topic's upload button is clicked */}
      {uploadingTopic && (
        <ContentUploadPanel
          topic={uploadingTopic}
          chapterId={chapterId}
        />
      )}

      <TopicsTable
        topics={topics || []}
        isLoading={isLoading}
        planId={planId}
        subjectId={subjectId}
        chapterId={chapterId}
        onEdit={(topic) => {
          setEditingTopic(topic);
          setModalOpen(true);
        }}
        onDelete={setDeletingTopic}
        onUpload={(topic) =>
          setUploadingTopic(
            uploadingTopic?._id === topic._id ? null : topic
          )
        }
        uploadingTopicId={uploadingTopic?._id}
      />

      <TopicModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTopic(null);
        }}
        topic={editingTopic}
        chapterId={chapterId}
      />

      <ConfirmDialog
        open={!!deletingTopic}
        onOpenChange={(open) => !open && setDeletingTopic(null)}
        onConfirm={() =>
          deletingTopic && deleteMutation.mutate(deletingTopic._id)
        }
        title="Delete Topic"
        description={`Delete "${deletingTopic?.title}"? All questions under it will also be removed.`}
        confirmText="Delete"
        isDestructive
      />
    </div>
  );
}