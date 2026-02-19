"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contentApi, chaptersApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface NotesUploadProps {
  courseId: string;
  chapterNumber: number;
  chapterTitle: string;
  chapterId: string;
}

export function NotesUpload({ courseId, chapterNumber, chapterTitle, chapterId }: NotesUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const { data: chapterData, isLoading: chapterLoading } = useQuery({
    queryKey: ["chapter", chapterId],
    queryFn: async () => {
      const res = await chaptersApi.getById(chapterId);
      return res.data.data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");
      await contentApi.uploadNotes(file, courseId, chapterNumber, chapterId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      queryClient.invalidateQueries({ queryKey: ["chapter", chapterId] });
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
        {chapterLoading ? (
          <p className="text-sm text-slate-500">Loading chapter info...</p>
        ) : chapterData?.notesUrl ? (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded mb-2">
            <CheckCircle2 className="h-4 w-4" />
            Notes uploaded: <strong>{chapterData.notesFileName || chapterData.notesUrl}</strong>
          </div>
        ) : null}

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
            {chapterData?.notesUrl ? "Re-upload Notes" : "Upload Notes"}
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