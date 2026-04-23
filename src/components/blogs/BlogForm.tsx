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
import { Blog } from "@/types";
import { blogsApi, categoriesApi } from "@/lib/api";
import { toast } from "sonner";
import { ImageIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { TipTapEditor } from "@/components/shared/TipTapEditor";

export interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  coverImage?: string | null;
  tags: string[];
  readTime?: string;
  content: string;
  relatedPosts: string[];
  isPublished: boolean;
  faqs: { question: string; answer: string }[];
}

interface BlogFormProps {
  blog?: Blog | null;
  existingBlogs: Blog[];
  categories: { _id: string; name: string; slug: string }[];
  onSubmit: (data: BlogFormData) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

const generateSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

export function BlogForm({
  blog,
  existingBlogs,
  categories,
  onSubmit,
  isSubmitting,
  onCancel,
}: BlogFormProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState<string>("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [readTime, setReadTime] = useState("");
  const [content, setContent] = useState("");
  const [relatedPosts, setRelatedPosts] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([{ question: "", answer: "" }]);
  const coverRef = useRef<HTMLInputElement>(null);

  const blogId = blog?._id ?? "";

  useEffect(() => {
    if (blog) {
      setTitle(blog.title);
      setSlug(blog.slug);
      setExcerpt(blog.excerpt);
      setCategory(
        typeof blog.category === "object"
          ? (blog.category as any)._id
          : blog.category
      );      setCoverImage(blog.coverImage ?? null);
      setTagsInput(blog.tags.join(", "));
      setReadTime(blog.readTime ?? "");
      setContent(blog.content ?? "");
      setRelatedPosts(
        (blog.relatedPosts ?? []).map((p: any) =>
          typeof p === "string" ? p : p._id
        )
      );
      setIsPublished(blog.isPublished);
      setFaqs(blog.faqs && blog.faqs.length > 0 ? blog.faqs : [{ question: "", answer: "" }]);
    }
  }, [blog]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!blog) setSlug(generateSlug(val));
  };

  const handleCoverUpload = async (file: File) => {
    if (!blogId) {
      toast.error("Save the blog first before uploading a cover image");
      return;
    }
    setCoverUploading(true);
    try {
      const result = await blogsApi.uploadImage(file, blogId);
      setCoverImage(result.imageUrl);
      toast.success("Cover image uploaded");
    } catch (e: any) {
      toast.error(e.message || "Cover upload failed");
    } finally {
      setCoverUploading(false);
    }
  };

  const handleEditorImageUpload = async (file: File): Promise<string> => {
    if (!blogId) {
      toast.error("Save the blog first before uploading images");
      throw new Error("No blogId");
    }
    const result = await blogsApi.uploadImage(file, blogId);
    return result.imageUrl;
  };

  const toggleRelated = (id: string) => {
    setRelatedPosts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const updateFaq = (index: number, field: "question" | "answer", val: string) =>
    setFaqs((prev) => prev.map((f, i) => (i === index ? { ...f, [field]: val } : f)));
  const addFaq = () => setFaqs((prev) => [...prev, { question: "", answer: "" }]);
  const removeFaq = (index: number) => setFaqs((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!title || !slug || !excerpt || !category) {
      toast.error("Title, slug, excerpt and category are required");
      return;
    }
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const cleanFaqs = faqs.filter((f) => f.question && f.answer);

    await onSubmit({
      title,
      slug,
      excerpt,
      category,
      coverImage,
      tags,
      readTime: readTime || undefined,
      content,
      relatedPosts,
      isPublished,
      faqs: cleanFaqs,
    });
  };

  const otherBlogs = existingBlogs.filter((b) => b._id !== blog?._id);

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
              placeholder="Blog title"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Slug *</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="blog-slug"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.length === 0 ? (
                  <div className="px-2 py-3 text-sm text-slate-400 text-center">
                    No categories yet — create one first
                  </div>
                ) : (
                  categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))
                )}
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
              placeholder="CBSE, Maths, Tips"
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
        {!blogId ? (
          <p className="text-xs text-slate-400">
            Save the blog first to enable cover image upload.
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
        {!blogId && (
          <p className="text-xs text-slate-400">
            Save the blog first to enable inline image uploads inside the editor.
          </p>
        )}
        <TipTapEditor
          value={content}
          onChange={setContent}
          onImageUpload={handleEditorImageUpload}
        />
      </div>

      {/* Related Posts */}
      {otherBlogs.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            Related Posts
          </h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {otherBlogs.map((b) => (
              <label
                key={b._id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={relatedPosts.includes(b._id)}
                  onChange={() => toggleRelated(b._id)}
                  className="accent-blue-950"
                />
                <span className="text-sm text-slate-700">{b.title}</span>
                <span className="text-xs text-slate-400 ml-auto capitalize">
                  {typeof b.category === "object" ? b.category.name : b.category}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* FAQs */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
          FAQs
        </h2>
        {faqs.map((faq, i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">FAQ {i + 1}</span>
              <Button type="button" variant="ghost" size="sm"
                onClick={() => removeFaq(i)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                disabled={faqs.length <= 1}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-2">
              <Input value={faq.question} onChange={(e) => updateFaq(i, "question", e.target.value)}
                placeholder="Question" className="bg-white" />
              <Textarea value={faq.answer} onChange={(e) => updateFaq(i, "answer", e.target.value)}
                placeholder="Answer" rows={2} className="bg-white text-sm" />
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addFaq} className="text-xs">
          <Plus className="h-3 w-3 mr-1" /> Add FAQ
        </Button>
      </div>

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
            {blog ? "Update Blog" : "Create Blog"}
          </Button>
        </div>
      </div>
    </div>
  );
}