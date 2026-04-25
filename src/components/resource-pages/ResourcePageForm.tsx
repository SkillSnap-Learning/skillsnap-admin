"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { resourcePagesApi } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, ChevronRight } from "lucide-react";
import { TipTapEditor } from "@/components/shared/TipTapEditor";

// ── Static data ─────────────────────────────────────────────────────────────

const SECTIONS = [
  { label: "CBSE Board",      value: "cbse-board"      },
  { label: "NCERT Solutions", value: "ncert-solutions"  },
  { label: "MCQs",            value: "mcqs"             },
  { label: "Worksheet",       value: "worksheet"        },
  { label: "English",         value: "english"          },
];

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
};

const SECTION_SLUG_MAP: Record<string, string> = {
  "cbse":      "cbse-board",
  "ncert":     "ncert-solutions",
  "mcqs":      "mcqs",
  "worksheet": "worksheet",
  "english":   "english",
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
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
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
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-950 hover:text-blue-950"
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
    <p className="text-xs text-slate-400">
      URL:{" "}
      <span className="font-mono text-slate-600">
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
    <div className="flex items-center gap-1 flex-wrap text-xs text-slate-500">
      {visible.map((part, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3 text-slate-300" />}
          <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">{part}</span>
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

  // Slug override
  const [slugOverride, setSlugOverride] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  const pageId = page?._id ?? "";
  const isEnglish = section === "english";
  const isCbse = section === "cbse-board";

  // ── Compute auto slug from selections ──────────────────────────────────────
  const computeSlug = (): string => {
    if (!section) return "";

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

    await onSubmit({
      slug: finalSlug,
      section: SECTION_ENUM_MAP[section] ?? section,
      title,
      content,
      metaTitle,
      metaDescription,
      isPublished,
    });
  };

  // ── Which step 3 options to show ─────────────────────────────────────────
  const step3Options = isCbse ? CBSE_TYPES : SUBJECTS;

  // ── Breadcrumb parts for visual feedback ─────────────────────────────────
  const breadcrumbParts = finalSlug.split("/").filter(Boolean);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">

      {/* ── Step builder ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
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
        {section && !isEnglish && (
          <CardPicker
            label="Step 2 — Class"
            options={CLASSES}
            value={cls}
            onChange={(val) => { setCls(val); setTypeOrSubject(""); setChapterInput(""); setSlugEdited(false); }}
          />
        )}

        {/* Step 2 — English category */}
        {isEnglish && (
          <CardPicker
            label="Step 2 — Category"
            options={ENGLISH_CATEGORIES}
            value={engCategory}
            onChange={(val) => { setEngCategory(val); setGrammarTopic(""); setChapterInput(""); setSlugEdited(false); }}
          />
        )}

        {/* Step 3 — Type or Subject (non-English) */}
        {section && !isEnglish && cls && (
          <CardPicker
            label="Step 3 — Type / Subject"
            options={step3Options}
            value={typeOrSubject}
            onChange={(val) => { setTypeOrSubject(val); setChapterInput(""); setSlugEdited(false); }}
          />
        )}

        {/* Step 3 — Grammar topics */}
        {isEnglish && engCategory === "grammar" && (
          <CardPicker
            label="Step 3 — Grammar Topic"
            options={GRAMMAR_TOPICS}
            value={grammarTopic}
            onChange={(val) => { setGrammarTopic(val); setSlugEdited(false); }}
          />
        )}

        {/* Step 4 — Chapter / title (leaf level text input) */}
        {(
          // non-English: show after type/subject picked
          (!isEnglish && typeOrSubject) ||
          // English essay/speech: show after category picked
          (isEnglish && engCategory && engCategory !== "grammar") ||
          // English grammar: show after grammar topic picked
          (isEnglish && engCategory === "grammar" && grammarTopic)
        ) && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Step 4 — Chapter / Title{" "}
              <span className="normal-case font-normal text-slate-400">(optional — leave empty to save this level as a page)</span>
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
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <StepBreadcrumb parts={breadcrumbParts} />
            <SlugPreview slug={finalSlug} />
          </div>
        )}

        {/* Slug override */}
        {finalSlug && (
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500">
              Override slug manually{" "}
              <span className="font-normal text-slate-400">(only if you need a custom path)</span>
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
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
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
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
          Content
        </h2>
        {!pageId && (
          <p className="text-xs text-slate-400">
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
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
          SEO
        </h2>
        <div className="space-y-1.5">
          <Label>Meta Title</Label>
          <Input
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Leave empty to use page title"
            className="bg-white"
          />
          <p className="text-xs text-slate-400">
            Recommended: 50–60 characters.{" "}
            <span className={metaTitle.length > 60 ? "text-red-500" : "text-slate-400"}>
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
            className="bg-white text-sm"
          />
          <p className="text-xs text-slate-400">
            Recommended: 150–160 characters.{" "}
            <span className={metaDescription.length > 160 ? "text-red-500" : "text-slate-400"}>
              {metaDescription.length}/160
            </span>
          </p>
        </div>
      </div>

      {/* ── Publish + Actions ── */}
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
            {page ? "Update Page" : "Create Page"}
          </Button>
        </div>
      </div>
    </div>
  );
}