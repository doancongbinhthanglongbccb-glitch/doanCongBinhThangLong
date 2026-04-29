import { useCallback, useEffect, useRef, useState } from "react";
import type { Block } from "./blockTypes";
import type { SlashCommandId } from "./blockTypes";
import { createId, emptyParagraph, imageBlock } from "./blockTypes";
import { blocksToHtml, htmlToBlocks } from "./htmlSerialization";
import { serializeDual } from "./jsonSerialization";
import { deepCloneBlocks, listItemParagraph, migrateBlocks } from "./blockTreeUtils";
import { sanitizeBlocks } from "./sanitizeBlocks";

const HISTORY_CAP = 50;
const GROUP_DEBOUNCE_MS = 500;

export type StructuredContentPayload = { contentHtml: string; contentJson: string };
export type TextField = "paragraph.text" | "heading.text" | "image.caption";
export type CursorRestore = {
  blockId: string;
  field: TextField;
  offset: number;
};

type UseBlockEditorOptions = {
  hydrateKey: string;
  initialHtml: string;
  onChange: (html: string) => void;
  onStructuredChange?: (payload: StructuredContentPayload) => void;
};

type PatchOp =
  | { kind: "set"; id: string; next: Block }
  | { kind: "insert"; index: number; blocks: Block[] }
  | { kind: "remove"; index: number; blocks: Block[] }
  | {
      kind: "update_text_range";
      id: string;
      field: TextField;
      start: number;
      removedText: string;
      insertedText: string;
      cursorBefore: CursorRestore;
      cursorAfter: CursorRestore;
    }
  | {
    kind: "reorder_blocks";
    ids: string[];
    originalIndices: number[];
    targetIndex: number;
    desiredIndices: number[];
  };

type HistoryEntry = {
  forward: PatchOp[];
  inverse: PatchOp[];
  ts: number;
  groupKey?: string;
  cursorBefore?: CursorRestore;
  cursorAfter?: CursorRestore;
};

const textFieldByBlockType: Record<string, TextField | null> = {
  paragraph: "paragraph.text",
  heading: "heading.text",
  image: "image.caption",
  bulletList: null,
  numberedList: null,
};

function findBlockById(blocks: Block[], id: string): Block | null {
  return blocks.find((b) => b.id === id) ?? null;
}

function getTextForField(block: Block, field: TextField): string | null {
  if (field === "paragraph.text" && block.type === "paragraph") return block.content.text;
  if (field === "heading.text" && block.type === "heading") return block.content.text;
  if (field === "image.caption" && block.type === "image") return block.content.caption || "";
  return null;
}

function setTextForField(block: Block, field: TextField, value: string): Block {
  if (field === "paragraph.text" && block.type === "paragraph") {
    return { ...block, content: { text: value } };
  }
  if (field === "heading.text" && block.type === "heading") {
    return { ...block, content: { ...block.content, text: value } };
  }
  if (field === "image.caption" && block.type === "image") {
    return { ...block, content: { ...block.content, caption: value || undefined } };
  }
  return block;
}

function applyTextRange(base: string, start: number, removeLength: number, insertedText: string): string {
  return base.slice(0, start) + insertedText + base.slice(start + removeLength);
}

function computeTextRangeDiff(prev: string, next: string): {
  start: number;
  removedText: string;
  insertedText: string;
} | null {
  if (prev === next) return null;
  let start = 0;
  while (start < prev.length && start < next.length && prev[start] === next[start]) start += 1;

  let endPrev = prev.length;
  let endNext = next.length;
  while (endPrev > start && endNext > start && prev[endPrev - 1] === next[endNext - 1]) {
    endPrev -= 1;
    endNext -= 1;
  }
  return {
    start,
    removedText: prev.slice(start, endPrev),
    insertedText: next.slice(start, endNext),
  };
}

function clonePatchOps(ops: PatchOp[]): PatchOp[] {
  return ops.map((op) => {
    if (op.kind === "set") return { ...op, next: deepCloneBlocks([op.next])[0] };
    if (op.kind === "insert" || op.kind === "remove") return { ...op, blocks: deepCloneBlocks(op.blocks) };
    return { ...op, cursorBefore: { ...op.cursorBefore }, cursorAfter: { ...op.cursorAfter } };
  });
}

export function useBlockEditor({ hydrateKey, initialHtml, onChange, onStructuredChange }: UseBlockEditorOptions) {
  const [blocks, setBlocks] = useState<Block[]>(() => migrateBlocks(htmlToBlocks(initialHtml || "")));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [cursorRestore, setCursorRestore] = useState<CursorRestore | null>(null);

  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onStructuredChangeRef = useRef(onStructuredChange);
  onStructuredChangeRef.current = onStructuredChange;

  const prevHydrateKey = useRef<string | null>(null);
  const historyPausedRef = useRef(false);
  const pastRef = useRef<HistoryEntry[]>([]);
  const futureRef = useRef<HistoryEntry[]>([]);
  const pendingRef = useRef<HistoryEntry | null>(null);
  const pendingTimerRef = useRef<number | null>(null);

  const emitSnapshot = useCallback((next: Block[]) => {
    const html = blocksToHtml(next);
    onChangeRef.current(html);
    onStructuredChangeRef.current?.(serializeDual(next, html));
  }, []);

  const applyPatchOps = useCallback((source: Block[], ops: PatchOp[]): Block[] => {
    let next = source;
    for (const op of ops) {
      if (op.kind === "set") {
        next = next.map((b) => (b.id === op.id ? op.next : b));
        continue;
      }
      if (op.kind === "insert") {
        next = [...next.slice(0, op.index), ...deepCloneBlocks(op.blocks), ...next.slice(op.index)];
        continue;
      }
      if (op.kind === "remove") {
        next = [...next.slice(0, op.index), ...next.slice(op.index + op.blocks.length)];
        continue;
      }
      if (op.kind === "update_text_range") {
        next = next.map((b) => {
          if (b.id !== op.id) return b;
          const current = getTextForField(b, op.field);
          if (current == null) return b;
          const updated = applyTextRange(current, op.start, op.removedText.length, op.insertedText);
          return setTextForField(b, op.field, updated);
        });
      }

      if (op.kind === "reorder_blocks") {
        const ids = op.ids;
        const desired = op.desiredIndices;
        if (ids.length === 0 || ids.length !== desired.length) continue;

        const selectedSet = new Set(ids);
        const selectedBlocks = ids.map((id) => next.find((b) => b.id === id)).filter(Boolean) as Block[];
        if (selectedBlocks.length !== ids.length) continue;

        const remaining = next.filter((b) => !selectedSet.has(b.id));

        const out: (Block | null)[] = new Array(next.length).fill(null);
        // Place selected blocks at desired indices.
        for (let k = 0; k < ids.length; k++) {
          const at = desired[k];
          if (at < 0 || at >= out.length) continue;
          out[at] = selectedBlocks[k];
        }

        // Fill gaps with remaining blocks in their current order.
        let r = 0;
        for (let i = 0; i < out.length; i++) {
          if (out[i] === null) {
            out[i] = remaining[r] ?? null;
            r++;
          }
        }

        if (out.some((x) => x === null)) continue;
        next = out as Block[];
        continue;
      }
    }
    return next;
  }, []);

  const pushHistory = useCallback((entry: HistoryEntry) => {
    pastRef.current = [...pastRef.current, entry].slice(-HISTORY_CAP);
    futureRef.current = [];
  }, []);

  const flushPending = useCallback(() => {
    if (pendingTimerRef.current) {
      window.clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
    if (!pendingRef.current) return;
    pushHistory(pendingRef.current);
    pendingRef.current = null;
  }, [pushHistory]);

  const queueGroupedHistory = useCallback(
    (entry: HistoryEntry) => {
      if (!entry.groupKey) {
        flushPending();
        pushHistory(entry);
        return;
      }
      if (pendingRef.current?.groupKey === entry.groupKey) {
        pendingRef.current = {
          groupKey: entry.groupKey,
          ts: entry.ts,
          forward: [...pendingRef.current.forward, ...entry.forward],
          inverse: [...entry.inverse, ...pendingRef.current.inverse],
          cursorBefore: pendingRef.current.cursorBefore ?? entry.cursorBefore,
          cursorAfter: entry.cursorAfter ?? pendingRef.current.cursorAfter,
        };
      } else {
        flushPending();
        pendingRef.current = entry;
      }
      if (pendingTimerRef.current) window.clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = window.setTimeout(() => {
        if (pendingRef.current) pushHistory(pendingRef.current);
        pendingRef.current = null;
        pendingTimerRef.current = null;
      }, GROUP_DEBOUNCE_MS);
    },
    [flushPending, pushHistory]
  );

  const commitPatch = useCallback(
    (entry: Omit<HistoryEntry, "ts">) => {
      const next = applyPatchOps(blocksRef.current, entry.forward);
      blocksRef.current = next;
      setBlocks(next);
      emitSnapshot(next);
      if (!historyPausedRef.current) {
        queueGroupedHistory({ ...entry, ts: Date.now() });
      }
    },
    [applyPatchOps, emitSnapshot, queueGroupedHistory]
  );

  useEffect(() => {
    if (prevHydrateKey.current === null) {
      prevHydrateKey.current = hydrateKey;
      return;
    }
    if (prevHydrateKey.current === hydrateKey) return;
    prevHydrateKey.current = hydrateKey;
    historyPausedRef.current = true;
    flushPending();
    const next = sanitizeBlocks(migrateBlocks(htmlToBlocks(initialHtml || "")));
    blocksRef.current = next;
    setBlocks(next);
    emitSnapshot(next);
    pastRef.current = [];
    futureRef.current = [];
    setActiveId(null);
    setCursorRestore(null);
    queueMicrotask(() => {
      historyPausedRef.current = false;
    });
  }, [hydrateKey, initialHtml, emitSnapshot, flushPending]);

  const undo = useCallback(() => {
    flushPending();
    if (pastRef.current.length === 0) return;
    const entry = pastRef.current.pop()!;
    futureRef.current.push({
      ...entry,
      forward: clonePatchOps(entry.forward),
      inverse: clonePatchOps(entry.inverse),
    });
    historyPausedRef.current = true;
    const next = applyPatchOps(blocksRef.current, entry.inverse);
    blocksRef.current = next;
    setBlocks(next);
    emitSnapshot(next);
    if (entry.cursorBefore) setCursorRestore(entry.cursorBefore);
    queueMicrotask(() => {
      historyPausedRef.current = false;
    });
  }, [applyPatchOps, emitSnapshot, flushPending]);

  const redo = useCallback(() => {
    flushPending();
    if (futureRef.current.length === 0) return;
    const entry = futureRef.current.pop()!;
    pastRef.current = [...pastRef.current, entry].slice(-HISTORY_CAP);
    historyPausedRef.current = true;
    const next = applyPatchOps(blocksRef.current, entry.forward);
    blocksRef.current = next;
    setBlocks(next);
    emitSnapshot(next);
    if (entry.cursorAfter) setCursorRestore(entry.cursorAfter);
    queueMicrotask(() => {
      historyPausedRef.current = false;
    });
  }, [applyPatchOps, emitSnapshot, flushPending]);

  const updateBlock = useCallback(
    (id: string, updater: (b: Block) => Block, historyGroup?: string) => {
      const current = blocksRef.current.find((b) => b.id === id);
      if (!current) return;
      const updated = updater(current);
      if (JSON.stringify(updated) === JSON.stringify(current)) return;
      commitPatch({
        groupKey: historyGroup,
        forward: [{ kind: "set", id, next: updated }],
        inverse: [{ kind: "set", id, next: current }],
      });
    },
    [commitPatch]
  );

  const updateTextContent = useCallback(
    (id: string, nextText: string, cursorAfterOffset?: number, historyGroup?: string) => {
      const current = findBlockById(blocksRef.current, id);
      if (!current) return;
      const field = textFieldByBlockType[current.type];
      if (!field) return;
      const prevText = getTextForField(current, field);
      if (prevText == null) return;
      const diff = computeTextRangeDiff(prevText, nextText);
      if (!diff) return;

      const cursorBefore: CursorRestore = {
        blockId: id,
        field,
        offset: Math.max(0, Math.min(prevText.length, diff.start + diff.removedText.length)),
      };
      const cursorAfter: CursorRestore = {
        blockId: id,
        field,
        offset:
          cursorAfterOffset != null
            ? Math.max(0, Math.min(nextText.length, cursorAfterOffset))
            : Math.max(0, Math.min(nextText.length, diff.start + diff.insertedText.length)),
      };

      const forward: PatchOp = {
        kind: "update_text_range",
        id,
        field,
        start: diff.start,
        removedText: diff.removedText,
        insertedText: diff.insertedText,
        cursorBefore,
        cursorAfter,
      };
      const inverse: PatchOp = {
        kind: "update_text_range",
        id,
        field,
        start: diff.start,
        removedText: diff.insertedText,
        insertedText: diff.removedText,
        cursorBefore: cursorAfter,
        cursorAfter: cursorBefore,
      };

      commitPatch({
        groupKey: historyGroup ?? `typing:${id}`,
        forward: [forward],
        inverse: [inverse],
        cursorBefore,
        cursorAfter,
      });
    },
    [commitPatch]
  );

  const insertAfter = useCallback(
    (afterId: string, block: Block) => {
      const i = blocksRef.current.findIndex((b) => b.id === afterId);
      const index = i < 0 ? blocksRef.current.length : i + 1;
      commitPatch({
        forward: [{ kind: "insert", index, blocks: [block] }],
        inverse: [{ kind: "remove", index, blocks: [block] }],
      });
      queueMicrotask(() => setActiveId(block.id));
    },
    [commitPatch]
  );

  const removeBlock = useCallback(
    (id: string) => {
      if (blocksRef.current.length <= 1) {
        const current = blocksRef.current[0];
        const single = emptyParagraph();
        commitPatch({
          forward: [{ kind: "set", id: current.id, next: single }],
          inverse: [{ kind: "set", id: current.id, next: current }],
        });
        queueMicrotask(() => setActiveId(single.id));
        return;
      }
      const i = blocksRef.current.findIndex((b) => b.id === id);
      if (i < 0) return;
      const removed = blocksRef.current[i];
      commitPatch({
        forward: [{ kind: "remove", index: i, blocks: [removed] }],
        inverse: [{ kind: "insert", index: i, blocks: [removed] }],
      });
      const next = blocksRef.current.filter((b) => b.id !== id);
      const focusId = next[Math.max(0, i - 1)]?.id ?? next[0]?.id ?? null;
      queueMicrotask(() => setActiveId(focusId));
    },
    [commitPatch]
  );

  const replaceBlock = useCallback(
    (id: string, newBlock: Block) => {
      const current = blocksRef.current.find((b) => b.id === id);
      if (!current) return;
      commitPatch({
        forward: [{ kind: "set", id, next: newBlock }],
        inverse: [{ kind: "set", id, next: current }],
      });
      queueMicrotask(() => setActiveId(newBlock.id));
    },
    [commitPatch]
  );

  const applySlashCommand = useCallback(
    (blockId: string, cmd: SlashCommandId) => {
      if (cmd === "image") return;
      const current = blocksRef.current.find((b) => b.id === blockId);
      if (!current) return;
      let replacement: Block;
      switch (cmd) {
        case "paragraph":
          replacement = { id: blockId, type: "paragraph", content: { text: "" } };
          break;
        case "h1":
          replacement = { id: blockId, type: "heading", content: { level: 1, text: "" } };
          break;
        case "h2":
          replacement = { id: blockId, type: "heading", content: { level: 2, text: "" } };
          break;
        case "h3":
          replacement = { id: blockId, type: "heading", content: { level: 3, text: "" } };
          break;
        case "bulletList":
          replacement = { id: blockId, type: "bulletList", content: { items: [listItemParagraph("")] } };
          break;
        case "numberedList":
          replacement = { id: blockId, type: "numberedList", content: { items: [listItemParagraph("")] } };
          break;
        default:
          replacement = { id: blockId, type: "paragraph", content: { text: "" } };
      }
      commitPatch({
        forward: [{ kind: "set", id: blockId, next: replacement }],
        inverse: [{ kind: "set", id: blockId, next: current }],
      });
      queueMicrotask(() => setActiveId(blockId));
    },
    [commitPatch]
  );

  const replaceWithImage = useCallback(
    (blockId: string, src: string, alt: string, caption?: string) => {
      replaceBlock(blockId, { ...imageBlock(src, alt, caption), id: blockId });
    },
    [replaceBlock]
  );

  const mergePasteAt = useCallback(
    (targetId: string, pasted: Block[]) => {
      if (!pasted.length) return;
      const i = blocksRef.current.findIndex((b) => b.id === targetId);
      if (i < 0) return;
      const cur = blocksRef.current[i];
      const [p0, ...rest] = pasted;
      let first: Block;
      if (cur.type === "paragraph" && p0.type === "paragraph") {
        first = { ...cur, content: { text: p0.content.text } };
      } else if (cur.type === "heading" && p0.type === "heading") {
        first = { ...cur, content: p0.content };
      } else {
        first = { ...p0, id: cur.id } as Block;
      }
      const tail = rest.map((b) => ({ ...b, id: createId() }) as Block);
      const forward: PatchOp[] = [{ kind: "set", id: cur.id, next: first }];
      const inverse: PatchOp[] = [{ kind: "set", id: cur.id, next: cur }];
      if (tail.length) {
        forward.push({ kind: "insert", index: i + 1, blocks: tail });
        inverse.unshift({ kind: "remove", index: i + 1, blocks: tail });
      }
      commitPatch({
        groupKey: "paste",
        forward,
        inverse,
      });
    },
    [commitPatch]
  );

  const removeBlocks = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids);
      const pairs = blocksRef.current
        .map((b, i) => ({ b, i }))
        .filter(({ b }) => idSet.has(b.id));
      if (!pairs.length) return;
      const forward = pairs
        .slice()
        .sort((a, b) => b.i - a.i)
        .map(({ b, i }) => ({ kind: "remove", index: i, blocks: [b] } as PatchOp));
      const inverse = pairs
        .slice()
        .sort((a, b) => a.i - b.i)
        .map(({ b, i }) => ({ kind: "insert", index: i, blocks: [b] } as PatchOp));
      commitPatch({ forward, inverse });
    },
    [commitPatch]
  );

  const duplicateBlocks = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids);
      const chosen = blocksRef.current.filter((b) => idSet.has(b.id));
      if (!chosen.length) return;
      const clones = chosen.map((b) => ({ ...deepCloneBlocks([b])[0], id: createId() }));
      const maxIdx = Math.max(...blocksRef.current.map((b, i) => (idSet.has(b.id) ? i : -1)));
      const insertIndex = maxIdx + 1;
      commitPatch({
        forward: [{ kind: "insert", index: insertIndex, blocks: clones }],
        inverse: [{ kind: "remove", index: insertIndex, blocks: clones }],
      });
      queueMicrotask(() => setActiveId(clones[0]?.id ?? null));
    },
    [commitPatch]
  );

  const moveBlocks = useCallback(
    (ids: string[], targetIndex: number) => {
      const idSet = new Set(ids);
      const pairs = blocksRef.current
        .map((b, i) => ({ b, i }))
        .filter(({ b }) => idSet.has(b.id));
      if (!pairs.length) return;
      const selectedBlocks = pairs.map((p) => p.b);
      const remaining = blocksRef.current.filter((b) => !idSet.has(b.id));
      // ids order is based on their current appearance in the document (ascending indices).
      const ordered = pairs.slice().sort((a, b) => a.i - b.i);
      const idsInOrder = ordered.map((p) => p.b.id);
      const originalIndices = ordered.map((p) => p.i);

      // Compute where the selected contiguous group lands in the final array.
      // targetIndex is an insertion index in the full array, before removal.
      const offset = ordered.filter((p) => p.i < targetIndex).length;
      const adjusted = Math.max(0, Math.min(remaining.length, targetIndex - offset));
      const desiredIndices = idsInOrder.map((_, k) => adjusted + k);

      const forward: PatchOp[] = [
        {
          kind: "reorder_blocks",
          ids: idsInOrder,
          originalIndices,
          targetIndex,
          desiredIndices,
        },
      ];

      const inverse: PatchOp[] = [
        {
          kind: "reorder_blocks",
          ids: idsInOrder,
          originalIndices: desiredIndices,
          targetIndex: adjusted,
          desiredIndices: originalIndices,
        },
      ];

      // Group drag into a single history entry.
      commitPatch({ groupKey: `drag:${idsInOrder.join(",")}:${targetIndex}`, forward, inverse });
    },
    [commitPatch]
  );

  const clearCursorRestore = useCallback(() => setCursorRestore(null), []);

  return {
    blocks,
    activeId,
    cursorRestore,
    clearCursorRestore,
    setActiveId,
    updateBlock,
    updateTextContent,
    insertAfter,
    removeBlock,
    replaceBlock,
    applySlashCommand,
    replaceWithImage,
    mergePasteAt,
    removeBlocks,
    duplicateBlocks,
    moveBlocks,
    undo,
    redo,
  };
}
