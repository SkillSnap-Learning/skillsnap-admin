"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Course, ContentBlock, BlockType, CoursePlanType, ClassType } from "@/types";
import { coursesApi } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Trash2, ChevronUp, ChevronDown, ImageIcon, Loader2 } from "lucide-react";

interface CourseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
  onSubmit: (data: CourseFormData) => Promise<void>;
  isSubmitting: boolean;
}

export interface CourseFormData {
  title: string;
  slug: string;
  class: ClassType;
  planType: CoursePlanType;
  tagline: string;
  coverImage?: string | null;
  subjectTags: string[];
  price: number;
  originalPrice: number;
  enrollPoints: string[];
  blocks: ContentBlock[];
  faqs: { question: string; answer: string }[];
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

/* ── Block Editor (same pattern as BlogModal) ── */
function BlockEditor({
  block, index, courseId, onChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast,
}: {
  block: ContentBlock; index: number; courseId: string;
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
    if (!courseId) { toast.error("Save the course first before uploading images"); return; }
    setUploading(true);
    try {
      const result = await coursesApi.uploadImage(file, courseId);
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
          <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50">
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
          <Button type="button" variant="outline" size="sm"
            onClick={() => update({ items: [...(block.items ?? []), ""] })} className="text-xs">
            <Plus className="h-3 w-3 mr-1" /> Add Item
          </Button>
        </div>
      )}

      {block.type === "image" && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="sm"
              onClick={() => fileRef.current?.click()} disabled={uploading} className="text-xs">
              {uploading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <ImageIcon className="h-3 w-3 mr-1" />}
              {uploading ? "Uploading..." : "Upload Image"}
            </Button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); }}
            />
            {block.src && <span className="text-xs text-green-600">✓ Image uploaded</span>}
          </div>
          {block.src && <img src={block.src} alt={block.alt ?? ""} className="w-full max-h-40 object-cover rounded-lg" />}
          <Input value={block.alt ?? ""} onChange={(e) => update({ alt: e.target.value })}
            placeholder="Alt text (optional)" className="bg-white text-sm" />
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

/* ── Main Modal ── */
export function CourseModal({ open, onOpenChange, course, onSubmit, isSubmitting }: CourseModalProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [cls, setCls] = useState<ClassType>("6");
  const [planType, setPlanType] = useState<CoursePlanType>("core");
  const [tagline, setTagline] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [subjectTagsInput, setSubjectTagsInput] = useState("");
  const [price, setPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [enrollPoints, setEnrollPoints] = useState<string[]>([""]);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([{ question: "", answer: "" }]);
  const [isPublished, setIsPublished] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const coverRef = useRef<HTMLInputElement>(null);

  const courseId = course?._id ?? "";

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setSlug(course.slug);
      setCls(course.class);
      setPlanType(course.planType);
      setTagline(course.tagline ?? "");
      setCoverImage(course.coverImage ?? null);
      setSubjectTagsInput(course.subjectTags.join(", "));
      setPrice(course.price);
      setOriginalPrice(course.originalPrice);
      setEnrollPoints(course.enrollPoints.length > 0 ? course.enrollPoints : [""]);
      setBlocks(course.blocks ?? []);
      setFaqs(course.faqs.length > 0 ? course.faqs : [{ question: "", answer: "" }]);
      setIsPublished(course.isPublished);
    } else {
      setTitle(""); setSlug(""); setCls("6"); setPlanType("core");
      setTagline(""); setCoverImage(null); setSubjectTagsInput("");
      setPrice(0); setOriginalPrice(0); setEnrollPoints([""]);
      setBlocks([]); setFaqs([{ question: "", answer: "" }]); setIsPublished(false);
    }
  }, [course, open]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!course) setSlug(generateSlug(val));
  };

  const handleCoverUpload = async (file: File) => {
    if (!courseId) { toast.error("Save the course first before uploading a cover image"); return; }
    setCoverUploading(true);
    try {
      const result = await coursesApi.uploadImage(file, courseId);
      setCoverImage(result.imageUrl);
      toast.success("Cover image uploaded");
    } catch (e: any) {
      toast.error(e.message || "Cover upload failed");
    } finally {
      setCoverUploading(false);
    }
  };

  // Block operations
  const addBlock = (type: BlockType) => setBlocks((prev) => [...prev, emptyBlock(type)]);
  const updateBlock = (index: number, updated: ContentBlock) =>
    setBlocks((prev) => prev.map((b, i) => (i === index ? updated : b)));
  const removeBlock = (index: number) => setBlocks((prev) => prev.filter((_, i) => i !== index));
  const moveBlock = (index: number, direction: "up" | "down") => {
    setBlocks((prev) => {
      const arr = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return arr;
    });
  };

  // Enroll points operations
  const updateEnrollPoint = (index: number, val: string) =>
    setEnrollPoints((prev) => prev.map((p, i) => (i === index ? val : p)));
  const addEnrollPoint = () => setEnrollPoints((prev) => [...prev, ""]);
  const removeEnrollPoint = (index: number) =>
    setEnrollPoints((prev) => prev.filter((_, i) => i !== index));

  // FAQ operations
  const updateFaq = (index: number, field: "question" | "answer", val: string) =>
    setFaqs((prev) => prev.map((f, i) => (i === index ? { ...f, [field]: val } : f)));
  const addFaq = () => setFaqs((prev) => [...prev, { question: "", answer: "" }]);
  const removeFaq = (index: number) => setFaqs((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!title || !cls || !planType) {
      toast.error("Title, class and plan type are required");
      return;
    }

    const subjectTags = subjectTagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    const cleanEnrollPoints = enrollPoints.filter(Boolean);
    const cleanFaqs = faqs.filter((f) => f.question && f.answer);

    await onSubmit({
      title, slug, class: cls, planType, tagline,
      coverImage, subjectTags, price, originalPrice,
      enrollPoints: cleanEnrollPoints, blocks,
      faqs: cleanFaqs, isPublished,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{course ? "Edit Course" : "Create Course"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">

          {/* ── Basic Info ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Title *</Label>
              <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="e.g. Core Plan - Class 6" />
            </div>

            <div className="space-y-1.5">
              <Label>Slug *</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="complete-class-6-program-core" />
            </div>

            <div className="space-y-1.5">
              <Label>Tagline</Label>
              <Input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Short subtitle shown on card" />
            </div>

            <div className="space-y-1.5">
              <Label>Class *</Label>
              <Select value={cls} onValueChange={(val) => setCls(val as ClassType)} disabled={!!course}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["6", "7", "8", "9", "10"].map((c) => (
                    <SelectItem key={c} value={c}>Class {c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {course && <p className="text-xs text-slate-400">Class cannot be changed after creation.</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Plan Type *</Label>
              <Select value={planType} onValueChange={(val) => setPlanType(val as CoursePlanType)} disabled={!!course}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="core">Core</SelectItem>
                  <SelectItem value="achiever">Achiever</SelectItem>
                  <SelectItem value="future-plus">Future Plus</SelectItem>
                </SelectContent>
              </Select>
              {course && <p className="text-xs text-slate-400">Plan type cannot be changed after creation.</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Price (₹) *</Label>
              <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="0" />
            </div>

            <div className="space-y-1.5">
              <Label>Original Price (₹)</Label>
              <Input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(Number(e.target.value))} placeholder="0" />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Subject Tags (comma separated)</Label>
              <Input value={subjectTagsInput} onChange={(e) => setSubjectTagsInput(e.target.value)}
                placeholder="Maths, Science, English, Social Science" />
            </div>
          </div>

          {/* ── Cover Image ── */}
          <div className="space-y-2">
            <Label>Cover Image</Label>
            {!courseId ? (
              <p className="text-xs text-slate-400">Save the course first to enable cover image upload.</p>
            ) : (
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" size="sm"
                  onClick={() => coverRef.current?.click()} disabled={coverUploading}>
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

          {/* ── Enroll Points ── */}
          <div className="space-y-3">
            <Label>Enroll Sidebar Points</Label>
            <p className="text-xs text-slate-400">Bullet points shown in the enroll now sidebar on the course detail page.</p>
            {enrollPoints.map((point, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-slate-400 text-sm mt-2 shrink-0">•</span>
                <Input value={point} onChange={(e) => updateEnrollPoint(i, e.target.value)}
                  placeholder={`Point ${i + 1}`} />
                <Button type="button" variant="ghost" size="sm"
                  onClick={() => removeEnrollPoint(i)}
                  className="text-red-400 hover:text-red-600 shrink-0"
                  disabled={enrollPoints.length <= 1}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addEnrollPoint} className="text-xs">
              <Plus className="h-3 w-3 mr-1" /> Add Point
            </Button>
          </div>

          {/* ── Content Blocks ── */}
          <div className="space-y-3">
            <Label>Content Blocks</Label>
            {blocks.length === 0 && (
              <p className="text-sm text-slate-400">No blocks yet. Add your first block below.</p>
            )}
            {blocks.map((block, i) => (
              <BlockEditor key={i} block={block} index={i} courseId={courseId}
                onChange={updateBlock} onRemove={removeBlock}
                onMoveUp={(idx) => moveBlock(idx, "up")}
                onMoveDown={(idx) => moveBlock(idx, "down")}
                isFirst={i === 0} isLast={i === blocks.length - 1}
              />
            ))}
            <div className="flex flex-wrap gap-2 pt-1">
              {(["paragraph", "heading", "bullets", "numbered", "image", "quote"] as BlockType[]).map((type) => (
                <Button key={type} type="button" variant="outline" size="sm"
                  onClick={() => addBlock(type)} className="text-xs capitalize">
                  <Plus className="h-3 w-3 mr-1" />{type}
                </Button>
              ))}
            </div>
          </div>

          {/* ── FAQs ── */}
          <div className="space-y-3">
            <Label>FAQs</Label>
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

          {/* ── Publish Toggle ── */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)} className="accent-blue-950 w-4 h-4" />
            <span className="text-sm font-medium text-slate-700">Publish immediately</span>
          </label>

          {/* ── Actions ── */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting}
              className="bg-blue-950 hover:bg-blue-900">
              {isSubmitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {course ? "Update Course" : "Create Course"}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}