import type { Block } from "./blockTypes";
import { createId } from "./blockTypes";

/** Deep clone block tree (ids preserved). */
export function deepCloneBlocks(blocks: Block[]): Block[] {
  return structuredClone(blocks) as Block[];
}

export function blocksDeepEqual(a: Block[], b: Block[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** One list row = paragraph block (extensible later). */
export function listItemParagraph(text: string): Block {
  return { id: createId(), type: "paragraph", content: { text } };
}

/** Migrate legacy list content (string[]) or normalize unknown shapes. */
export function migrateBlock(b: Block): Block {
  if (b.type === "bulletList" || b.type === "numberedList") {
    const raw = b.content.items as unknown;
    if (!Array.isArray(raw) || raw.length === 0) {
      return { ...b, content: { items: [listItemParagraph("")] } };
    }
    if (typeof raw[0] === "string") {
      return {
        ...b,
        content: {
          items: (raw as string[]).map((t) => listItemParagraph(t)),
        },
      };
    }
    return {
      ...b,
      content: {
        items: (raw as Block[]).map((item) => migrateBlock(item as Block) as Block),
      },
    };
  }
  return b;
}

export function migrateBlocks(blocks: Block[]): Block[] {
  return blocks.map((b) => migrateBlock(b));
}
