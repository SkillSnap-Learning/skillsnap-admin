"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { News, BlogCategory } from "@/types";
import { newsApi } from "@/lib/api";
import { toast } from "sonner";
import { ImageIcon, Loader2 } from "lucide-react";
import { TipTapEditor } from "@/components/shared/TipTapEditor";

export interface NewsFormData {
  title: string;
  slug: string;
  excerpt: string;
  category: BlogCategory;
  coverImage?: string | null;
  tags: string[];
  readTime?: string;
  content: string;
  relatedNews: string[];
  isPublished: boolean;
}

interface NewsFormProps {
  news?: News | null;
  existingNews: News[];
  onSubmit: (data: NewsFormData) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

const generateSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

export function NewsForm({
  news,
  existingNews,
  onSubmit,
  isSubmitting,
  onCancel,
}: NewsFormProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState<BlogCategory>("new");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [readTime, setReadTime] = useState("");
  const [content, setContent] = useState("");
  const [relatedNews, setRelatedNews] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const coverRef = useRef<HTMLInputElement>(null);

  const newsId = news?._id ?? "";

  useEffect(() => {
    if (news) {
      setTitle(news.title);
      setSlug(news.slug);
      setExcerpt(news.excerpt);
      setCategory(news.category);
      setCoverImage(news.coverImage ?? null);
      setTagsInput(news.tags.join(", "));
      setReadTime(news.readTime ?? "");
      setContent(news.content ?? "");
      setRelatedNews(
        (news.relatedNews ?? []).map((p: any) =>
          typeof p === "string" ? p : p._id
        )
      );
      setIsPublished(news.isPublished);
    }
  }, [news]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!news) setSlug(generateSlug(val));
  };

  const handleCoverUpload = async (file: File) => {
    if (!newsId) {
      toast.error("Save the news first before uploading a cover image");
      return;
    }
    setCoverUploading(true);
    try {
      const result = await newsApi.uploadImage(file, newsId);
      setCoverImage(result.imageUrl);
      toast.success("Cover image uploaded");
    } catch (e: any) {
      toast.error(e.message || "Cover upload failed");
    } finally {
      setCoverUploading(false);
    }
  };

  const handleEditorImageUpload = async (file: File): Promise<string> => {
    if (!newsId) {
      toast.error("Save the news first before uploading images");
      throw new Error("No newsId");
    }
    const result = await newsApi.uploadImage(file, newsId);
    return result.imageUrl;
  };

  const toggleRelated = (id: string) => {
    setRelatedNews((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!title || !slug || !excerpt || !category) {
      toast.error("Title, slug, excerpt and category are required");
      return;
    }
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    await onSubmit({
      title,
      slug,
      excerpt,
      category,
      coverImage,
      tags,
      readTime: readTime || undefined,
      content,
      relatedNews,
      isPublished,
    });
  };

  const otherNews = existingNews.filter((n) => n._id !== news?._id);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
          Basic Info
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Title *</Label>
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="News title"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Slug *</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="news-slug"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Category *</Label>
            <Select
              value={category}
              onValueChange={(val) => setCategory(val as BlogCategory)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Excerpt *</Label>
            <Textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short description shown on listing page"
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Tags (comma separated)</Label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="CBSE, Exams, Tips"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Read Time</Label>
            <Input
              value={readTime}
              onChange={(e) => setReadTime(e.target.value)}
              placeholder="5 min read"
            />
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
          Cover Image
        </h2>
        {!newsId ? (
          <p className="text-xs text-slate-400">
            Save the news first to enable cover image upload.
          </p>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => coverRef.current?.click()}
              disabled={coverUploading}
            >
              {coverUploading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <ImageIcon className="h-4 w-4 mr-1" />
              )}
              {coverUploading ? "Uploading..." : "Upload Cover"}
            </Button>
            <input
              ref={coverRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCoverUpload(file);
              }}
            />
            {coverImage && (
              <span className="text-xs text-green-600">✓ Cover uploaded</span>
            )}
          </div>
        )}
        {coverImage && (
          <img
            src={coverImage}
            alt="Cover"
            className="w-full max-h-60 object-cover rounded-lg mt-2"
          />
        )}
      </div>

      {/* Content Editor */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
          Content
        </h2>
        {!newsId && (
          <p className="text-xs text-slate-400">
            Save the news first to enable inline image uploads inside the editor.
          </p>
        )}
        <TipTapEditor
          value={content}
          onChange={setContent}
          onImageUpload={handleEditorImageUpload}
        />
      </div>

      {/* Related News */}
      {otherNews.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            Related News
          </h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {otherNews.map((n) => (
              <label
                key={n._id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={relatedNews.includes(n._id)}
                  onChange={() => toggleRelated(n._id)}
                  className="accent-blue-950"
                />
                <span className="text-sm text-slate-700">{n.title}</span>
                <span className="text-xs text-slate-400 ml-auto capitalize">
                  {n.category}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Publish + Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-between">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="accent-blue-950 w-4 h-4"
          />
          <span className="text-sm font-medium text-slate-700">
            Publish immediately
          </span>
        </label>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-950 hover:bg-blue-900"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            {news ? "Update News" : "Create News"}
          </Button>
        </div>
      </div>
    </div>
  );
}