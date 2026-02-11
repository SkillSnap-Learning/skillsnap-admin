"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { contentApi, chaptersApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Chapter } from "@/types";

interface NotesUploadProps {
  courseId: string;
  chapterNumber: number;
  chapterTitle: string;
}

export function NotesUpload({ courseId, chapterNumber, chapterTitle }: NotesUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async () => {
        if (!file) throw new Error("No file selected");
        
        // Upload to R2
        const uploadRes = await contentApi.uploadNotes(file, courseId, chapterNumber);
        const { notesUrl } = uploadRes.data.data;

        // Find the chapter by courseId + chapterNumber
        const chaptersRes = await chaptersApi.getByCourse(courseId);
        const chapter = chaptersRes.data.data.find(
        (ch: Chapter) => ch.chapterNumber === chapterNumber
        );
        
        if (!chapter) throw new Error("Chapter not found");

        // Update chapter with notesUrl
        await chaptersApi.update(chapter._id, { notesUrl });

        return { notesUrl };
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["chapters"] });
        toast.success("Notes uploaded successfully");
        setFile(null);
    },
    onError: (error: Error) => {
        toast.error(error.message);
    },
    });

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="pdf">Select PDF File</Label>
        <Input
          id="pdf"
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          disabled={uploadMutation.isPending}
        />
        <p className="text-xs text-slate-500 mt-1">
          Max 10MB. PDF only.
        </p>
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
            Upload Notes
          </>
        )}
      </Button>

      {uploadMutation.isSuccess && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded">
          <CheckCircle2 className="h-4 w-4" />
          Notes uploaded and chapter updated
        </div>
      )}
    </div>
  );
}