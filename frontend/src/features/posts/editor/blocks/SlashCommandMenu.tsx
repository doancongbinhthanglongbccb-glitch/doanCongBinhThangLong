import { useEffect, useMemo, useRef, useState } from "react";
import { SLASH_COMMANDS, type SlashCommandId } from "./blockTypes";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  anchorRect: DOMRect | null;
  filter: string;
  onSelect: (id: SlashCommandId) => void;
  onClose: () => void;
};

export default function SlashCommandMenu({ open, anchorRect, filter, onSelect, onClose }: Props) {
  const listRef = useRef<HTMLDivElement>(null);
  const [highlight, setHighlight] = useState(0);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return SLASH_COMMANDS;
    return SLASH_COMMANDS.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.keywords.some((k) => k.includes(q) || q.includes(k)) ||
        c.id.toLowerCase().includes(q)
    );
  }, [filter]);

  useEffect(() => {
    setHighlight(0);
  }, [filter, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, Math.max(0, filtered.length - 1)));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
        return;
      }
      if (e.key === "Enter" && filtered[highlight]) {
        e.preventDefault();
        onSelect(filtered[highlight].id);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, filtered, highlight, onSelect, onClose]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-idx="${highlight}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [highlight, open]);

  if (!open || !anchorRect) return null;

  const top = anchorRect.bottom + window.scrollY + 4;
  const left = anchorRect.left + window.scrollX;

  return (
    <div
      className="fixed z-[100] max-h-64 w-64 overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
      style={{ top, left }}
      role="listbox"
      aria-label="Lệnh slash"
    >
      {filtered.length === 0 ? (
        <div className="px-3 py-2 text-sm text-slate-500">Không có lệnh phù hợp</div>
      ) : (
        filtered.map((cmd, idx) => (
          <button
            key={cmd.id}
            type="button"
            data-idx={idx}
            role="option"
            aria-selected={idx === highlight}
            className={cn(
              "flex w-full items-center px-3 py-2 text-left text-sm transition-colors",
              idx === highlight ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"
            )}
            onMouseEnter={() => setHighlight(idx)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(cmd.id)}
          >
            <span className="font-medium">{cmd.label}</span>
            <span className="ml-auto text-xs text-slate-400">/{cmd.keywords[0]}</span>
          </button>
        ))
      )}
    </div>
  );
}
