"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { contentApi, chaptersApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface VideoUploadProps {
  chapterId: string;
  chapterTitle: string;
}

export function VideoUpload({ chapterId, chapterTitle }: VideoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<string>("");
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");
      
      // Upload video
      const uploadRes = await contentApi.uploadVideo(file);
      const { streamId, duration: videoDuration } = uploadRes.data.data;

      // Update chapter with stream ID and duration
      await chaptersApi.update(chapterId, {
        videoUrl: streamId,
        videoDuration: duration ? parseInt(duration) : videoDuration,
      });

      return { streamId, videoDuration };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      toast.success("Video uploaded successfully");
      setFile(null);
      setDuration("");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="video">Select Video File</Label>
        <Input
          id="video"
          type="file"
          accept="video/mp4,video/quicktime,video/x-msvideo"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          disabled={uploadMutation.isPending}
        />
        <p className="text-xs text-slate-500 mt-1">
          Max 500MB. MP4, MOV, AVI supported.
        </p>
      </div>

      <div>
        <Label htmlFor="duration">Duration (seconds) - Optional</Label>
        <Input
          id="duration"
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Auto-detected if left empty"
          disabled={uploadMutation.isPending}
        />
      </div>

      {file && (
        <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
          <p><strong>File:</strong> {file.name}</p>
          <p><strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      )}

      <Button
        onClick={() => uploadMutation.mutate()}
        disabled={!file || uploadMutation.isPending}
        className="w-full"
      >
        {uploadMutation.isPending ? (
          <>Uploading...</>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Upload Video
          </>
        )}
      </Button>

      {uploadMutation.isSuccess && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded">
          <CheckCircle2 className="h-4 w-4" />
          Video uploaded and chapter updated
        </div>
      )}
    </div>
  );
}