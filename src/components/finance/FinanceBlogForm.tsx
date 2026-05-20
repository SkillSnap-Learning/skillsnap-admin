"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { FinanceBlog, FinanceCategory } from "@/types";
import { financeBlogsApi } from "@/lib/api";
import { toast } from "sonner";
import { ImageIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { TipTapEditor } from "@/components/shared/TipTapEditor";

export interface FinanceBlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  coverImage?: string | null;
  tags: string[];
  readTime?: string;
  content: string;
  relatedPosts: string[];
  relatedCalculators: { label: string; href: string }[];
  disclaimer: boolean;
  faqs: { question: string; answer: string }[];
  faqsTitle: string;
  metaTitle: string;
  metaDescription: string;
  isPublished: boolean;
}

interface Props {
  blog?: FinanceBlog | null;
  existingBlogs: FinanceBlog[];
  categories: FinanceCategory[];
  onSubmit: (data: FinanceBlogFormData) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

const generateSlug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");

export function FinanceBlogForm({
  blog, existingBlogs, categories, onSubmit, isSubmitting, onCancel,
}: Props) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [readTime, setReadTime] = useState("");
  const [content, setContent] = useState("");
  const [relatedPosts, setRelatedPosts] = useState<string[]>([]);
  const [relatedCalculators, setRelatedCalculators] = useState<{ label: string; href: string }[]>([{ label: "", href: "" }]);
  const [disclaimer, setDisclaimer] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([{ question: "", answer: "" }]);
  const [faqsTitle, setFaqsTitle] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const coverRef = useRef<HTMLInputElement>(null);

  const blogId = blog?._id ?? "";

  useEffect(() => {
    if (!blog) return;
    setTitle(blog.title);
    setSlug(blog.slug);
    setExcerpt(blog.excerpt);
    setCategory(typeof blog.category === "object" ? (blog.category as FinanceCategory)._id : blog.category);
    setCoverImage(blog.coverImage ?? null);
    setTagsInput(blog.tags.join(", "));
    setReadTime(blog.readTime ?? "");
    setContent(blog.content ?? "");
    setRelatedPosts((blog.relatedPosts ?? []).map((p: any) => typeof p === "string" ? p : p._id));
    setRelatedCalculators(blog.relatedCalculators?.length > 0 ? blog.relatedCalculators : [{ label: "", href: "" }]);
    setDisclaimer(blog.disclaimer ?? false);
    setIsPublished(blog.isPublished);
    setFaqs(blog.faqs?.length > 0 ? blog.faqs : [{ question: "", answer: "" }]);
    setFaqsTitle(blog.faqsTitle ?? "");
    setMetaTitle(blog.metaTitle ?? "");
    setMetaDescription(blog.metaDescription ?? "");
  }, [blog]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!blog) setSlug(generateSlug(val));
  };

  const handleCoverUpload = async (file: File) => {
    if (!blogId) { toast.error("Save the blog first before uploading cover"); return; }
    setCoverUploading(true);
    try {
      const result = await financeBlogsApi.uploadImage(file, blogId);
      setCoverImage(result.imageUrl);
      toast.success("Cover uploaded");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCoverUploading(false);
    }
  };

  const handleEditorImageUpload = async (file: File): Promise<string> => {
    if (!blogId) throw new Error("Save blog first");
    const result = await financeBlogsApi.uploadImage(file, blogId);
    return result.imageUrl;
  };

  // Related calculators
  const updateCalc = (i: number, key: "label" | "href", val: string) =>
    setRelatedCalculators(prev => prev.map((c, idx) => idx === i ? { ...c, [key]: val } : c));
  const addCalc = () => setRelatedCalculators(prev => [...prev, { label: "", href: "" }]);
  const removeCalc = (i: number) => setRelatedCalculators(prev => prev.filter((_, idx) => idx !== i));

  // FAQs
  const updateFaq = (i: number, field: "question" | "answer", val: string) =>
    setFaqs(prev => prev.map((f, idx) => idx === i ? { ...f, [field]: val } : f));
  const addFaq = () => setFaqs(prev => [...prev, { question: "", answer: "" }]);
  const removeFaq = (i: number) => setFaqs(prev => prev.filter((_, idx) => idx !== i));

  const toggleRelated = (id: string) =>
    setRelatedPosts(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);

  const handleSubmit = async () => {
    if (!title || !slug || !excerpt || !category) {
      toast.error("Title, slug, excerpt and category are required");
      return;
    }
    await onSubmit({
      title, slug, excerpt, category, coverImage,
      tags: tagsInput.split(",").map(t => t.trim()).filter(Boolean),
      readTime: readTime || undefined,
      content, relatedPosts,
      relatedCalculators: relatedCalculators.filter(c => c.label && c.href),
      disclaimer, isPublished,
      faqs: faqs.filter(f => f.question && f.answer),
      faqsTitle, metaTitle, metaDescription,
    });
  };

  const otherBlogs = existingBlogs.filter(b => b._id !== blog?._id);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Basic Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Title *</Label>
            <Input value={title} onChange={e => handleTitleChange(e.target.value)} placeholder="Why index funds beat 90% of active funds" />
          </div>
          <div className="space-y-1.5">
            <Label>Slug *</Label>
            <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="index-funds-vs-active-funds" />
          </div>
          <div className="space-y-1.5">
            <Label>Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Excerpt *</Label>
            <Textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Short description shown on listing page" rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label>Tags (comma separated)</Label>
            <Input value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="Investing, Mutual Funds, Index Funds" />
          </div>
          <div className="space-y-1.5">
            <Label>Read Time</Label>
            <Input value={readTime} onChange={e => setReadTime(e.target.value)} placeholder="6 mins read" />
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Cover Image</h2>
        {!blogId ? (
          <p className="text-xs text-slate-400">Save the blog first to enable cover image upload.</p>
        ) : (
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="sm"
              onClick={() => coverRef.current?.click()} disabled={coverUploading}>
              {coverUploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <ImageIcon className="h-4 w-4 mr-1" />}
              {coverUploading ? "Uploading..." : "Upload Cover"}
            </Button>
            <input ref={coverRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); }} />
            {coverImage && <span className="text-xs text-green-600">✓ Cover uploaded</span>}
          </div>
        )}
        {coverImage && <img src={coverImage} alt="Cover" className="w-full max-h-60 object-cover rounded-lg mt-2" />}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Content</h2>
        {!blogId && <p className="text-xs text-slate-400">Save the blog first to enable inline image uploads.</p>}
        <TipTapEditor value={content} onChange={setContent} onImageUpload={handleEditorImageUpload} />
      </div>

      {/* Related Calculators — Finance specific */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Related Calculators</h2>
          <Button type="button" variant="outline" size="sm" onClick={addCalc}>
            <Plus className="h-3 w-3 mr-1" /> Add
          </Button>
        </div>
        <p className="text-xs text-slate-400">Link relevant calculators to appear in the article sidebar.</p>
        {relatedCalculators.map((c, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input value={c.label} onChange={e => updateCalc(i, "label", e.target.value)} placeholder="SIP Calculator" className="text-sm" />
              <Input value={c.href} onChange={e => updateCalc(i, "href", e.target.value)} placeholder="/calculators/sip-calculator" className="text-sm font-mono" />
            </div>
            <Button type="button" variant="ghost" size="sm"
              onClick={() => removeCalc(i)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-0.5"
              disabled={relatedCalculators.length <= 1}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Related Posts */}
      {otherBlogs.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Related Posts</h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {otherBlogs.map(b => (
              <label key={b._id} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={relatedPosts.includes(b._id)}
                  onChange={() => toggleRelated(b._id)} className="accent-blue-950" />
                <span className="text-sm text-slate-700">{b.title}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* FAQs */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">FAQs</h2>
        <div className="space-y-1.5">
          <Label>Section Heading</Label>
          <Input value={faqsTitle} onChange={e => setFaqsTitle(e.target.value)} placeholder="Frequently asked questions" />
        </div>
        {faqs.map((faq, i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">FAQ {i + 1}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeFaq(i)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50" disabled={faqs.length <= 1}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <Input value={faq.question} onChange={e => updateFaq(i, "question", e.target.value)} placeholder="Question" className="bg-white" />
            <Textarea value={faq.answer} onChange={e => updateFaq(i, "answer", e.target.value)} placeholder="Answer" rows={2} className="bg-white text-sm" />
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addFaq} className="text-xs">
          <Plus className="h-3 w-3 mr-1" /> Add FAQ
        </Button>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">SEO</h2>
        <div className="space-y-1.5">
          <Label>Meta Title</Label>
          <Input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder="Leave empty to use title" />
          <p className="text-xs text-slate-400">
            <span className={metaTitle.length > 60 ? "text-red-500" : "text-slate-400"}>{metaTitle.length}/60</span>
          </p>
        </div>
        <div className="space-y-1.5">
          <Label>Meta Description</Label>
          <Textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} placeholder="Leave empty to use excerpt" rows={3} className="text-sm" />
          <p className="text-xs text-slate-400">
            <span className={metaDescription.length > 160 ? "text-red-500" : "text-slate-400"}>{metaDescription.length}/160</span>
          </p>
        </div>
      </div>

      {/* Disclaimer + Publish + Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={disclaimer} onChange={e => setDisclaimer(e.target.checked)} className="accent-emerald-600 w-4 h-4" />
            <span className="text-sm font-medium text-slate-700">Show SEBI disclaimer</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="accent-blue-950 w-4 h-4" />
            <span className="text-sm font-medium text-slate-700">Publish immediately</span>
          </label>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-950 hover:bg-blue-900">
            {isSubmitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            {blog ? "Update Blog" : "Create Blog"}
          </Button>
        </div>
      </div>
    </div>
  );
}