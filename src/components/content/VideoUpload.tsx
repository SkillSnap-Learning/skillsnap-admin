"use client";

import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as tus from "tus-js-client";
import { chaptersApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";

interface VideoUploadProps {
  chapterId: string;
  chapterTitle: string;
}

export function VideoUpload({ chapterId, chapterTitle }: VideoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const uploadRef = useRef<tus.Upload | null>(null);
  const queryClient = useQueryClient();

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setSuccess(false);

    try {
      // Step 1 — Get TUS upload URL from backend
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/content/upload/video/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            fileName: file.name,
            fileSize: file.size,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to get upload URL");
      const { data } = await res.json();
      const { uploadUrl, streamId } = data;

      // Step 2 — Upload directly to Cloudflare Stream via TUS
      await new Promise<void>((resolve, reject) => {
        const upload = new tus.Upload(file, {
          uploadUrl,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          chunkSize: 50 * 1024 * 1024, // 50MB chunks instead of default
          metadata: {
            filename: file.name,
            filetype: file.type,
          },
          onProgress: (bytesUploaded, bytesTotal) => {
            const pct = Math.round((bytesUploaded / bytesTotal) * 100);
            setProgress(pct);
          },
          onSuccess: () => resolve(),
          onError: (err) => reject(err),
        });

        uploadRef.current = upload;
        upload.start();
      });

      // Step 3 — Update chapter with streamId and duration
      await chaptersApi.update(chapterId, {
        videoUrl: streamId,
        ...(duration ? { videoDuration: parseInt(duration) } : {}),
      });

      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      setSuccess(true);
      setFile(null);
      setDuration("");
      setProgress(0);
      toast.success("Video uploaded successfully");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    if (uploadRef.current) {
      uploadRef.current.abort();
      uploadRef.current = null;
    }
    setUploading(false);
    setProgress(0);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="video">Select Video File</Label>
        <Input
          id="video"
          type="file"
          accept="video/mp4,video/quicktime,video/x-msvideo"
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            setSuccess(false);
          }}
          disabled={uploading}
        />
        <p className="text-xs text-slate-500 mt-1">
          MP4, MOV, AVI supported. Large files upload directly to Cloudflare.
        </p>
      </div>

      <div>
        <Label htmlFor="duration">Duration (seconds) — Optional</Label>
        <Input
          id="duration"
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Auto-detected if left empty"
          disabled={uploading}
        />
      </div>

      {file && (
        <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
          <p><strong>File:</strong> {file.name}</p>
          <p><strong>Size:</strong> {(file.size / 1024 / 1024 / 1024).toFixed(2)} GB ({(file.size / 1024 / 1024).toFixed(0)} MB)</p>
        </div>
      )}

      {/* Progress Bar */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Uploading to Cloudflare Stream...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? `Uploading ${progress}%` : "Upload Video"}
        </Button>

        {uploading && (
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>

      {success && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded">
          <CheckCircle2 className="h-4 w-4" />
          Video uploaded and chapter updated successfully
        </div>
      )}
    </div>
  );
}