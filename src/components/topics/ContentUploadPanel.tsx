"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { contentApi } from "@/lib/api";
import { Topic } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Video,
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

interface ContentUploadPanelProps {
  topic: Topic;
  chapterId: string;
}

export function ContentUploadPanel({ topic, chapterId }: ContentUploadPanelProps) {
  const queryClient = useQueryClient();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const notesInputRef = useRef<HTMLInputElement>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [notesFile, setNotesFile] = useState<File | null>(null);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [notesProgress, setNotesProgress] = useState<number>(0);
  const [previewOpen, setPreviewOpen] = useState<"video" | "notes" | null>(null);

  // ── Video upload via TUS (resumable) ──────────────────────────────────────
  const videoMutation = useMutation({
    mutationFn: async (file: File) => {
      // Step 1: Get TUS upload URL from backend
      const startRes = await contentApi.createVideoUploadUrl(
        file.name,
        file.size,
        topic._id
      );
      const { uploadUrl, streamId } = startRes.data.data;

      // Step 2: Upload via TUS with progress tracking
      await uploadViaTus(file, uploadUrl, (progress) => {
        setVideoProgress(progress);
      });

      return streamId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics", chapterId] });
      toast.success("Video uploaded — processing by Cloudflare Stream");
      setVideoFile(null);
      setVideoProgress(0);
      if (videoInputRef.current) videoInputRef.current.value = "";
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setVideoProgress(0);
    },
  });

  // ── Notes upload ──────────────────────────────────────────────────────────
  const notesMutation = useMutation({
    mutationFn: async (file: File) => {
      await contentApi.uploadNotesWithProgress(
        file,
        topic._id,
        (progress) => setNotesProgress(progress)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics", chapterId] });
      toast.success("Notes uploaded successfully");
      setNotesFile(null);
      setNotesProgress(0);
      if (notesInputRef.current) notesInputRef.current.value = "";
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setNotesProgress(0);
    },
  });

  return (
    <div className="bg-slate-50 border rounded-lg p-5 space-y-5">
      <p className="text-sm font-medium text-slate-700">
        Upload Content for:{" "}
        <span className="text-blue-950 font-semibold">
          T{topic.topicNumber} — {topic.title}
        </span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* ── Video Section ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium">Video</span>
            </div>
            <Badge
              className={
                topic.videoStatus === "ready"
                  ? "bg-green-100 text-green-700"
                  : topic.videoStatus === "uploading"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-slate-100 text-slate-600"
              }
            >
              {topic.videoStatus === "ready" ? (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Ready
                </span>
              ) : topic.videoStatus === "uploading" ? (
                "Processing..."
              ) : (
                "None"
              )}
            </Badge>
          </div>

          {/* Existing video info */}
          {topic.videoStatus === "ready" && topic.videoFileName && (
            <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded">
              <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{topic.videoFileName}</span>
            </div>
          )}

          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              setVideoFile(e.target.files?.[0] || null);
              setVideoProgress(0);
            }}
          />

          {videoFile ? (
            <div className="space-y-2">
              <div className="text-xs text-slate-600 bg-white border rounded px-3 py-2 space-y-0.5">
                <p><strong>File:</strong> {videoFile.name}</p>
                <p><strong>Size:</strong> {(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>

              {/* Progress bar */}
              {videoMutation.isPending && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Uploading...</span>
                    <span>{videoProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setVideoFile(null);
                    setVideoProgress(0);
                    if (videoInputRef.current) videoInputRef.current.value = "";
                  }}
                  disabled={videoMutation.isPending}
                >
                  <X className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => videoMutation.mutate(videoFile)}
                  disabled={videoMutation.isPending}
                >
                  {videoMutation.isPending ? (
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
                onClick={() => videoInputRef.current?.click()}
              >
                <Upload className="h-3 w-3 mr-1.5" />
                {topic.videoStatus === "ready" ? "Replace" : "Upload Video"}
              </Button>
              {topic.videoStatus === "ready" && topic.videoUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewOpen("video")}
                  title="Preview video"
                >
                  <Eye className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* ── Notes Section ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium">Notes (PDF)</span>
            </div>
            <Badge
              className={
                topic.notesUrl
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }
            >
              {topic.notesUrl ? (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Uploaded
                </span>
              ) : (
                "None"
              )}
            </Badge>
          </div>

          {/* Existing notes info */}
          {topic.notesUrl && topic.notesFileName && (
            <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded">
              <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{topic.notesFileName}</span>
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

              {/* Progress bar */}
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
                {topic.notesUrl ? "Replace" : "Upload Notes"}
              </Button>
              {topic.notesUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewOpen("notes")}
                  title="Preview PDF"
                >
                  <Eye className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Preview Dialog ── */}
      <Dialog
        open={!!previewOpen}
        onOpenChange={(open) => !open && setPreviewOpen(null)}
      >
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {previewOpen === "video"
                ? `Video — ${topic.title}`
                : `Notes — ${topic.title}`}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 h-full overflow-hidden rounded">
            {previewOpen === "video" && topic.videoUrl && (
              <iframe
                src={`https://iframe.cloudflarestream.com/${topic.videoUrl}`}
                className="w-full h-full rounded"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            )}
            {previewOpen === "notes" && topic.notesUrl && (
              <NotesPreview s3Key={topic.notesUrl} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── TUS upload helper ─────────────────────────────────────────────────────────
async function uploadViaTus(
  file: File,
  uploadUrl: string,
  onProgress: (pct: number) => void
): Promise<void> {
  const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
  let offset = 0;

  while (offset < file.size) {
    const chunk = file.slice(offset, offset + CHUNK_SIZE);
    const buffer = await chunk.arrayBuffer();

    const response = await fetch(uploadUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/offset+octet-stream",
        "Tus-Resumable": "1.0.0",
        "Upload-Offset": offset.toString(),
      },
      body: buffer,
    });

    if (!response.ok) {
      throw new Error(`Upload failed at offset ${offset}`);
    }

    offset += buffer.byteLength;
    const pct = Math.round((offset / file.size) * 100);
    onProgress(Math.min(pct, 100));
  }
}

// ── Notes preview (fetches signed URL then renders iframe) ───────────────────
function NotesPreview({ s3Key }: { s3Key: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useState(() => {
    import("@/lib/api")
      .then(({ contentApi }) => contentApi.getNotesSignedUrl(s3Key))
      .then((res) => {
        setUrl(res.data.data.url);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 text-sm">
        Failed to load PDF: {error}
      </div>
    );
  }

  return (
    <iframe
      src={url!}
      className="w-full h-full rounded"
      title="Notes PDF"
    />
  );
}