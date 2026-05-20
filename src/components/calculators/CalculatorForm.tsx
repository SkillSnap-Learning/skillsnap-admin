"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Calculator, CalculatorInput, CalculatorOutput, RelatedArticle } from "@/types";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { TipTapEditor } from "@/components/shared/TipTapEditor";

export interface CalculatorFormData {
  slug: string;
  type: string;
  variant: string | null;
  isVariant: boolean;
  canonical: string;
  metaTitle: string;
  metaDescription: string;
  heading: string;
  subheading: string;
  formulaType: string;
  inputs: CalculatorInput[];
  outputs: CalculatorOutput[];
  article: string;
  relatedArticles: RelatedArticle[];
  isActive: boolean;
}

interface Props {
  calculator?: Calculator | null;
  onSubmit: (data: CalculatorFormData) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

const TYPES = ["sip","emi","tax","education","term","ppf","rd","fd","nps","other"];
const FORMULA_TYPES = ["sip","emi","tax","education","term","ppf","rd","fd","nps"];
const INPUT_TYPES = ["slider","number","select"];
const OUTPUT_FORMATS = ["currency","percent","number","years"];

const generateSlug = (h: string) =>
  h.toLowerCase().replace(/[^a-z0-9\s-]/g,"").trim().replace(/\s+/g,"-") + "-calculator";

const defaultInput = (): CalculatorInput => ({
  id: "", label: "", type: "slider",
  min: 0, max: 100, step: 1, default: 50,
  prefix: null, unit: null,
});

const defaultOutput = (): CalculatorOutput => ({
  id: "", label: "", format: "currency", highlight: false,
});

export function CalculatorForm({ calculator, onSubmit, isSubmitting, onCancel }: Props) {
  const [slug, setSlug] = useState("");
  const [type, setType] = useState("sip");
  const [formulaType, setFormulaType] = useState("sip");
  const [variant, setVariant] = useState("");
  const [isVariant, setIsVariant] = useState(false);
  const [canonical, setCanonical] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [inputs, setInputs] = useState<CalculatorInput[]>([defaultInput()]);
  const [outputs, setOutputs] = useState<CalculatorOutput[]>([defaultOutput()]);
  const [article, setArticle] = useState("");
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([{ label: "", href: "" }]);
  const [isActive, setIsActive] = useState(true);

  // Populate form when editing
  useEffect(() => {
    if (!calculator) return;
    setSlug(calculator.slug);
    setType(calculator.type);
    setFormulaType(calculator.formulaType);
    setVariant(calculator.variant ?? "");
    setIsVariant(calculator.isVariant);
    setCanonical(calculator.canonical);
    setMetaTitle(calculator.metaTitle);
    setMetaDescription(calculator.metaDescription);
    setHeading(calculator.heading);
    setSubheading(calculator.subheading ?? "");
    setInputs(calculator.inputs.length > 0 ? calculator.inputs : [defaultInput()]);
    setOutputs(calculator.outputs.length > 0 ? calculator.outputs : [defaultOutput()]);
    setArticle(calculator.article ?? "");
    setRelatedArticles(
      calculator.relatedArticles.length > 0
        ? calculator.relatedArticles
        : [{ label: "", href: "" }]
    );
    setIsActive(calculator.isActive);
  }, [calculator]);

  // Auto-generate slug from heading (new only)
  const handleHeadingChange = (val: string) => {
    setHeading(val);
    if (!calculator) {
      const s = generateSlug(val);
      setSlug(s);
      if (!isVariant) setCanonical(`/calculators/${s}`);
    }
  };

  // Input field helpers
  const updateInput = (i: number, key: keyof CalculatorInput, val: unknown) =>
    setInputs(prev => prev.map((inp, idx) => idx === i ? { ...inp, [key]: val } : inp));

  const addInput = () => setInputs(prev => [...prev, defaultInput()]);
  const removeInput = (i: number) => setInputs(prev => prev.filter((_, idx) => idx !== i));

  // Output field helpers
  const updateOutput = (i: number, key: keyof CalculatorOutput, val: unknown) =>
    setOutputs(prev => prev.map((o, idx) => idx === i ? { ...o, [key]: val } : o));

  const addOutput = () => setOutputs(prev => [...prev, defaultOutput()]);
  const removeOutput = (i: number) => setOutputs(prev => prev.filter((_, idx) => idx !== i));

  // Related article helpers
  const updateArticle = (i: number, key: keyof RelatedArticle, val: string) =>
    setRelatedArticles(prev => prev.map((a, idx) => idx === i ? { ...a, [key]: val } : a));

  const addArticle = () => setRelatedArticles(prev => [...prev, { label: "", href: "" }]);
  const removeArticle = (i: number) => setRelatedArticles(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!slug || !heading || !type || !formulaType) {
      toast.error("Slug, heading, type and formula type are required");
      return;
    }
    if (inputs.some(inp => !inp.id || !inp.label)) {
      toast.error("All inputs must have an ID and label");
      return;
    }
    if (outputs.some(o => !o.id || !o.label)) {
      toast.error("All outputs must have an ID and label");
      return;
    }
    if (outputs.filter(o => o.highlight).length !== 1) {
      toast.error("Exactly one output must be marked as highlighted (the main result)");
      return;
    }

    await onSubmit({
      slug,
      type,
      formulaType,
      variant: variant || null,
      isVariant,
      canonical: canonical || `/calculators/${slug}`,
      metaTitle,
      metaDescription,
      heading,
      subheading,
      inputs,
      outputs,
      article,
      relatedArticles: relatedArticles.filter(a => a.label && a.href),
      isActive,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Identity */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Identity</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Heading *</Label>
            <Input value={heading} onChange={e => handleHeadingChange(e.target.value)} placeholder="SIP Calculator" />
          </div>
          <div className="space-y-1.5">
            <Label>Slug *</Label>
            <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="sip-calculator" />
            <p className="text-xs text-slate-400">URL: /calculators/{slug || "..."}</p>
          </div>
          <div className="space-y-1.5">
            <Label>Subheading</Label>
            <Input value={subheading} onChange={e => setSubheading(e.target.value)} placeholder="See how your SIP grows over time" />
          </div>
          <div className="space-y-1.5">
            <Label>Type *</Label>
            <Select value={type} onValueChange={val => { setType(val); setFormulaType(val === "other" ? "sip" : val); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPES.map(t => <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Formula Type *</Label>
            <Select value={formulaType} onValueChange={setFormulaType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FORMULA_TYPES.map(t => <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-400">Which math formula to use for calculations</p>
          </div>
        </div>

        {/* Variant section */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isVariant}
              onChange={e => setIsVariant(e.target.checked)}
              className="accent-blue-950 w-4 h-4"
            />
            <span className="text-sm font-medium text-slate-700">This is an SEO variant</span>
            <span className="text-xs text-slate-400">(e.g. HDFC SIP Calculator)</span>
          </label>
          {isVariant && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6">
              <div className="space-y-1.5">
                <Label>Variant Name</Label>
                <Input value={variant} onChange={e => setVariant(e.target.value)} placeholder="HDFC" />
              </div>
              <div className="space-y-1.5">
                <Label>Canonical URL</Label>
                <Input value={canonical} onChange={e => setCanonical(e.target.value)} placeholder="/calculators/sip-calculator" />
                <p className="text-xs text-slate-400">Should point to the core calculator</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">SEO</h2>
        <div className="space-y-1.5">
          <Label>Meta Title</Label>
          <Input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder="SIP Calculator — Calculate SIP Returns Online Free" />
          <p className="text-xs text-slate-400">
            Recommended: 50–60 chars.{" "}
            <span className={metaTitle.length > 60 ? "text-red-500" : "text-slate-400"}>{metaTitle.length}/60</span>
          </p>
        </div>
        <div className="space-y-1.5">
          <Label>Meta Description</Label>
          <Textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} placeholder="Calculate how your monthly SIP grows..." rows={2} />
          <p className="text-xs text-slate-400">
            Recommended: 150–160 chars.{" "}
            <span className={metaDescription.length > 160 ? "text-red-500" : "text-slate-400"}>{metaDescription.length}/160</span>
          </p>
        </div>
      </div>

      {/* Inputs */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Calculator Inputs</h2>
          <Button type="button" variant="outline" size="sm" onClick={addInput}>
            <Plus className="h-3 w-3 mr-1" /> Add Input
          </Button>
        </div>
        <p className="text-xs text-slate-400">Each input becomes a slider or number field in the calculator.</p>

        {inputs.map((inp, i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Input {i + 1}</span>
              <Button type="button" variant="ghost" size="sm"
                onClick={() => removeInput(i)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                disabled={inputs.length <= 1}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">ID *</Label>
                <Input value={inp.id} onChange={e => updateInput(i, "id", e.target.value)}
                  placeholder="monthlyAmount" className="bg-white text-xs h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Label *</Label>
                <Input value={inp.label} onChange={e => updateInput(i, "label", e.target.value)}
                  placeholder="Monthly Investment" className="bg-white text-xs h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Type</Label>
                <Select value={inp.type} onValueChange={val => updateInput(i, "type", val)}>
                  <SelectTrigger className="bg-white h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INPUT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Min</Label>
                <Input type="number" value={inp.min} onChange={e => updateInput(i, "min", parseFloat(e.target.value))}
                  className="bg-white text-xs h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Max</Label>
                <Input type="number" value={inp.max} onChange={e => updateInput(i, "max", parseFloat(e.target.value))}
                  className="bg-white text-xs h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Step</Label>
                <Input type="number" value={inp.step} onChange={e => updateInput(i, "step", parseFloat(e.target.value))}
                  className="bg-white text-xs h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Default</Label>
                <Input type="number" value={inp.default} onChange={e => updateInput(i, "default", parseFloat(e.target.value))}
                  className="bg-white text-xs h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Prefix (e.g. ₹)</Label>
                <Input value={inp.prefix ?? ""} onChange={e => updateInput(i, "prefix", e.target.value || null)}
                  placeholder="₹" className="bg-white text-xs h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Unit (e.g. %)</Label>
                <Input value={inp.unit ?? ""} onChange={e => updateInput(i, "unit", e.target.value || null)}
                  placeholder="%" className="bg-white text-xs h-8" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Outputs */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Calculator Outputs</h2>
          <Button type="button" variant="outline" size="sm" onClick={addOutput}>
            <Plus className="h-3 w-3 mr-1" /> Add Output
          </Button>
        </div>
        <p className="text-xs text-slate-400">Exactly one output must be highlighted — this becomes the big primary result number.</p>

        {outputs.map((o, i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Output {i + 1}</span>
              <Button type="button" variant="ghost" size="sm"
                onClick={() => removeOutput(i)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                disabled={outputs.length <= 1}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
              <div className="space-y-1">
                <Label className="text-xs">ID *</Label>
                <Input value={o.id} onChange={e => updateOutput(i, "id", e.target.value)}
                  placeholder="totalValue" className="bg-white text-xs h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Label *</Label>
                <Input value={o.label} onChange={e => updateOutput(i, "label", e.target.value)}
                  placeholder="Total Value" className="bg-white text-xs h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Format</Label>
                <Select value={o.format} onValueChange={val => updateOutput(i, "format", val)}>
                  <SelectTrigger className="bg-white h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {OUTPUT_FORMATS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pb-1">
                <input
                  type="checkbox"
                  checked={o.highlight}
                  onChange={e => {
                    // Only one can be highlighted — uncheck others
                    setOutputs(prev => prev.map((op, idx) =>
                      idx === i ? { ...op, highlight: e.target.checked } : { ...op, highlight: false }
                    ));
                  }}
                  className="accent-blue-950 w-4 h-4"
                />
                <Label className="text-xs cursor-pointer">Main result</Label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Article */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
          Article Content
        </h2>
        <p className="text-xs text-slate-400">This appears below the calculator. Use headings, lists, and tables to explain how the calculator works.</p>
        <TipTapEditor
          value={article}
          onChange={setArticle}
          onImageUpload={async () => ""}
        />
      </div>

      {/* Related Articles */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Related Articles</h2>
          <Button type="button" variant="outline" size="sm" onClick={addArticle}>
            <Plus className="h-3 w-3 mr-1" /> Add Article
          </Button>
        </div>
        <p className="text-xs text-slate-400">These appear in the sidebar on the calculator page.</p>

        {relatedArticles.map((a, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                value={a.label}
                onChange={e => updateArticle(i, "label", e.target.value)}
                placeholder="SIP vs Lump Sum: Which is better?"
                className="text-sm"
              />
              <Input
                value={a.href}
                onChange={e => updateArticle(i, "href", e.target.value)}
                placeholder="/investing/sip-vs-lumpsum"
                className="text-sm font-mono"
              />
            </div>
            <Button type="button" variant="ghost" size="sm"
              onClick={() => removeArticle(i)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-0.5"
              disabled={relatedArticles.length <= 1}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Status + Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-between">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={e => setIsActive(e.target.checked)}
            className="accent-blue-950 w-4 h-4"
          />
          <span className="text-sm font-medium text-slate-700">Active (visible on site)</span>
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
            {calculator ? "Update Calculator" : "Create Calculator"}
          </Button>
        </div>
      </div>
    </div>
  );
}