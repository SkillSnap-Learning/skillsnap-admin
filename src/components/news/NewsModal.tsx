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
import { News, ContentBlock, BlogCategory, BlockType } from "@/types";
import { newsApi } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Trash2, ChevronUp, ChevronDown, ImageIcon, Loader2 } from "lucide-react";

interface NewsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  news: News | null;
  onSubmit: (data: NewsFormData) => Promise<void>;
  isSubmitting: boolean;
  existingNews: News[];
}

export interface NewsFormData {
  title: string;
  slug: string;
  excerpt: string;
  category: BlogCategory;
  coverImage?: string | null;
  tags: string[];
  readTime?: string;
  blocks: ContentBlock[];
  relatedNews: string[];
  isPublished: boolean;
}

const generateSlug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");

const emptyBlock = (type: BlockType): ContentBlock => {
  switch (type) {
    case "bullets":
    case "numbered":
      return { type, items: [""] };
    case "image":
      return { type, src: "", alt: "", alignment: "center" };
    default:
      return { type, text: "" };
  }
};

function BlockEditor({
  block, index, newsId, onChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast,
}: {
  block: ContentBlock; index: number; newsId: string;
  onChange: (index: number, updated: ContentBlock) => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isFirst: boolean; isLast: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (fields: Partial<ContentBlock>) => onChange(index, { ...block, ...fields });

  const handleImageUpload = async (file: File) => {
    if (!newsId) { toast.error("Save the news first before uploading images"); return; }
    setUploading(true);
    try {
      const result = await newsApi.uploadImage(file, newsId);
      update({ src: result.imageUrl });
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{block.type}</span>
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={() => onMoveUp(index)} disabled={isFirst}>
            <ChevronUp className="h-3 w-3" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => onMoveDown(index)} disabled={isLast}>
            <ChevronDown className="h-3 w-3" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {(block.type === "paragraph" || block.type === "heading" || block.type === "quote") && (
        <Textarea
          value={block.text ?? ""}
          onChange={(e) => update({ text: e.target.value })}
          placeholder={block.type === "heading" ? "Heading text..." : block.type === "quote" ? "Quote text..." : "Paragraph text..."}
          rows={block.type === "paragraph" ? 4 : 2}
          className="bg-white text-sm"
        />
      )}

      {(block.type === "bullets" || block.type === "numbered") && (
        <div className="space-y-2">
          {(block.items ?? []).map((item, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-slate-400 text-sm mt-2 w-4 shrink-0">
                {block.type === "numbered" ? `${i + 1}.` : "•"}
              </span>
              <Input
                value={item}
                onChange={(e) => {
                  const updated = [...(block.items ?? [])];
                  updated[i] = e.target.value;
                  update({ items: updated });
                }}
                placeholder={`Item ${i + 1}`}
                className="bg-white text-sm"
              />
              <Button
                type="button" variant="ghost" size="sm"
                onClick={() => update({ items: (block.items ?? []).filter((_, j) => j !== i) })}
                className="text-red-400 hover:text-red-600 shrink-0"
                disabled={(block.items ?? []).length <= 1}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => update({ items: [...(block.items ?? []), ""] })} className="text-xs">
            <Plus className="h-3 w-3 mr-1" /> Add Item
          </Button>
        </div>
      )}

      {block.type === "image" && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading} className="text-xs">
              {uploading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <ImageIcon className="h-3 w-3 mr-1" />}
              {uploading ? "Uploading..." : "Upload Image"}
            </Button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); }}
            />
            {block.src && <span className="text-xs text-green-600">✓ Image uploaded</span>}
          </div>
          {block.src && <img src={block.src} alt={block.alt ?? ""} className="w-full max-h-40 object-cover rounded-lg" />}
          <Input value={block.alt ?? ""} onChange={(e) => update({ alt: e.target.value })} placeholder="Alt text (optional)" className="bg-white text-sm" />
          <Select value={block.alignment ?? "center"} onValueChange={(val) => update({ alignment: val as "center" | "full" })}>
            <SelectTrigger className="bg-white text-sm h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="full">Full Width</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

export function NewsModal({ open, onOpenChange, news, onSubmit, isSubmitting, existingNews }: NewsModalProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState<BlogCategory>("new");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [readTime, setReadTime] = useState("");
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
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
      setBlocks(news.blocks ?? []);
      setRelatedNews((news.relatedNews ?? []).map((p: any) => typeof p === "string" ? p : p._id));
      setIsPublished(news.isPublished);
    } else {
      setTitle(""); setSlug(""); setExcerpt(""); setCategory("new");
      setCoverImage(null); setTagsInput(""); setReadTime("");
      setBlocks([]); setRelatedNews([]); setIsPublished(false);
    }
  }, [news, open]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!news) setSlug(generateSlug(val));
  };

  const handleCoverUpload = async (file: File) => {
    if (!newsId) { toast.error("Save the news first before uploading a cover image"); return; }
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

  const addBlock = (type: BlockType) => setBlocks((prev) => [...prev, emptyBlock(type)]);
  const updateBlock = (index: number, updated: ContentBlock) => setBlocks((prev) => prev.map((b, i) => i === index ? updated : b));
  const removeBlock = (index: number) => setBlocks((prev) => prev.filter((_, i) => i !== index));
  const moveBlock = (index: number, direction: "up" | "down") => {
    setBlocks((prev) => {
      const arr = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  };

  const toggleRelated = (id: string) =>
    setRelatedNews((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);

  const handleSubmit = async () => {
    if (!title || !slug || !excerpt || !category) {
      toast.error("Title, slug, excerpt and category are required");
      return;
    }
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    await onSubmit({ title, slug, excerpt, category, coverImage, tags, readTime: readTime || undefined, blocks, relatedNews, isPublished });
  };

  const otherNews = existingNews.filter((n) => n._id !== news?._id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{news ? "Edit News" : "Create News"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Title *</Label>
              <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="News title" />
            </div>
            <div className="space-y-1.5">
              <Label>Slug *</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="news-slug" />
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={category} onValueChange={(val) => setCategory(val as BlogCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="hot">Hot</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Excerpt *</Label>
              <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short description" rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Tags (comma separated)</Label>
              <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="CBSE, Exams, Tips" />
            </div>
            <div className="space-y-1.5">
              <Label>Read Time</Label>
              <Input value={readTime} onChange={(e) => setReadTime(e.target.value)} placeholder="5 min read" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cover Image</Label>
            {!newsId ? (
              <p className="text-xs text-slate-400">Save the news first to enable cover image upload.</p>
            ) : (
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => coverRef.current?.click()} disabled={coverUploading}>
                  {coverUploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <ImageIcon className="h-4 w-4 mr-1" />}
                  {coverUploading ? "Uploading..." : "Upload Cover"}
                </Button>
                <input ref={coverRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const file = e.target.files?.[0]; if (file) handleCoverUpload(file); }}
                />
                {coverImage && <span className="text-xs text-green-600">✓ Cover uploaded</span>}
              </div>
            )}
            {coverImage && <img src={coverImage} alt="Cover" className="w-full max-h-40 object-cover rounded-lg mt-2" />}
          </div>

          <div className="space-y-3">
            <Label>Content Blocks</Label>
            {blocks.length === 0 && <p className="text-sm text-slate-400">No blocks yet. Add your first block below.</p>}
            {blocks.map((block, i) => (
              <BlockEditor key={i} block={block} index={i} newsId={newsId}
                onChange={updateBlock} onRemove={removeBlock}
                onMoveUp={(idx) => moveBlock(idx, "up")}
                onMoveDown={(idx) => moveBlock(idx, "down")}
                isFirst={i === 0} isLast={i === blocks.length - 1}
              />
            ))}
            <div className="flex flex-wrap gap-2 pt-1">
              {(["paragraph", "heading", "bullets", "numbered", "image", "quote"] as BlockType[]).map((type) => (
                <Button key={type} type="button" variant="outline" size="sm" onClick={() => addBlock(type)} className="text-xs capitalize">
                  <Plus className="h-3 w-3 mr-1" />{type}
                </Button>
              ))}
            </div>
          </div>

          {otherNews.length > 0 && (
            <div className="space-y-2">
              <Label>Related News</Label>
              <div className="border border-slate-200 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                {otherNews.map((n) => (
                  <label key={n._id} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={relatedNews.includes(n._id)} onChange={() => toggleRelated(n._id)} className="accent-blue-950" />
                    <span className="text-sm text-slate-700">{n.title}</span>
                    <span className="text-xs text-slate-400 ml-auto capitalize">{n.category}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="accent-blue-950 w-4 h-4" />
            <span className="text-sm font-medium text-slate-700">Publish immediately</span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-950 hover:bg-blue-900">
              {isSubmitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {news ? "Update News" : "Create News"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}