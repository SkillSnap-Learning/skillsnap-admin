"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { coursesApi, chaptersApi } from "@/lib/api";
import { Course, Chapter } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { VideoUpload } from "@/components/content/VideoUpload";
import { NotesUpload } from "@/components/content/NotesUpload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContentUploadPage() {
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedChapter, setSelectedChapter] = useState<string>("");

  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await coursesApi.getAll();
      return res.data.data as Course[];
    },
  });

  const { data: chapters } = useQuery({
    queryKey: ["chapters", selectedCourse],
    queryFn: async () => {
      if (!selectedCourse) return [];
      const res = await chaptersApi.getByCourse(selectedCourse);
      return res.data.data as Chapter[];
    },
    enabled: !!selectedCourse,
  });

  const selectedChapterData = chapters?.find(ch => ch._id === selectedChapter);
  const selectedCourseData = courses?.find(c => c._id === selectedCourse);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-950">Content Upload</h1>

      <div className="grid gap-4 max-w-2xl">
        <div>
          <Label>Select Course</Label>
          <Select value={selectedCourse} onValueChange={(val) => {
            setSelectedCourse(val);
            setSelectedChapter("");
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a course" />
            </SelectTrigger>
            <SelectContent>
              {courses?.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.title} (Class {c.class})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCourse && (
          <div>
            <Label>Select Chapter</Label>
            <Select value={selectedChapter} onValueChange={setSelectedChapter}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a chapter" />
              </SelectTrigger>
              <SelectContent>
                {chapters?.map((ch) => (
                  <SelectItem key={ch._id} value={ch._id}>
                    Ch {ch.chapterNumber}: {ch.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {selectedChapter && selectedChapterData && selectedCourseData && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Video</CardTitle>
              <CardDescription>
                Upload chapter video to Cloudflare Stream
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VideoUpload
                chapterId={selectedChapter}
                chapterTitle={selectedChapterData.title}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload Notes PDF</CardTitle>
              <CardDescription>
                Upload chapter notes to R2 storage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotesUpload
                courseId={selectedCourse}
                chapterNumber={selectedChapterData.chapterNumber}
                chapterTitle={selectedChapterData.title}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}