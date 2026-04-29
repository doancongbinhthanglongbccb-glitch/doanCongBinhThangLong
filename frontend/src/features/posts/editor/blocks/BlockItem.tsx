import { memo, useEffect, useRef } from "react";
import { GripVertical, MoreHorizontal, Plus, SquareDashedMousePointer } from "lucide-react";
import type { Block, SlashCommandId } from "./blockTypes";
import BlockRenderer from "./BlockRenderer";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type BlockItemProps = {
  block: Block;
  isActive: boolean;
  isSelected: boolean;
  editable: boolean;
  isFirstParagraphPlaceholder?: boolean;
  onFocus: (event?: React.MouseEvent) => void;
  onAddBelow: () => void;
  onInsertBlockBelow?: (afterId: string, type: SlashCommandId) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onTextChange: (id: string, text: string) => void;
  onHeadingChange: (id: string, text: string) => void;
  onListChange: (id: string, items: Block[]) => void;
  onSlashProbe: (blockId: string, text: string, el: HTMLElement) => void;
  onKeyDownText: (e: React.KeyboardEvent<HTMLDivElement>, block: Block, el: HTMLElement) => void;
  onKeyDownList: (
    e: React.KeyboardEvent<HTMLDivElement>,
    block: Block,
    itemIndex: number,
    el: HTMLElement
  ) => void;
  onImageReplace: (blockId: string) => void;
  onImageRemove: (blockId: string) => void;
  onImageCaptionChange: (blockId: string, caption: string) => void;
  onPasteFromClipboard: (blockId: string, data: DataTransfer) => void;
  draggable?: boolean;
  isDragOverTop?: boolean;
  isDragOverBottom?: boolean;
  onDragStart?: (event: React.DragEvent, id: string) => void;
  onDragOver?: (event: React.DragEvent, id: string) => void;
  onDrop?: (event: React.DragEvent, id: string) => void;
  onHeightChange?: (id: string, height: number) => void;
};

function BlockItemInner({
  block,
  isActive,
  isSelected,
  editable,
  isFirstParagraphPlaceholder,
  onFocus,
  onAddBelow,
  onInsertBlockBelow,
  onDuplicate,
  onDelete,
  onTextChange,
  onHeadingChange,
  onListChange,
  onSlashProbe,
  onKeyDownText,
  onKeyDownList,
  onImageReplace,
  onImageRemove,
  onImageCaptionChange,
  onPasteFromClipboard,
  draggable,
  isDragOverTop,
  isDragOverBottom,
  onDragStart,
  onDragOver,
  onDrop,
  onHeightChange,
}: BlockItemProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !onHeightChange) return;
    onHeightChange(block.id, el.getBoundingClientRect().height);
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      onHeightChange(block.id, entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [block.id, onHeightChange]);

  return (
    <div
      ref={rootRef}
      data-block-id={block.id}
      onClick={(event) => onFocus(event)}
      onDragOver={(event) => onDragOver?.(event, block.id)}
      onDrop={(event) => onDrop?.(event, block.id)}
      className={cn(
        "group/row relative rounded-lg py-1 pl-10 pr-2 transition-colors",
        isActive && "bg-slate-50/90 ring-1 ring-slate-200/80",
        isSelected && "bg-blue-50/80 ring-1 ring-blue-200",
        isDragOverTop && "before:absolute before:inset-x-2 before:top-0 before:h-0.5 before:bg-primary",
        isDragOverBottom && "after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-primary"
      )}
    >
      {editable ? (
        <div className="absolute left-1 top-2 z-10 flex items-center gap-0.5 opacity-0 transition-opacity group-hover/row:opacity-100">
          <button
            type="button"
            aria-label="Kéo thả khối"
            draggable={draggable}
            onDragStart={(event) => onDragStart?.(event, block.id)}
            onMouseDown={(e) => e.stopPropagation()}
            className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Chèn khối"
                className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                onMouseDown={(e) => e.preventDefault()}
              >
                <Plus className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={() => onInsertBlockBelow?.(block.id, "paragraph") ?? onAddBelow()}>
                Paragraph
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onInsertBlockBelow?.(block.id, "h1") ?? undefined}>
                Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onInsertBlockBelow?.(block.id, "h2") ?? undefined}>
                Heading 2
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onInsertBlockBelow?.(block.id, "h3") ?? undefined}>
                Heading 3
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onInsertBlockBelow?.(block.id, "bulletList") ?? undefined}>
                Bullet list
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onInsertBlockBelow?.(block.id, "numberedList") ?? undefined}>
                Numbered list
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onInsertBlockBelow?.(block.id, "image") ?? undefined}>
                Image
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                onMouseDown={(e) => e.preventDefault()}
                aria-label="Mở menu khối"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-36">
              <DropdownMenuItem onClick={onDuplicate}>
                <SquareDashedMousePointer className="mr-2 h-4 w-4" />
                Nhân đôi
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-700 focus:text-red-700" onClick={onDelete}>
                Xóa khối
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}

      <BlockRenderer
        block={block}
        editable={editable}
        isEmptyDocPlaceholder={isFirstParagraphPlaceholder}
        onFocus={onFocus}
        onTextChange={onTextChange}
        onHeadingChange={onHeadingChange}
        onListChange={onListChange}
        onSlashProbe={onSlashProbe}
        onKeyDownText={onKeyDownText}
        onKeyDownList={onKeyDownList}
        onImageReplace={onImageReplace}
        onImageRemove={onImageRemove}
        onImageCaptionChange={onImageCaptionChange}
        onPasteFromClipboard={onPasteFromClipboard}
      />
    </div>
  );
}

export default memo(BlockItemInner, (a, b) => {
  return (
    a.block === b.block &&
    a.isActive === b.isActive &&
    a.isSelected === b.isSelected &&
    a.editable === b.editable &&
    a.isFirstParagraphPlaceholder === b.isFirstParagraphPlaceholder &&
    a.isDragOverTop === b.isDragOverTop &&
    a.isDragOverBottom === b.isDragOverBottom &&
    a.onHeightChange === b.onHeightChange
  );
});
