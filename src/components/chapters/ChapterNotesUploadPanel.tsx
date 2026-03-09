"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { contentApi } from "@/lib/api";
import { Chapter } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Upload,
  CheckCircle,
  CheckCircle2,
  Loader2,
  X,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ChapterNotesUploadPanelProps {
  chapter: Chapter;
  subjectId: string;
}

export function ChapterNotesUploadPanel({
  chapter,
  subjectId,
}: ChapterNotesUploadPanelProps) {
  const queryClient = useQueryClient();
  const notesInputRef = useRef<HTMLInputElement>(null);
  const [notesFile, setNotesFile] = useState<File | null>(null);
  const [notesProgress, setNotesProgress] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const assessmentInputRef = useRef<HTMLInputElement>(null);
  const [assessmentFile, setAssessmentFile] = useState<File | null>(null);
  const [assessmentProgress, setAssessmentProgress] = useState(0);
  const [assessmentPreviewOpen, setAssessmentPreviewOpen] = useState(false);
  const [assessmentPreviewUrl, setAssessmentPreviewUrl] = useState<string | null>(null);
  const [assessmentPreviewLoading, setAssessmentPreviewLoading] = useState(false);

  const notesMutation = useMutation({
    mutationFn: async (file: File) => {
      await contentApi.uploadChapterNotesWithProgress(
        file,
        chapter._id,
        (progress) => setNotesProgress(progress)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters", subjectId] });
      toast.success("Chapter notes uploaded successfully");
      setNotesFile(null);
      setNotesProgress(0);
      if (notesInputRef.current) notesInputRef.current.value = "";
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setNotesProgress(0);
    },
  });

  const assessmentMutation = useMutation({
    mutationFn: async (file: File) => {
      await contentApi.uploadChapterAssessmentWithProgress(
        file,
        chapter._id,
        (progress) => setAssessmentProgress(progress)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters", subjectId] });
      toast.success("Chapter assessment uploaded successfully");
      setAssessmentFile(null);
      setAssessmentProgress(0);
      if (assessmentInputRef.current) assessmentInputRef.current.value = "";
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setAssessmentProgress(0);
    },
  });

  const handleAssessmentPreview = async () => {
    if (!chapter.assessmentUrl) return;
    setAssessmentPreviewLoading(true);
    setAssessmentPreviewOpen(true);
    try {
      const res = await contentApi.getNotesSignedUrl(chapter.assessmentUrl);
      setAssessmentPreviewUrl(res.data.data.url);
    } catch (err) {
      toast.error("Failed to load preview");
      setAssessmentPreviewOpen(false);
    } finally {
      setAssessmentPreviewLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!chapter.notesUrl) return;
    setPreviewLoading(true);
    setPreviewOpen(true);
    try {
      const res = await contentApi.getNotesSignedUrl(chapter.notesUrl);
      setPreviewUrl(res.data.data.url);
    } catch (err) {
      toast.error("Failed to load preview");
      setPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 border rounded-lg p-4 space-y-3">
      <p className="text-sm font-medium text-slate-700">
        Chapter Notes —{" "}
        <span className="text-blue-950 font-semibold">
          Ch {chapter.chapterNumber}: {chapter.title}
        </span>
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium">Notes (PDF)</span>
        </div>
        <Badge
          className={
            chapter.notesUrl
              ? "bg-green-100 text-green-700"
              : "bg-slate-100 text-slate-600"
          }
        >
          {chapter.notesUrl ? (
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Uploaded
            </span>
          ) : (
            "None"
          )}
        </Badge>
      </div>

      {chapter.notesUrl && chapter.notesFileName && (
        <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded">
          <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{chapter.notesFileName}</span>
        </div>
      )}

      <input
        ref={notesInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => {
          setNotesFile(e.target.files?.[0] || null);
          setNotesProgress(0);
        }}
      />

      {notesFile ? (
        <div className="space-y-2">
          <div className="text-xs text-slate-600 bg-white border rounded px-3 py-2 space-y-0.5">
            <p><strong>File:</strong> {notesFile.name}</p>
            <p><strong>Size:</strong> {(notesFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>

          {notesMutation.isPending && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Uploading...</span>
                <span>{notesProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${notesProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setNotesFile(null);
                setNotesProgress(0);
                if (notesInputRef.current) notesInputRef.current.value = "";
              }}
              disabled={notesMutation.isPending}
            >
              <X className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => notesMutation.mutate(notesFile)}
              disabled={notesMutation.isPending}
            >
              {notesMutation.isPending ? (
                <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> Uploading</>
              ) : (
                <><Upload className="h-3 w-3 mr-1.5" /> Upload</>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => notesInputRef.current?.click()}
          >
            <Upload className="h-3 w-3 mr-1.5" />
            {chapter.notesUrl ? "Replace Notes" : "Upload Notes"}
          </Button>
          {chapter.notesUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreview}
              title="Preview PDF"
            >
              <Eye className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}

      <Dialog open={previewOpen} onOpenChange={(open) => {
        if (!open) { setPreviewOpen(false); setPreviewUrl(null); }
      }}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Ch {chapter.chapterNumber}: {chapter.title} — Notes
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 h-full overflow-hidden rounded">
            {previewLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : previewUrl ? (
              <iframe
                src={previewUrl}
                className="w-full h-full rounded"
                title="Chapter Notes PDF"
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
      {/* ── Assessment Section ── */}
      <hr className="border-slate-200" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium">Assessment (PDF)</span>
        </div>
        <Badge
          className={
            chapter.assessmentUrl
              ? "bg-green-100 text-green-700"
              : "bg-slate-100 text-slate-600"
          }
        >
          {chapter.assessmentUrl ? (
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Uploaded
            </span>
          ) : (
            "None"
          )}
        </Badge>
      </div>

      {chapter.assessmentUrl && chapter.assessmentFileName && (
        <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded">
          <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{chapter.assessmentFileName}</span>
        </div>
      )}

      <input
        ref={assessmentInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => {
          setAssessmentFile(e.target.files?.[0] || null);
          setAssessmentProgress(0);
        }}
      />

      {assessmentFile ? (
        <div className="space-y-2">
          <div className="text-xs text-slate-600 bg-white border rounded px-3 py-2 space-y-0.5">
            <p><strong>File:</strong> {assessmentFile.name}</p>
            <p><strong>Size:</strong> {(assessmentFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>

          {assessmentMutation.isPending && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Uploading...</span>
                <span>{assessmentProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${assessmentProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setAssessmentFile(null);
                setAssessmentProgress(0);
                if (assessmentInputRef.current) assessmentInputRef.current.value = "";
              }}
              disabled={assessmentMutation.isPending}
            >
              <X className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => assessmentMutation.mutate(assessmentFile)}
              disabled={assessmentMutation.isPending}
            >
              {assessmentMutation.isPending ? (
                <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> Uploading</>
              ) : (
                <><Upload className="h-3 w-3 mr-1.5" /> Upload</>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => assessmentInputRef.current?.click()}
          >
            <Upload className="h-3 w-3 mr-1.5" />
            {chapter.assessmentUrl ? "Replace Assessment" : "Upload Assessment"}
          </Button>
          {chapter.assessmentUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAssessmentPreview}
              title="Preview Assessment PDF"
            >
              <Eye className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}

      <Dialog open={assessmentPreviewOpen} onOpenChange={(open) => {
        if (!open) { setAssessmentPreviewOpen(false); setAssessmentPreviewUrl(null); }
      }}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Ch {chapter.chapterNumber}: {chapter.title} — Assessment
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 h-full overflow-hidden rounded">
            {assessmentPreviewLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : assessmentPreviewUrl ? (
              <iframe
                src={assessmentPreviewUrl}
                className="w-full h-full rounded"
                title="Chapter Assessment PDF"
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}