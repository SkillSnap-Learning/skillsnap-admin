"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Blog, BlogCategory } from "@/types";
import { blogsApi } from "@/lib/api";
import { toast } from "sonner";
import { ImageIcon, Loader2 } from "lucide-react";
import { TipTapEditor } from "@/components/shared/TipTapEditor";

interface BlogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blog: Blog | null;
  onSubmit: (data: BlogFormData) => Promise<void>;
  isSubmitting: boolean;
  existingBlogs: Blog[];
}

export interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  category: BlogCategory;
  coverImage?: string | null;
  tags: string[];
  readTime?: string;
  content: string;
  relatedPosts: string[];
  isPublished: boolean;
}

const generateSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

export function BlogModal({
  open,
  onOpenChange,
  blog,
  onSubmit,
  isSubmitting,
  existingBlogs,
}: BlogModalProps) {
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
    } else {
      setTitle("");
      setSlug("");
      setExcerpt("");
      setCategory("new");
      setCoverImage(null);
      setTagsInput("");
      setReadTime("");
      setContent("");
      setRelatedPosts([]);
      setIsPublished(false);
    }
  }, [blog, open]);

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

  // This is passed to TipTapEditor for inline image uploads
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
      relatedPosts,
      isPublished,
    });
  };

  const otherBlogs = existingBlogs.filter((b) => b._id !== blog?._id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{blog ? "Edit Blog" : "Create Blog"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">

          {/* Basic Info */}
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
              <Select
                value={category}
                onValueChange={setCategory}              >
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

          {/* Cover Image */}
          <div className="space-y-2">
            <Label>Cover Image</Label>
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
                className="w-full max-h-40 object-cover rounded-lg mt-2"
              />
            )}
          </div>

          {/* TipTap Editor */}
          <div className="space-y-2">
            <Label>Content</Label>
            {!blogId && (
              <p className="text-xs text-slate-400">
                Save the blog first to enable inline image uploads inside the editor.
              </p>
            )}
            <TipTapEditor
              value={content}
              onChange={setContent}
              onImageUpload={handleEditorImageUpload}
              disabled={false}
            />
          </div>

          {/* Related Posts */}
          {otherBlogs.length > 0 && (
            <div className="space-y-2">
              <Label>Related Posts</Label>
              <div className="border border-slate-200 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
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

          {/* Publish Toggle */}
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

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-blue-950 hover:bg-blue-900"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : null}
              {blog ? "Update Blog" : "Create Blog"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}