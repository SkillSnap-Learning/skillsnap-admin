"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { resourcePagesApi } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, ChevronRight, Plus, Trash2 } from "lucide-react";
import { TipTapEditor } from "@/components/shared/TipTapEditor";

// ── Static data ─────────────────────────────────────────────────────────────

const SECTIONS = [
  { label: "CBSE Board",      value: "cbse-board"      },
  { label: "NCERT Solutions", value: "ncert-solutions"  },
  { label: "MCQs",            value: "mcqs"             },
  { label: "Worksheet",       value: "worksheet"        },
  { label: "English",         value: "english"          },
  { label: "Physics",           value: "physics"            },
  { label: "Chemistry",           value: "chemistry"            },
  { label: "Biology",           value: "biology"            },
  { label: "Maths",           value: "maths"            },
  { label: "Coding",           value: "coding"            },
  { label: "Fun & Facts",           value: "fun-facts"            },
  { label: "Home Info", value: "home-info" },
];

const LEAF_SECTIONS = new Set(["physics", "chemistry", "biology", "maths", "coding", "fun-facts", "home-info"]);

const CLASSES = [
  { label: "Class 6",  value: "class-6"  },
  { label: "Class 7",  value: "class-7"  },
  { label: "Class 8",  value: "class-8"  },
  { label: "Class 9",  value: "class-9"  },
  { label: "Class 10", value: "class-10" },
];

const CBSE_TYPES = [
  { label: "Notes",           value: "notes"           },
  { label: "Assignments",     value: "assignments"     },
  { label: "Sample Papers",   value: "sample-papers"   },
  { label: "Previous Papers", value: "previous-papers" },
  { label: "Syllabus",        value: "syllabus"        },
];

const SUBJECTS = [
  { label: "Maths",          value: "maths"          },
  { label: "Science",        value: "science"        },
  { label: "Social Science", value: "social-science" },
  { label: "English",        value: "english"        },
];

const ENGLISH_CATEGORIES = [
  { label: "Essay",   value: "essay"   },
  { label: "Speech",  value: "speech"  },
  { label: "Grammar", value: "grammar" },
  { label: "Vocabulary", value: "vocabulary" },
  { label: "Quotes", value: "quotes" },
];

const GRAMMAR_TOPICS = [
  { label: "Tense",         value: "tense"         },
  { label: "Present Tense", value: "present-tense" },
  { label: "Past Tense",    value: "past-tense"    },
  { label: "Future Tense",  value: "future-tense"  },
];

const SECTION_ENUM_MAP: Record<string, string> = {
  "cbse-board":      "cbse",
  "ncert-solutions": "ncert",
  "mcqs":            "mcqs",
  "worksheet":       "worksheet",
  "english":         "english",
  "physics":         "physics",
  "chemistry":       "chemistry",
  "biology":         "biology",
  "maths":           "maths",
  "coding":          "coding",
  "fun-facts":       "fun-facts",
  "home-info":       "home-info",
};

const SECTION_SLUG_MAP: Record<string, string> = {
  "cbse":      "cbse-board",
  "ncert":     "ncert-solutions",
  "mcqs":      "mcqs",
  "worksheet": "worksheet",
  "english":   "english",
  "physics":   "physics",
  "chemistry": "chemistry",
  "biology":   "biology",
  "maths":     "maths",
  "coding":    "coding",
  "fun-facts": "fun-facts",
  "home-info": "home-info",
};

// ── Types ───────────────────────────────────────────────────────────────────

export interface ResourcePageFormData {
  slug: string;
  section: string;
  title: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  isPublished: boolean;
  isPublic: boolean;
  faqsTitle: string;
  faqs: { question: string; answer: string }[];
}

interface ResourcePage {
  _id: string;
  slug: string;
  section: string;
  title: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  isPublished: boolean;
  isPublic: boolean;
  faqsTitle: string;
  faqs: { question: string; answer: string }[];
}

interface ResourcePageFormProps {
  page?: ResourcePage | null;
  onSubmit: (data: ResourcePageFormData) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

// ── Card picker component ────────────────────────────────────────────────────

function CardPicker({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(isActive ? "" : opt.value)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-950 text-white border-blue-950"
                  : "bg-card text-muted-foreground border-border hover:border-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Slug preview ─────────────────────────────────────────────────────────────

function SlugPreview({ slug }: { slug: string }) {
  if (!slug) return null;
  return (
    <p className="text-xs text-muted-foreground/60">
      URL:{" "}
      <span className="font-mono text-muted-foreground">
        skillsnaplearning.com/{slug}
      </span>
    </p>
  );
}

// ── Step breadcrumb ──────────────────────────────────────────────────────────

function StepBreadcrumb({ parts }: { parts: string[] }) {
  const visible = parts.filter(Boolean);
  if (visible.length === 0) return null;
  return (
    <div className="flex items-center gap-1 flex-wrap text-xs text-muted-foreground">
      {visible.map((part, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/40" />}
          <span className="bg-muted px-2 py-0.5 rounded font-mono">{part}</span>
        </span>
      ))}
    </div>
  );
}

// ── Main form ────────────────────────────────────────────────────────────────

export function ResourcePageForm({
  page,
  onSubmit,
  isSubmitting,
  onCancel,
}: ResourcePageFormProps) {
  // Step selections
  const [section, setSection] = useState("");       // e.g. "cbse-board"
  const [cls, setCls] = useState("");               // e.g. "class-6"
  const [typeOrSubject, setTypeOrSubject] = useState(""); // e.g. "notes" or "maths"
  const [engCategory, setEngCategory] = useState(""); // essay | speech | grammar
  const [grammarTopic, setGrammarTopic] = useState(""); // tense | present-tense...
  const [chapterInput, setChapterInput] = useState(""); // free text — leaf level

  // Page fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  const [faqsTitle, setFaqsTitle] = useState("Frequently Asked Questions");
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);

  // Slug override
  const [slugOverride, setSlugOverride] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  const pageId = page?._id ?? "";
  const isEnglish = section === "english";
  const isCbse = section === "cbse-board";
  const isLeaf = LEAF_SECTIONS.has(section);

  const DRAFT_KEY = `resource-draft-${page?._id ?? "new"}`;
  const isDirtyRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPublic, setIsPublic] = useState(true);

  // ── Compute auto slug from selections ──────────────────────────────────────
  const computeSlug = (): string => {
    if (!section) return "";

    if (isLeaf) return section;

    if (isEnglish) {
      const parts = [section];
      if (engCategory) parts.push(engCategory);
      if (engCategory === "grammar" && grammarTopic) parts.push(grammarTopic);
      else if (engCategory && engCategory !== "grammar" && chapterInput.trim())
        parts.push(chapterInput.trim().toLowerCase().replace(/\s+/g, "-"));
      return parts.join("/");
    }

    const parts = [section];
    if (cls) {
      if (isCbse) {
        if (typeOrSubject) {
          parts.push(`${cls}-${typeOrSubject}`);
          if (chapterInput.trim())
            parts.push(chapterInput.trim().toLowerCase().replace(/\s+/g, "-"));
        } else {
          parts.push(cls);
        }
      } else {
        if (typeOrSubject) {
          parts.push(`${cls}-${typeOrSubject}`);
          if (chapterInput.trim())
            parts.push(chapterInput.trim().toLowerCase().replace(/\s+/g, "-"));
        } else {
          parts.push(cls);
        }
      }
    }
    return parts.join("/");
  };

  const autoSlug = computeSlug();
  const finalSlug = slugEdited ? slugOverride : autoSlug;

  const saveDraft = useCallback(() => {
  const draft = {
      section, cls, typeOrSubject, engCategory, grammarTopic,
      chapterInput, title, content, metaTitle, metaDescription,
      isPublished, faqsTitle, faqs, slugOverride, slugEdited,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [section, cls, typeOrSubject, engCategory, grammarTopic, chapterInput, title, content, metaTitle, metaDescription, isPublished, faqsTitle, faqs, slugOverride, slugEdited, DRAFT_KEY]);

  useEffect(() => {
    if (!isDirtyRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveDraft();
    }, 2000);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [section, cls, typeOrSubject, engCategory, grammarTopic, chapterInput, title, content, metaTitle, metaDescription, isPublished, faqsTitle, faqs, slugOverride, saveDraft]);

  // Restore draft on mount (only for new pages)
  useEffect(() => {
    if (page) return;
    const saved = localStorage.getItem(DRAFT_KEY);
    if (!saved) return;
    try {
      const draft = JSON.parse(saved);
      setSection(draft.section ?? "");
      setCls(draft.cls ?? "");
      setTypeOrSubject(draft.typeOrSubject ?? "");
      setEngCategory(draft.engCategory ?? "");
      setGrammarTopic(draft.grammarTopic ?? "");
      setChapterInput(draft.chapterInput ?? "");
      setTitle(draft.title ?? "");
      setContent(draft.content ?? "");
      setMetaTitle(draft.metaTitle ?? "");
      setMetaDescription(draft.metaDescription ?? "");
      setIsPublished(draft.isPublished ?? false);
      setFaqsTitle(draft.faqsTitle ?? "Frequently Asked Questions");
      setFaqs(draft.faqs ?? []);
      setSlugOverride(draft.slugOverride ?? "");
      setSlugEdited(draft.slugEdited ?? false);
      toast.info(`Draft restored from ${new Date(draft.savedAt).toLocaleTimeString()}`, {
        action: {
          label: "Discard",
          onClick: () => localStorage.removeItem(DRAFT_KEY),
        },
      });
    } catch {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirtyRef.current) saveDraft();
    }, 10000);
    return () => clearInterval(interval);
  }, [saveDraft]);

  // Mark dirty on any change
  useEffect(() => {
    isDirtyRef.current = true;
  }, [section, cls, typeOrSubject, engCategory, grammarTopic, chapterInput, title, content, metaTitle, metaDescription, isPublished, faqsTitle, faqs, slugOverride]);

  // beforeunload warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // Sync slug override when auto changes (unless manually edited)
  useEffect(() => {
    if (!slugEdited) setSlugOverride(autoSlug);
  }, [autoSlug, slugEdited]);

  // ── Populate form when editing ─────────────────────────────────────────────
  useEffect(() => {
    if (!page) return;

    setTitle(page.title);
    setContent(page.content ?? "");
    setMetaTitle(page.metaTitle ?? "");
    setMetaDescription(page.metaDescription ?? "");
    setIsPublished(page.isPublished);
    setSlugOverride(page.slug);
    setSlugEdited(true); // treat existing slug as manual
    setFaqsTitle(page.faqsTitle ?? "Frequently Asked Questions");
    setFaqs(page.faqs ?? []);
    setIsPublic(page.isPublic ?? true);

    // Reverse-parse slug into step selections
    const parts = page.slug.split("/");
    const sec = parts[0] ?? "";
    setSection(SECTION_SLUG_MAP[sec] ?? sec);

    if (sec === "english") {
      setEngCategory(parts[1] ?? "");
      if (parts[1] === "grammar") setGrammarTopic(parts[2] ?? "");
      else if (parts[2]) setChapterInput(parts[2]);
    } else if (sec === "cbse-board") {
      // e.g. cbse-board/class-6-notes/chapter-1
      const seg2 = parts[1] ?? ""; // "class-6-notes"
      const classMatch = seg2.match(/^(class-\d+)-(.+)$/);
      if (classMatch) {
        setCls(classMatch[1]);
        setTypeOrSubject(classMatch[2]);
      } else {
        setCls(seg2);
      }
      if (parts[2]) setChapterInput(parts[2]);
    } else {
      // ncert / mcqs / worksheet
      const seg2 = parts[1] ?? ""; // "class-6-maths"
      const classMatch = seg2.match(/^(class-\d+)-(.+)$/);
      if (classMatch) {
        setCls(classMatch[1]);
        setTypeOrSubject(classMatch[2]);
      } else {
        setCls(seg2);
      }
      if (parts[2]) setChapterInput(parts[2]);
    }
  }, [page]);

  // ── Reset downstream selections when section changes ──────────────────────
  const handleSectionChange = (val: string) => {
    setSection(val);
    setCls("");
    setTypeOrSubject("");
    setEngCategory("");
    setGrammarTopic("");
    setChapterInput("");
    setSlugEdited(false);
  };

  // ── Image upload ──────────────────────────────────────────────────────────
  const handleEditorImageUpload = async (file: File): Promise<string> => {
    if (!pageId) {
      toast.error("Save the page first before uploading images");
      throw new Error("No pageId");
    }
    const result = await resourcePagesApi.uploadImage(file, pageId);
    return result.imageUrl;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!title) { toast.error("Title is required"); return; }
    if (!finalSlug) { toast.error("Please select a section first"); return; }

    // Clear dirty BEFORE submit
    isDirtyRef.current = false;
    localStorage.removeItem(DRAFT_KEY);

    await onSubmit({
      slug: finalSlug,
      section: SECTION_ENUM_MAP[section] ?? section,
      title, content, metaTitle, metaDescription,
      isPublished, isPublic, faqsTitle, faqs,
    });
  };

  // ── Which step 3 options to show ─────────────────────────────────────────
  const step3Options = isCbse ? CBSE_TYPES : SUBJECTS;

  // ── Breadcrumb parts for visual feedback ─────────────────────────────────
  const breadcrumbParts = finalSlug.split("/").filter(Boolean);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">

      {/* ── Step builder ── */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Build Page URL
        </h2>

        {/* Step 1 — Section */}
        <CardPicker
          label="Step 1 — Section"
          options={SECTIONS}
          value={section}
          onChange={handleSectionChange}
        />

        {/* Step 2 — Class (not for English) */}
        {section && !isEnglish && !isLeaf && (
          <CardPicker
            label="Step 2 — Class"
            options={CLASSES}
            value={cls}
            onChange={(val) => { setCls(val); setTypeOrSubject(""); setChapterInput(""); setSlugEdited(false); }}
          />
        )}

        {/* Step 2 — English category */}
        {isEnglish && !isLeaf && (
          <CardPicker
            label="Step 2 — Category"
            options={ENGLISH_CATEGORIES}
            value={engCategory}
            onChange={(val) => { setEngCategory(val); setGrammarTopic(""); setChapterInput(""); setSlugEdited(false); }}
          />
        )}

        {/* Step 3 — Type or Subject (non-English) */}
        {section && !isEnglish && !isLeaf && cls && (
          <CardPicker
            label="Step 3 — Type / Subject"
            options={step3Options}
            value={typeOrSubject}
            onChange={(val) => { setTypeOrSubject(val); setChapterInput(""); setSlugEdited(false); }}
          />
        )}

        {/* Step 3 — Grammar topics */}
        {isEnglish && !isLeaf && engCategory === "grammar" && (
          <CardPicker
            label="Step 3 — Grammar Topic"
            options={GRAMMAR_TOPICS}
            value={grammarTopic}
            onChange={(val) => { setGrammarTopic(val); setSlugEdited(false); }}
          />
        )}

        {/* Step 4 — Chapter / title (leaf level text input) */}
        {!isLeaf && (
          (!isEnglish && typeOrSubject) ||
          (isEnglish && engCategory && engCategory !== "grammar") ||
          (isEnglish && engCategory === "grammar" && grammarTopic)
        ) && (

          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Step 4 — Chapter / Title{" "}
              <span className="normal-case font-normal text-muted-foreground/60">(optional — leave empty to save this level as a page)</span>
            </p>
            <Input
              value={chapterInput}
              onChange={(e) => { setChapterInput(e.target.value); setSlugEdited(false); }}
              placeholder="e.g. trigonometry or chapter-1"
              className="max-w-md"
            />
          </div>
        )}

        {/* Breadcrumb + slug preview */}
        {finalSlug && (
          <div className="space-y-2 pt-2 border-t border-border">
            <StepBreadcrumb parts={breadcrumbParts} />
            <SlugPreview slug={finalSlug} />
          </div>
        )}

        {/* Slug override */}
        {finalSlug && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Override slug manually{" "}
              <span className="font-normal text-muted-foreground/60">(only if you need a custom path)</span>
            </Label>
            <Input
              value={slugOverride}
              onChange={(e) => { setSlugOverride(e.target.value); setSlugEdited(true); }}
              className="font-mono text-sm max-w-md"
              placeholder="e.g. cbse-board/class-6-notes/chapter-1"
            />
            {slugEdited && autoSlug && autoSlug !== slugOverride && (
              <button
                type="button"
                className="text-xs text-blue-600 hover:underline"
                onClick={() => { setSlugOverride(autoSlug); setSlugEdited(false); }}
              >
                ↩ Reset to auto-generated: {autoSlug}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Basic Info ── */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-5">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Page Info
        </h2>
        <div className="space-y-1.5">
          <Label>Title *</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Page title"
          />
        </div>
      </div>

      {/* ── Content Editor ── */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Content
        </h2>
        {!pageId && (
          <p className="text-xs text-muted-foreground/60">
            Save the page first to enable inline image uploads.
          </p>
        )}
        <TipTapEditor
          value={content}
          onChange={setContent}
          onImageUpload={handleEditorImageUpload}
        />
      </div>

      {/* ── SEO ── */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          SEO
        </h2>
        <div className="space-y-1.5">
          <Label>Meta Title</Label>
          <Input
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Leave empty to use page title"
            className="bg-card"
          />
          <p className="text-xs text-muted-foreground/60">
            Recommended: 50–60 characters.{" "}
            <span className={metaTitle.length > 60 ? "text-red-500" : "text-muted-foreground/60"}>
              {metaTitle.length}/60
            </span>
          </p>
        </div>
        <div className="space-y-1.5">
          <Label>Meta Description</Label>
          <Textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Leave empty to use page title"
            rows={3}
            className="bg-card text-sm"
          />
          <p className="text-xs text-muted-foreground/60">
            Recommended: 150–160 characters.{" "}
            <span className={metaDescription.length > 160 ? "text-red-500" : "text-muted-foreground/60"}>
              {metaDescription.length}/160
            </span>
          </p>
        </div>
      </div>

      {/* ── FAQs ── */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          FAQs
        </h2>

        <div className="space-y-1.5">
          <Label>Section Heading</Label>
          <Input
            value={faqsTitle}
            onChange={(e) => setFaqsTitle(e.target.value)}
            placeholder="Frequently Asked Questions"
            className="bg-card"
          />
          <p className="text-xs text-muted-foreground/60">
            Leave empty to use default: "Frequently Asked Questions"
          </p>
        </div>

        {faqs.length === 0 && (
          <p className="text-xs text-muted-foreground/60">
            No FAQs yet. Click "Add FAQ" to add one.
          </p>
        )}

        {faqs.map((faq, index) => (
          <div key={index} className="border border-border rounded-lg p-4 space-y-3 bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">FAQ {index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFaqs((prev) => prev.filter((_, i) => i !== index))}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-2">
              <Input
                value={faq.question}
                onChange={(e) =>
                  setFaqs((prev) =>
                    prev.map((f, i) => (i === index ? { ...f, question: e.target.value } : f))
                  )
                }
                placeholder="Question"
                className="bg-card"
              />
              <div className="bg-card rounded-lg">
                <TipTapEditor
                  value={faq.answer}
                  onChange={(htmlValue) =>
                    setFaqs((prev) =>
                      prev.map((f, i) => (i === index ? { ...f, answer: htmlValue } : f))
                    )
                  }
                  onImageUpload={handleEditorImageUpload}
                  minHeight="120px"
                  maxHeight="320px"
                  placeholder="Answer"
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setFaqs((prev) => [...prev, { question: "", answer: "" }])}
          className="text-xs"
        >
          <Plus className="h-3 w-3 mr-1" /> Add FAQ
        </Button>
      </div>

      {/* ── Publish + Actions ── */}
      <div className="bg-card rounded-xl border border-border p-6 flex items-center justify-between">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="accent-blue-950 w-4 h-4"
          />
          <span className="text-sm font-medium text-foreground">
            Publish immediately
          </span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="accent-blue-950 w-4 h-4"
            />
            <span className="text-sm font-medium text-foreground">
              Show as public page{" "}
              <span className="text-xs font-normal text-muted-foreground/60">(uncheck for internal/home-info pages)</span>
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
            className="bg-blue-950 hover:bg-blue-900 text-white"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            {page ? "Update Page" : "Create Page"}
          </Button>
        </div>
      </div>
    </div>
  );
}