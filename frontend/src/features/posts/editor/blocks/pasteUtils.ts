import type { Block } from "./blockTypes";
import { createId, emptyParagraph } from "./blockTypes";
import { htmlToBlocks } from "./htmlSerialization";
import { sanitizeBlocks } from "./sanitizeBlocks";

/**
 * Turn clipboard HTML or plain text into top-level blocks.
 * Prefers HTML when present so paragraphs/lists are preserved.
 */
export function clipboardToBlocks(html: string | undefined, plain: string): Block[] {
  const h = (html || "").trim();
  const p = (plain || "").replace(/\r\n/g, "\n");

  if (h && (h.includes("<p") || h.includes("<div") || h.includes("<br") || h.includes("<li") || h.includes("<h"))) {
    try {
      const fromHtml = htmlToBlocks(h);
      if (fromHtml.length) return fromHtml;
    } catch {
      /* fall through */
    }
  }

  if (!p.trim()) return [emptyParagraph()];

  const paragraphs = p.split(/\n\n+/).map((s) => s.trim()).filter(Boolean);
  if (paragraphs.length > 1) {
    return sanitizeBlocks(
      paragraphs.map((text): Block => ({ id: createId(), type: "paragraph", content: { text } }))
    );
  }

  const lines = p.split("\n");
  if (lines.length > 1) {
    return sanitizeBlocks(
      lines.map((line): Block => ({ id: createId(), type: "paragraph", content: { text: line } }))
    );
  }

  return sanitizeBlocks([{ id: createId(), type: "paragraph", content: { text: p } }]);
}
