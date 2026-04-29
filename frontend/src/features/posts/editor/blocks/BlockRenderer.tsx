import { useEffect, useRef } from "react";
import type { Block } from "./blockTypes";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function ListRow({
  item,
  editable,
  onFocus,
  onTextChange,
  onKeyDown,
}: {
  item: Block;
  editable: boolean;
  onFocus: () => void;
  onTextChange: (t: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>, el: HTMLDivElement) => void;
}) {
  const text = item.type === "paragraph" ? item.content.text : "";
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if (el.textContent !== text) el.textContent = text;
  }, [text]);
  return (
    <li className="leading-relaxed">
      <div
        ref={ref}
        contentEditable={editable}
        suppressContentEditableWarning
        data-editable
        className="min-h-[1.5em] whitespace-pre-wrap outline-none"
        onFocus={onFocus}
        onInput={(e) => onTextChange(e.currentTarget.innerText.replace(/\u00a0/g, " "))}
        onKeyDown={(e) => onKeyDown(e, e.currentTarget)}
      />
    </li>
  );
}

type TextHandlers = {
  onTextChange: (text: string) => void;
  onSlashProbe: (text: string, el: HTMLElement) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onFocus: () => void;
  onPaste?: (data: DataTransfer) => void;
};

function EditableText({
  blockId,
  text,
  className,
  placeholder,
  editable,
  handlers,
}: {
  blockId: string;
  text: string;
  className?: string;
  placeholder?: string;
  editable: boolean;
  handlers: TextHandlers;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if ((el.textContent || "") !== text) el.textContent = text;
  }, [text, blockId]);

  return (
    <div
      ref={ref}
      contentEditable={editable}
      suppressContentEditableWarning
      data-editable
      data-block-focus={blockId}
      className={cn(
        "min-h-[1.6em] whitespace-pre-wrap break-words outline-none",
        !text && "empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)]",
        className
      )}
      data-placeholder={placeholder || ""}
      onFocus={handlers.onFocus}
      onInput={(e) => {
        const el = e.currentTarget;
        const t = el.innerText.replace(/\u00a0/g, " ");
        handlers.onTextChange(t);
        handlers.onSlashProbe(t, el);
      }}
      onPaste={(e) => {
        if (!handlers.onPaste) return;
        e.preventDefault();
        handlers.onPaste(e.clipboardData);
      }}
      onKeyDown={handlers.onKeyDown}
    />
  );
}

type Props = {
  block: Block;
  editable: boolean;
  isEmptyDocPlaceholder?: boolean;
  onFocus: () => void;
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
};

export default function BlockRenderer({
  block,
  editable,
  isEmptyDocPlaceholder,
  onFocus,
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
}: Props) {
  const handlersFor = (setText: (t: string) => void): TextHandlers => ({
    onTextChange: setText,
    onSlashProbe: (t, el) => onSlashProbe(block.id, t, el),
    onKeyDown: (e) => {
      const target = e.currentTarget;
      onKeyDownText(e, block, target);
    },
    onFocus,
    onPaste: (data) => onPasteFromClipboard(block.id, data),
  });

  switch (block.type) {
    case "paragraph":
      return (
        <EditableText
          blockId={block.id}
          text={block.content.text}
          editable={editable}
          placeholder={isEmptyDocPlaceholder ? "Nhấn '/' để bắt đầu..." : undefined}
          className="text-base leading-relaxed text-slate-800"
          handlers={handlersFor((t) => onTextChange(block.id, t))}
        />
      );

    case "heading": {
      const L = block.content.level;
      const size = L === 1 ? "text-3xl font-bold" : L === 2 ? "text-2xl font-semibold" : "text-xl font-semibold";
      return (
        <EditableText
          blockId={block.id}
          text={block.content.text}
          editable={editable}
          placeholder={`Tiêu đề ${L}`}
          className={cn("tracking-tight text-slate-900", size)}
          handlers={handlersFor((t) => onHeadingChange(block.id, t))}
        />
      );
    }

    case "bulletList":
    case "numberedList": {
      const Tag = block.type === "bulletList" ? "ul" : "ol";
      const listClass = block.type === "bulletList" ? "list-disc" : "list-decimal";
      return (
        <Tag className={cn("my-1 space-y-1 pl-6", listClass)}>
          {block.content.items.map((item, idx) => (
            <ListRow
              key={item.id}
              item={item}
              editable={editable}
              onFocus={onFocus}
              onTextChange={(t) => {
                const next = block.content.items.map((it, j) =>
                  j === idx && it.type === "paragraph" ? { ...it, content: { text: t } } : it
                );
                onListChange(block.id, next);
              }}
              onKeyDown={(e, el) => onKeyDownList(e, block, idx, el)}
            />
          ))}
        </Tag>
      );
    }

    case "image":
      return (
        <div className="group/img relative my-2 space-y-2">
          {block.content.src ? (
            <img
              src={block.content.src}
              alt={block.content.alt}
              className="max-h-[480px] w-full rounded-xl border border-slate-200 object-contain"
            />
          ) : (
            <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
              Chưa có ảnh
            </div>
          )}
          {editable ? (
            <>
              <Input
                value={block.content.caption || ""}
                placeholder="Chú thích ảnh (tuỳ chọn)"
                className="h-9 text-sm"
                onChange={(e) => onImageCaptionChange(block.id, e.target.value)}
              />
              <div className="flex gap-2 opacity-0 transition-opacity group-hover/img:opacity-100">
                <button
                  type="button"
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => onImageReplace(block.id)}
                >
                  Thay ảnh
                </button>
                <button
                  type="button"
                  className="rounded-md border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                  onClick={() => onImageRemove(block.id)}
                >
                  Gỡ
                </button>
              </div>
            </>
          ) : block.content.caption ? (
            <p className="text-center text-sm text-slate-600">{block.content.caption}</p>
          ) : null}
        </div>
      );

    default:
      return null;
  }
}
