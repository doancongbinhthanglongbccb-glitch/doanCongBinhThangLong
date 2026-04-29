import type { Block } from "./blockTypes";
import { createId, emptyParagraph, imageBlock, type TextField } from "./blockTypes";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function sanitizeParagraph(input: any): Block {
  const id = typeof input?.id === "string" ? input.id : createId();
  return { id, type: "paragraph", content: { text: asString(input?.content?.text) } };
}

function sanitizeHeading(input: any): Block {
  const id = typeof input?.id === "string" ? input.id : createId();
  const rawLevel = input?.content?.level;
  const level = rawLevel === 1 || rawLevel === 2 || rawLevel === 3 ? rawLevel : 1;
  return { id, type: "heading", content: { level, text: asString(input?.content?.text) } };
}

function sanitizeList(input: any, listType: "bulletList" | "numberedList"): Block {
  const id = typeof input?.id === "string" ? input.id : createId();
  const rawItems = input?.content?.items;
  const itemsArr = Array.isArray(rawItems) ? rawItems : [];

  const safeItems: Block[] = itemsArr.length
    ? itemsArr.map((it: any) => {
        // legacy may store strings[] in items
        if (typeof it === "string") {
          return { id: createId(), type: "paragraph", content: { text: it } } as Block;
        }
        if (isRecord(it) && it?.type === "paragraph") {
          return { id: typeof it?.id === "string" ? it.id : createId(), type: "paragraph", content: { text: asString(it?.content?.text) } };
        }
        return { id: createId(), type: "paragraph", content: { text: asString(it?.content?.text) } };
      })
    : [];

  return { id, type: listType, content: { items: safeItems.length ? safeItems : [{ id: createId(), type: "paragraph", content: { text: "" } }] } };
}

function sanitizeImage(input: any): Block {
  const id = typeof input?.id === "string" ? input.id : createId();
  const content = input?.content ?? {};
  const src = asString(content?.src);
  const alt = asString(content?.alt);
  const caption = typeof content?.caption === "string" ? content.caption : undefined;

  if (!src) return { ...emptyParagraph(), id };
  return { ...imageBlock(src, alt, caption), id };
}

export function sanitizeBlock(input: any): Block {
  if (!isRecord(input)) return { ...emptyParagraph(), id: createId() };
  const type = input?.type;
  switch (type) {
    case "paragraph":
      return sanitizeParagraph(input);
    case "heading":
      return sanitizeHeading(input);
    case "bulletList":
      return sanitizeList(input, "bulletList");
    case "numberedList":
      return sanitizeList(input, "numberedList");
    case "image":
      return sanitizeImage(input);
    default:
      return sanitizeParagraph(input);
  }
}

/** Runtime validation for blocks loaded from HTML/JSON/paste. */
export function sanitizeBlocks(blocks: unknown): Block[] {
  if (!Array.isArray(blocks)) return [emptyParagraph()];
  const out: Block[] = [];
  for (const b of blocks) out.push(sanitizeBlock(b));

  // Ensure at least one paragraph
  return out.length ? out : [emptyParagraph()];
}

