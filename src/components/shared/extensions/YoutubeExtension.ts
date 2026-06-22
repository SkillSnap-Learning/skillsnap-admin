import { Node, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    youtube: {
      setYoutube: (options: { src: string }) => ReturnType;
    };
  }
}

export function toEmbedUrl(url: string): string | null {
  let videoId: string | null = null;
  let startTime: string | null = null;

  try {
    const parsed = new URL(url);

    if (parsed.hostname === "youtu.be") {
      videoId = parsed.pathname.slice(1);
      startTime = parsed.searchParams.get("t");
    } else if (
      parsed.hostname === "www.youtube.com" ||
      parsed.hostname === "youtube.com"
    ) {
      if (parsed.pathname === "/watch") {
        videoId = parsed.searchParams.get("v");
        startTime = parsed.searchParams.get("t");
      } else if (parsed.pathname.startsWith("/embed/")) {
        // Already an embed URL — return as-is (it's valid)
        return url;
      }
    }
  } catch {
    return null;
  }

  if (!videoId) return null;

  const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
  if (startTime) embedUrl.searchParams.set("start", startTime);

  return embedUrl.toString();
}

export const Youtube = Node.create({
  name: "youtube",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "iframe[data-youtube]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "iframe",
      mergeAttributes(HTMLAttributes, {
        "data-youtube": "true",
        height: "450",
        allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen",
        style: "border:0;width:100%",
      }),
    ];
  },

  addCommands() {
    return {
      setYoutube:
        (options) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: options }),
    };
  },
});
