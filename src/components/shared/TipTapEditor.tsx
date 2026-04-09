"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote,
  AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, ImageIcon,
  Undo, Redo, Minus,
  Highlighter, Superscript as SuperscriptIcon,
  Subscript as SubscriptIcon, Code, CodeSquare,
} from "lucide-react";

interface TipTapEditorProps {
  value: string;
  onChange: (html: string) => void;
  onImageUpload: (file: File) => Promise<string>;
  disabled?: boolean;
}

export function TipTapEditor({
  value,
  onChange,
  onImageUpload,
  disabled = false,
}: TipTapEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder: "Start writing your content..." }),
      Highlight.configure({ multicolor: false }),
      Superscript,
      Subscript,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    editorProps: {
      transformPastedHTML(html) {
        return html.replace(/<b[^>]*docs-internal-guid[^>]*>([\s\S]*?)<\/b>/gi, "$1");
      },
    },
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  const handleImageInsert = async (file: File) => {
    try {
      const url = await onImageUpload(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (e) {
      console.error("Image upload failed", e);
    }
  };

  const setLink = () => {
    const url = window.prompt("Enter URL");
    if (!url) return;
    editor.chain().focus().setLink({ href: url }).run();
  };

  // Word and character count
  const text = editor.getText();
  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const charCount = text.length;

  const ToolbarButton = ({
    onClick, active, title, children,
  }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${
        active ? "bg-slate-200 text-blue-950" : "text-slate-600"
      }`}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-5 bg-slate-300 mx-1" />;

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">

        {/* History */}
        <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        <ToolbarButton title="Heading 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })}>
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}>
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Inline styles */}
        <ToolbarButton title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}>
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}>
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Highlight" onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")}>
          <Highlighter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Superscript" onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive("superscript")}>
          <SuperscriptIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Subscript" onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive("subscript")}>
          <SubscriptIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Inline Code" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")}>
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Numbered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Code Block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")}>
          <CodeSquare className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Alignment */}
        <ToolbarButton title="Align Left" onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })}>
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Align Center" onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })}>
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Align Right" onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })}>
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <Divider />

        {/* Link & Image */}
        <ToolbarButton title="Insert Link" onClick={setLink} active={editor.isActive("link")}>
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Insert Image" onClick={() => fileRef.current?.click()}>
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageInsert(file);
            e.target.value = "";
          }}
        />
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[500px] max-h-[700px] overflow-y-auto focus-within:outline-none text-slate-800
          [&_.ProseMirror]:outline-none
          [&_.ProseMirror_h1]:text-3xl
          [&_.ProseMirror_h1]:font-bold
          [&_.ProseMirror_h1]:text-slate-900
          [&_.ProseMirror_h1]:my-3
          [&_.ProseMirror_h2]:text-2xl
          [&_.ProseMirror_h2]:font-bold
          [&_.ProseMirror_h2]:text-slate-900
          [&_.ProseMirror_h2]:my-2
          [&_.ProseMirror_h3]:text-xl
          [&_.ProseMirror_h3]:font-bold
          [&_.ProseMirror_h3]:text-slate-900
          [&_.ProseMirror_h3]:my-2
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-slate-400
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left
          [&_.ProseMirror_img]:rounded-lg
          [&_.ProseMirror_img]:max-w-full
          [&_.ProseMirror_blockquote]:border-l-4
          [&_.ProseMirror_blockquote]:border-slate-300
          [&_.ProseMirror_blockquote]:pl-4
          [&_.ProseMirror_blockquote]:italic
          [&_.ProseMirror_blockquote]:text-slate-600
          [&_.ProseMirror_ul]:list-disc
          [&_.ProseMirror_ul]:pl-6
          [&_.ProseMirror_ol]:list-decimal
          [&_.ProseMirror_ol]:pl-6
          [&_.ProseMirror_li]:text-slate-800
          [&_.ProseMirror_li]:leading-7
          [&_.ProseMirror_table]:w-full
          [&_.ProseMirror_table]:border-collapse
          [&_.ProseMirror_table]:my-4
          [&_.ProseMirror_th]:border
          [&_.ProseMirror_th]:border-slate-300
          [&_.ProseMirror_th]:bg-slate-100
          [&_.ProseMirror_th]:px-3
          [&_.ProseMirror_th]:py-2
          [&_.ProseMirror_th]:text-left
          [&_.ProseMirror_th]:font-semibold
          [&_.ProseMirror_td]:border
          [&_.ProseMirror_td]:border-slate-300
          [&_.ProseMirror_td]:px-3
          [&_.ProseMirror_td]:py-2
          [&_.ProseMirror_mark]:bg-yellow-200
          [&_.ProseMirror_mark]:rounded
          [&_.ProseMirror_mark]:px-0.5
          [&_.ProseMirror_code]:bg-slate-100
          [&_.ProseMirror_code]:rounded
          [&_.ProseMirror_code]:px-1
          [&_.ProseMirror_code]:text-sm
          [&_.ProseMirror_code]:font-mono
          [&_.ProseMirror_code]:text-rose-600
          [&_.ProseMirror_pre]:bg-slate-900
          [&_.ProseMirror_pre]:rounded-lg
          [&_.ProseMirror_pre]:p-4
          [&_.ProseMirror_pre_code]:text-slate-100
          [&_.ProseMirror_pre_code]:text-sm
          [&_.ProseMirror_pre_code]:font-mono
          [&_.ProseMirror_pre_code]:bg-transparent
          [&_.ProseMirror_pre_code]:text-rose-600
        "
      />

      {/* Word / char count */}
      <div className="flex items-center justify-end gap-4 px-4 py-2 border-t border-slate-200 bg-slate-50 text-xs text-slate-400">
        <span>{wordCount} words</span>
        <span>{charCount} characters</span>
      </div>
    </div>
  );
}