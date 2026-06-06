import { Node, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    pdf: {
      /** Insert an embedded PDF viewer */
      setPdf: (options: { src: string; title?: string }) => ReturnType;
    };
  }
}

export const Pdf = Node.create({
  name: "pdf",
  group: "block",
  atom: true, // single, indivisible unit
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      title: { default: null },
    };
  },

  parseHTML() {
    // critical: lets stored content round-trip back into the editor on load
    return [{ tag: "iframe[data-pdf]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "iframe",
      mergeAttributes(HTMLAttributes, {
        "data-pdf": "true",
        width: "100%",
        height: "600",
        frameborder: "0",
      }),
    ];
  },

  addCommands() {
    return {
      setPdf:
        (options) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: options }),
    };
  },
});
