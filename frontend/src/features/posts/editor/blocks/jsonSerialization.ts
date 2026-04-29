import type { Block, BlockDocument } from "./blockTypes";
import { migrateBlocks } from "./blockTreeUtils";
import { sanitizeBlocks } from "./sanitizeBlocks";

/** Canonical JSON for blocks (client-side / future API). */
export function blocksToJson(blocks: Block[]): string {
  const payload: BlockDocument = {
    version: 1,
    blocks,
  };
  return JSON.stringify(payload);
}

export function parseBlocksJson(json: string): Block[] {
  try {
    const data = JSON.parse(json) as unknown;
    if (Array.isArray(data)) {
      // backward compatibility with old plain-array shape
      return sanitizeBlocks(migrateBlocks(data as Block[]));
    }
    if (!data || typeof data !== "object") return [];
    const doc = data as Partial<BlockDocument>;
    if (!Array.isArray(doc.blocks)) return [];
    return sanitizeBlocks(migrateBlocks(doc.blocks as Block[]));
  } catch {
    return [];
  }
}

export function serializeDual(blocks: Block[], html: string): { contentHtml: string; contentJson: string } {
  return { contentHtml: html, contentJson: blocksToJson(blocks) };
}
