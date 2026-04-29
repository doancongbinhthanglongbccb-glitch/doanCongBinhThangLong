import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImageIcon, Link2, Type } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import MediaLibraryModal from "@/features/media/components/MediaLibraryModal";
import type { MediaAsset } from "@/features/media/types/media.types";
import BlockItem from "./BlockItem";
import SlashCommandMenu from "./SlashCommandMenu";
import type { Block } from "./blockTypes";
import type { SlashCommandId } from "./blockTypes";
import { emptyBulletList, emptyHeading, emptyNumberedList, emptyParagraph, imageBlock } from "./blockTypes";
import { listItemParagraph } from "./blockTreeUtils";
import { getCaretRect, isCaretAtEnd, isCaretAtStart, parseSlashState, stripSlashFromText } from "./blockEditorUtils";
import { clipboardToBlocks } from "./pasteUtils";
import { useBlockEditor, type StructuredContentPayload } from "./useBlockEditor";

type Props = {
  hydrateKey: string;
  initialHtml: string;
  onChange: (html: string) => void;
  onStructuredChange?: (payload: StructuredContentPayload) => void;
  editable?: boolean;
  role?: "admin" | "editor" | "";
};

export default function BlockEditor({
  hydrateKey,
  initialHtml,
  onChange,
  onStructuredChange,
  editable = true,
  role = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [slash, setSlash] = useState<{ blockId: string; query: string; rect: DOMRect | null } | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [anchorId, setAnchorId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{ ids: string[]; overId: string | null; position: "top" | "bottom" }>({
    ids: [],
    overId: null,
    position: "bottom",
  });
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(640);
  const [heightVersion, setHeightVersion] = useState(0);
  const pendingImageBlockIdRef = useRef<string | null>(null);
  const imageIntentRef = useRef<"after" | "replace" | null>(null);
  const heightMapRef = useRef<Map<string, number>>(new Map());
  const startIndexRef = useRef(0);

  const {
    blocks,
    activeId,
    cursorRestore,
    clearCursorRestore,
    setActiveId,
    updateBlock,
    updateTextContent,
    insertAfter,
    removeBlock,
    applySlashCommand,
    replaceWithImage,
    mergePasteAt,
    removeBlocks,
    duplicateBlocks,
    moveBlocks,
    undo,
    redo,
  } = useBlockEditor({ hydrateKey, initialHtml, onChange, onStructuredChange });

  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;

  const focusEditable = useCallback((blockId: string, place: "start" | "end") => {
    requestAnimationFrame(() => {
      const wrap = containerRef.current?.querySelector(`[data-block-id="${blockId}"]`);
      const ed = wrap?.querySelector("[data-editable]") as HTMLElement | null;
      if (!ed) return;
      ed.focus();
      const sel = window.getSelection();
      if (!sel) return;
      const range = document.createRange();
      range.selectNodeContents(ed);
      range.collapse(place === "start");
      sel.removeAllRanges();
      sel.addRange(range);
    });
  }, []);

  const restoreCaretByOffset = useCallback((blockId: string, offset: number) => {
    requestAnimationFrame(() => {
      const wrap = containerRef.current?.querySelector(`[data-block-id="${blockId}"]`);
      const ed = wrap?.querySelector("[data-editable]") as HTMLElement | null;
      if (!ed) return;
      ed.focus();
      const selection = window.getSelection();
      if (!selection) return;
      const range = document.createRange();

      const walker = document.createTreeWalker(ed, NodeFilter.SHOW_TEXT);
      let remaining = Math.max(0, offset);
      let node = walker.nextNode() as Text | null;
      if (!node) {
        range.selectNodeContents(ed);
        range.collapse(true);
      } else {
        while (node) {
          const len = node.textContent?.length ?? 0;
          if (remaining <= len) {
            range.setStart(node, remaining);
            range.collapse(true);
            break;
          }
          remaining -= len;
          node = walker.nextNode() as Text | null;
        }
        if (!node) {
          range.selectNodeContents(ed);
          range.collapse(false);
        }
      }
      selection.removeAllRanges();
      selection.addRange(range);
    });
  }, []);

  const getActiveEditableEl = useCallback(() => {
    if (!activeId) return null;
    const wrap = containerRef.current?.querySelector(`[data-block-id="${activeId}"]`);
    return wrap?.querySelector("[data-editable]") as HTMLElement | null;
  }, [activeId]);

  const wrapSelectionWithText = useCallback(
    (wrappedText: string) => {
      const activeEl = getActiveEditableEl();
      if (!activeEl) return;
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      if (!activeEl.contains(sel.anchorNode) || !activeEl.contains(sel.focusNode)) return;
      const selected = sel.toString();
      if (!selected) return;

      const range = sel.getRangeAt(0);
      range.deleteContents();
      const node = document.createTextNode(wrappedText);
      range.insertNode(node);

      const nextRange = document.createRange();
      nextRange.setStartAfter(node);
      nextRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(nextRange);

      activeEl.dispatchEvent(new Event("input", { bubbles: true }));
      activeEl.focus();
    },
    [getActiveEditableEl]
  );

  const handleBold = useCallback(() => {
    const activeEl = getActiveEditableEl();
    if (!activeEl) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    if (!activeEl.contains(sel.anchorNode) || !activeEl.contains(sel.focusNode)) return;
    const selectedText = sel.toString();
    if (!selectedText) return;
    wrapSelectionWithText(`**${selectedText}**`);
  }, [getActiveEditableEl, wrapSelectionWithText]);

  const handleLink = useCallback(() => {
    const activeEl = getActiveEditableEl();
    if (!activeEl) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    if (!activeEl.contains(sel.anchorNode) || !activeEl.contains(sel.focusNode)) return;
    const selectedText = sel.toString();
    if (!selectedText) return;
    const url = window.prompt("Nhập URL (https://... hoặc mailto:... )");
    if (!url) return;
    const trimmed = url.trim();
    if (!/^(https?:\/\/|mailto:)/i.test(trimmed)) {
      toast.error("URL không hợp lệ. Cần https:// hoặc mailto:");
      return;
    }
    wrapSelectionWithText(`[${selectedText}](${trimmed})`);
  }, [getActiveEditableEl, toast, wrapSelectionWithText]);

  const blockIndex = useCallback((id: string) => blocksRef.current.findIndex((b) => b.id === id), []);
  const selectedIdsRef = useRef(selectedIds);
  selectedIdsRef.current = selectedIds;

  useEffect(() => {
    const known = new Set(blocks.map((b) => b.id));
    setSelectedIds((prev) => {
      const next = new Set(Array.from(prev).filter((id) => known.has(id)));
      return next.size === prev.size ? prev : next;
    });
    if (anchorId && !known.has(anchorId)) setAnchorId(null);
    // cleanup stale heights for removed blocks
    const map = heightMapRef.current;
    let mutated = false;
    for (const id of Array.from(map.keys())) {
      if (!known.has(id)) {
        map.delete(id);
        mutated = true;
      }
    }
    if (mutated) setHeightVersion((v) => v + 1);
  }, [blocks, anchorId]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const ro = new ResizeObserver(() => setViewportHeight(viewport.clientHeight));
    ro.observe(viewport);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!cursorRestore) return;
    restoreCaretByOffset(cursorRestore.blockId, cursorRestore.offset);
    clearCursorRestore();
  }, [cursorRestore, clearCursorRestore, restoreCaretByOffset]);

  useEffect(() => {
    if (!editable) return;
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const target = e.target as Node | null;
      if (!containerRef.current?.contains(target)) return;
      const key = e.key.toLowerCase();
      if (key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (key === "d") {
        e.preventDefault();
        const ids = selectedIdsRef.current.size ? Array.from(selectedIdsRef.current) : activeId ? [activeId] : [];
        if (!ids.length) return;
        duplicateBlocks(ids);
        return;
      }
      if (e.shiftKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
        e.preventDefault();
        const ids = selectedIdsRef.current.size ? Array.from(selectedIdsRef.current) : activeId ? [activeId] : [];
        if (!ids.length) return;
        const indices = ids.map((id) => blockIndex(id)).filter((i) => i >= 0).sort((a, b) => a - b);
        if (!indices.length) return;
        const to = e.key === "ArrowUp" ? Math.max(0, indices[0] - 1) : Math.min(blocksRef.current.length, indices[indices.length - 1] + 2);
        moveBlocks(ids, to);
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [editable, redo, undo, duplicateBlocks, activeId, blockIndex, moveBlocks]);

  const setSelectionSingle = useCallback((id: string) => {
    setSelectedIds(new Set([id]));
    setAnchorId(id);
  }, []);

  const handleSelectBlock = useCallback(
    (id: string, event?: React.MouseEvent) => {
      if (!event) {
        setActiveId(id);
        return;
      }
      setActiveId(id);
      if (event.shiftKey && anchorId) {
        const a = blockIndex(anchorId);
        const b = blockIndex(id);
        if (a >= 0 && b >= 0) {
          const [start, end] = a < b ? [a, b] : [b, a];
          const ids = blocksRef.current.slice(start, end + 1).map((x) => x.id);
          setSelectedIds(new Set(ids));
        } else {
          setSelectionSingle(id);
        }
        return;
      }
      if (event.metaKey || event.ctrlKey) {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
        setAnchorId(id);
        return;
      }
      setSelectionSingle(id);
    },
    [anchorId, blockIndex, setActiveId, setSelectionSingle]
  );

  const onSlashProbe = useCallback((blockId: string, text: string, _el: HTMLElement) => {
    const { open, query } = parseSlashState(text);
    if (open) {
      const rect = getCaretRect();
      setSlash({ blockId, query, rect });
    } else {
      setSlash((s) => (s?.blockId === blockId ? null : s));
    }
  }, []);

  const closeSlash = useCallback(() => setSlash(null), []);

  const openImagePickerFor = useCallback(
    (blockId: string) => {
      pendingImageBlockIdRef.current = blockId;
      imageIntentRef.current = "replace";
      setLibraryOpen(true);
      closeSlash();
    },
    [closeSlash]
  );

  const onSlashSelect = useCallback(
    (cmd: SlashCommandId) => {
      if (!slash) return;
      const { blockId } = slash;
      const wrap = containerRef.current?.querySelector(`[data-block-id="${blockId}"]`);
      const el = wrap?.querySelector("[data-editable]") as HTMLElement | null;
      const raw = el?.innerText ?? "";
      const cleaned = stripSlashFromText(raw);
      closeSlash();
      if (cmd === "image") {
        openImagePickerFor(blockId);
        return;
      }
      applySlashCommand(blockId, cmd);
      queueMicrotask(() => {
        updateBlock(blockId, (b) => {
          if (b.type === "paragraph") return { ...b, content: { text: cleaned } };
          if (b.type === "heading") return { ...b, content: { ...b.content, text: cleaned } };
          return b;
        }, `typing:${blockId}:slash-clean`);
        focusEditable(blockId, "end");
      });
    },
    [slash, closeSlash, applySlashCommand, updateBlock, focusEditable, openImagePickerFor]
  );

  const handleKeyDownText = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, block: Block, el: HTMLElement) => {
      if (slash && (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "Enter")) {
        return;
      }

      const list = blocksRef.current;

      if (e.key === "Enter" && !e.shiftKey) {
        if (block.type === "paragraph" || block.type === "heading") {
          e.preventDefault();
          const nb = emptyParagraph();
          insertAfter(block.id, nb);
          focusEditable(nb.id, "start");
        }
        return;
      }

      if (e.key === "Backspace") {
        const t = el.innerText.replace(/\n$/, "");
        if (t === "" && (block.type === "paragraph" || block.type === "heading")) {
          e.preventDefault();
          const i = blockIndex(block.id);
          const prevId = i > 0 ? list[i - 1]?.id : null;
          removeBlock(block.id);
          if (prevId) queueMicrotask(() => focusEditable(prevId, "end"));
        }
        return;
      }

      if (e.key === "ArrowDown" && isCaretAtEnd(el)) {
        const i = blockIndex(block.id);
        if (i >= 0 && i < list.length - 1) {
          e.preventDefault();
          focusEditable(list[i + 1].id, "start");
        }
        return;
      }

      if (e.key === "ArrowUp" && isCaretAtStart(el)) {
        const i = blockIndex(block.id);
        if (i > 0) {
          e.preventDefault();
          focusEditable(list[i - 1].id, "end");
        }
      }
    },
    [slash, insertAfter, removeBlock, blockIndex, focusEditable]
  );

  const handleKeyDownList = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, block: Block, itemIndex: number, el: HTMLElement) => {
      if (block.type !== "bulletList" && block.type !== "numberedList") return;

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const items = [...block.content.items];
        items.splice(itemIndex + 1, 0, listItemParagraph(""));
        updateBlock(block.id, (b) =>
          b.type === "bulletList" || b.type === "numberedList" ? { ...b, content: { items } } : b
        , `list:${block.id}`);
        return;
      }

      if (e.key === "Backspace" && el.innerText === "") {
        e.preventDefault();
        const items = block.content.items.filter((_, j) => j !== itemIndex);
        const list = blocksRef.current;
        if (items.length === 0) {
          const i = blockIndex(block.id);
          const prevId = i > 0 ? list[i - 1]?.id : null;
          removeBlock(block.id);
          if (prevId) queueMicrotask(() => focusEditable(prevId, "end"));
          return;
        }
        updateBlock(block.id, (b) =>
          b.type === "bulletList" || b.type === "numberedList" ? { ...b, content: { items } } : b
        , `list:${block.id}`);
      }
    },
    [updateBlock, blockIndex, removeBlock, focusEditable]
  );

  const onMediaSelect = useCallback(
    (asset: MediaAsset) => {
      const targetId = pendingImageBlockIdRef.current;
      const mode = imageIntentRef.current;
      pendingImageBlockIdRef.current = null;
      imageIntentRef.current = null;
      setLibraryOpen(false);
      if (!targetId || !mode) return;
      const alt = asset.originalName || "";
      if (mode === "replace") {
        replaceWithImage(targetId, asset.url, alt);
        queueMicrotask(() => focusEditable(targetId, "start"));
      } else {
        const img = imageBlock(asset.url, alt);
        insertAfter(targetId, img);
        queueMicrotask(() => focusEditable(img.id, "start"));
      }
    },
    [replaceWithImage, insertAfter, focusEditable]
  );

  const addBlockBelow = useCallback(
    (blockId: string) => {
      const nb = emptyParagraph();
      insertAfter(blockId, nb);
      focusEditable(nb.id, "start");
    },
    [insertAfter, focusEditable]
  );

  const insertBlockBelow = useCallback(
    (afterId: string, type: SlashCommandId) => {
      if (!editable) return;
      if (type === "paragraph") {
        addBlockBelow(afterId);
        return;
      }
      if (type === "h1") {
        insertAfter(afterId, emptyHeading(1));
        return;
      }
      if (type === "h2") {
        insertAfter(afterId, emptyHeading(2));
        return;
      }
      if (type === "h3") {
        insertAfter(afterId, emptyHeading(3));
        return;
      }
      if (type === "bulletList") {
        insertAfter(afterId, emptyBulletList());
        return;
      }
      if (type === "numberedList") {
        insertAfter(afterId, emptyNumberedList());
        return;
      }
      if (type === "image") {
        const img = imageBlock("", "", undefined);
        insertAfter(afterId, img);
        openImagePickerFor(img.id);
      }
    },
    [editable, addBlockBelow, insertAfter, openImagePickerFor]
  );

  const insertImageAfterActive = useCallback(() => {
    const targetId = activeId ?? blocksRef.current[blocksRef.current.length - 1]?.id;
    if (!targetId) return;
    pendingImageBlockIdRef.current = targetId;
    imageIntentRef.current = "after";
    setLibraryOpen(true);
  }, [activeId]);

  const onImageReplace = useCallback((blockId: string) => {
    pendingImageBlockIdRef.current = blockId;
    imageIntentRef.current = "replace";
    setLibraryOpen(true);
  }, []);

  const onImageRemove = useCallback(
    (blockId: string) => {
      const list = blocksRef.current;
      const i = blockIndex(blockId);
      const prevId = i > 0 ? list[i - 1]?.id : null;
      removeBlock(blockId);
      if (prevId) queueMicrotask(() => focusEditable(prevId, "end"));
    },
    [blockIndex, removeBlock, focusEditable]
  );

  const onListChange = useCallback(
    (id: string, items: Block[]) => {
      updateBlock(id, (b) =>
        b.type === "bulletList" || b.type === "numberedList" ? { ...b, content: { items } } : b
      , `list:${id}`);
    },
    [updateBlock]
  );

  const onImageCaptionChange = useCallback(
    (id: string, caption: string) => {
      updateTextContent(id, caption, undefined, `caption:${id}`);
    },
    [updateTextContent]
  );

  const onPasteFromClipboard = useCallback(
    (blockId: string, data: DataTransfer) => {
      const html = data.getData("text/html");
      const plain = data.getData("text/plain");
      const pasted = clipboardToBlocks(html || undefined, plain);
      mergePasteAt(blockId, pasted);
      setSelectionSingle(blockId);
      queueMicrotask(() => focusEditable(blockId, "end"));
    },
    [mergePasteAt, focusEditable, setSelectionSingle]
  );

  const handleDuplicate = useCallback(
    (blockId: string) => {
      const ids = selectedIds.has(blockId) ? Array.from(selectedIds) : [blockId];
      duplicateBlocks(ids);
    },
    [duplicateBlocks, selectedIds]
  );

  const handleDelete = useCallback(
    (blockId: string) => {
      const ids = selectedIds.has(blockId) ? Array.from(selectedIds) : [blockId];
      if (ids.length === 1) removeBlock(ids[0]);
      else removeBlocks(ids);
      setSelectedIds(new Set());
    },
    [removeBlock, removeBlocks, selectedIds]
  );

  const handleDragStart = useCallback(
    (event: React.DragEvent, blockId: string) => {
      const ids = selectedIds.has(blockId) ? Array.from(selectedIds) : [blockId];
      setDragState({ ids, overId: null, position: "bottom" });
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", ids.join(","));
    },
    [selectedIds]
  );

  const handleDragOver = useCallback((event: React.DragEvent, overId: string) => {
    event.preventDefault();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const position = event.clientY < rect.top + rect.height / 2 ? "top" : "bottom";
    setDragState((prev) => ({ ...prev, overId, position }));
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent, overId: string) => {
      event.preventDefault();
      const ids = dragState.ids;
      if (!ids.length) return;
      const overIndex = blockIndex(overId);
      if (overIndex < 0) return;
      const targetIndex = dragState.position === "bottom" ? overIndex + 1 : overIndex;
      moveBlocks(ids, targetIndex);
      setDragState({ ids: [], overId: null, position: "bottom" });
      setSelectedIds(new Set(ids));
    },
    [dragState, blockIndex, moveBlocks]
  );

  const shouldVirtualize = blocks.length > 100;
  const estimatedRow = 84;
  const overscanPx = 1200;

  const getBlockHeight = useCallback((id: string) => heightMapRef.current.get(id) ?? estimatedRow, []);

  const findIndexByOffset = useCallback(
    (offset: number) => {
      let acc = 0;
      for (let i = 0; i < blocks.length; i++) {
        const h = getBlockHeight(blocks[i].id);
        if (acc + h > offset) return i;
        acc += h;
      }
      return Math.max(0, blocks.length - 1);
    },
    [blocks, getBlockHeight]
  );

  const calcOffsetForIndex = useCallback(
    (index: number) => {
      let acc = 0;
      const safe = Math.max(0, Math.min(index, blocks.length));
      for (let i = 0; i < safe; i++) acc += getBlockHeight(blocks[i].id);
      return acc;
    },
    [blocks, getBlockHeight]
  );

  const totalHeight = useMemo(() => {
    let acc = 0;
    for (let i = 0; i < blocks.length; i++) acc += getBlockHeight(blocks[i].id);
    return acc;
  }, [blocks, getBlockHeight, heightVersion]);

  const startIndex = shouldVirtualize ? findIndexByOffset(Math.max(0, scrollTop - overscanPx)) : 0;
  const endIndex = shouldVirtualize
    ? Math.min(blocks.length, findIndexByOffset(scrollTop + viewportHeight + overscanPx) + 1)
    : blocks.length;
  const beforeHeight = shouldVirtualize ? calcOffsetForIndex(startIndex) : 0;
  const afterHeight = shouldVirtualize ? Math.max(0, totalHeight - calcOffsetForIndex(endIndex)) : 0;
  startIndexRef.current = startIndex;
  const visibleBlocks = useMemo(
    () => blocks.slice(startIndex, endIndex).map((b, i) => ({ block: b, idx: startIndex + i })),
    [blocks, startIndex, endIndex]
  );

  const handleBlockHeightChange = useCallback(
    (id: string, rawHeight: number) => {
      const height = Math.max(24, Math.ceil(rawHeight));
      const prev = heightMapRef.current.get(id);
      if (prev === height) return;
      heightMapRef.current.set(id, height);

      const idx = blocksRef.current.findIndex((b) => b.id === id);
      if (idx >= 0 && idx < startIndexRef.current && prev != null && containerRef.current) {
        const delta = height - prev;
        if (delta !== 0) containerRef.current.scrollTop += delta;
      }
      setHeightVersion((v) => v + 1);
    },
    []
  );

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {editable ? (
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50/90 px-3 py-2">
          <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5" onClick={insertImageAfterActive}>
            <ImageIcon className="h-4 w-4" />
            Chèn ảnh
          </Button>
          <div className="ml-2 flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={handleBold} disabled={!activeId}>
              <Type className="mr-1 h-4 w-4" />
              Bold
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={handleLink} disabled={!activeId}>
              <Link2 className="mr-1 h-4 w-4" />
              Link
            </Button>
          </div>
        </div>
      ) : null}

      <div
        ref={containerRef}
        className="max-h-[70vh] overflow-auto px-3 py-4 sm:px-4"
        onScroll={(event) => setScrollTop((event.currentTarget as HTMLDivElement).scrollTop)}
      >
        <div ref={viewportRef} className="max-w-[700px]">
          {beforeHeight > 0 ? <div style={{ height: beforeHeight }} /> : null}
          {visibleBlocks.map(({ block, idx }) => (
          <BlockItem
            key={block.id}
            block={block}
            isActive={activeId === block.id}
            isSelected={selectedIds.has(block.id)}
            editable={editable}
            isFirstParagraphPlaceholder={idx === 0 && block.type === "paragraph" && blocks.length === 1}
            onFocus={(event) => handleSelectBlock(block.id, event)}
            onAddBelow={() => addBlockBelow(block.id)}
            onInsertBlockBelow={(afterId, type) => insertBlockBelow(afterId, type)}
            onDuplicate={() => handleDuplicate(block.id)}
            onDelete={() => handleDelete(block.id)}
            onTextChange={(id, text) =>
              updateTextContent(id, text, undefined, `typing:${id}`)
            }
            onHeadingChange={(id, text) =>
              updateTextContent(id, text, undefined, `typing:${id}`)
            }
            onListChange={onListChange}
            onSlashProbe={onSlashProbe}
            onKeyDownText={handleKeyDownText}
            onKeyDownList={handleKeyDownList}
            onImageReplace={onImageReplace}
            onImageRemove={onImageRemove}
            onImageCaptionChange={onImageCaptionChange}
            onPasteFromClipboard={onPasteFromClipboard}
            draggable={editable}
            isDragOverTop={dragState.overId === block.id && dragState.position === "top"}
            isDragOverBottom={dragState.overId === block.id && dragState.position === "bottom"}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onHeightChange={handleBlockHeightChange}
          />
          ))}
          {afterHeight > 0 ? <div style={{ height: afterHeight }} /> : null}
        </div>
      </div>

      <SlashCommandMenu
        open={Boolean(slash)}
        anchorRect={slash?.rect ?? null}
        filter={slash?.query ?? ""}
        onSelect={onSlashSelect}
        onClose={closeSlash}
      />

      <MediaLibraryModal
        open={libraryOpen}
        onOpenChange={(o) => {
          setLibraryOpen(o);
          if (!o) {
            pendingImageBlockIdRef.current = null;
            imageIntentRef.current = null;
          }
        }}
        role={role}
        autoSelectOnUpload={true}
        onSelect={(asset) => {
          try {
            onMediaSelect(asset);
          } catch {
            toast.error("Chèn ảnh thất bại");
          }
        }}
      />
    </div>
  );
}
