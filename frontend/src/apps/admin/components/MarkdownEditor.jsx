import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MarkdownContent from "@/shared/components/MarkdownContent";

const wrapSelection = (text, start, end, marker) => {
  const selected = text.slice(start, end) || "noi dung";
  return `${text.slice(0, start)}${marker}${selected}${marker}${text.slice(end)}`;
};

const insertAtCursor = (text, start, end, insertion) => `${text.slice(0, start)}${insertion}${text.slice(end)}`;

const applyLinePrefix = (text, start, end, prefix) => {
  const safeStart = Math.max(0, text.lastIndexOf("\n", start - 1) + 1);
  const safeEnd = text.indexOf("\n", end);
  const lineEnd = safeEnd === -1 ? text.length : safeEnd;
  const block = text.slice(safeStart, lineEnd);
  const nextBlock = block
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
  return `${text.slice(0, safeStart)}${nextBlock}${text.slice(lineEnd)}`;
};

const insertHeading = (text, start, end, level) => {
  const selected = text.slice(start, end) || "tieu de";
  return insertAtCursor(text, start, end, `\n${"#".repeat(level)} ${selected}\n`);
};

const MarkdownEditor = ({ value, onChange, label, placeholder = "Nhap noi dung..." }) => {
  const textareaRef = useRef(null);

  const withSelection = (handler) => {
    const input = textareaRef.current;
    if (!input) {
      return;
    }
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const next = handler(value ?? "", start, end);
    onChange(next);
  };

  const insertBold = () => withSelection((text, start, end) => wrapSelection(text, start, end, "**"));

  const insertItalic = () => withSelection((text, start, end) => wrapSelection(text, start, end, "*"));

  const insertHeading1 = () => withSelection((text, start, end) => insertHeading(text, start, end, 1));

  const insertHeading2 = () => withSelection((text, start, end) => insertHeading(text, start, end, 2));

  const insertHeading3 = () => withSelection((text, start, end) => insertHeading(text, start, end, 3));

  const insertBulletList = () => withSelection((text, start, end) => applyLinePrefix(text, start, end, "- "));

  const insertNumberList = () => withSelection((text, start, end) => applyLinePrefix(text, start, end, "1. "));

  const insertLink = () => {
    const href = window.prompt("Nhap link (https://...)");
    if (!href) {
      return;
    }
    withSelection((text, start, end) => {
      const selected = text.slice(start, end) || "mo ta link";
      return insertAtCursor(text, start, end, `[${selected}](${href})`);
    });
  };

  const insertImageFromUrl = () => {
    const url = window.prompt("Nhap URL hinh anh");
    if (!url) {
      return;
    }
    withSelection((text, start, end) => insertAtCursor(text, start, end, `\n![hinh anh](${url})\n`));
  };

  const insertImageFromDevice = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      withSelection((text, start, end) => insertAtCursor(text, start, end, `\n![${file.name}](${dataUrl})\n`));
    };
    reader.readAsDataURL(file);
  };

  const onEditorKeyDown = (event) => {
    if (!event.ctrlKey && !event.metaKey) {
      return;
    }

    const key = event.key.toLowerCase();
    if (key === "b") {
      event.preventDefault();
      insertBold();
      return;
    }
    if (key === "i") {
      event.preventDefault();
      insertItalic();
      return;
    }
    if (key === "k") {
      event.preventDefault();
      insertLink();
    }
  };

  return (
    <div className="space-y-2">
      {label ? <label className="text-sm font-medium">{label}</label> : null}
      <div className="flex flex-wrap gap-2">
        <button type="button" className="border border-slate-300 px-2 py-1 text-xs" title="Ctrl+B" onClick={insertBold}><strong>B</strong></button>
        <button type="button" className="border border-slate-300 px-2 py-1 text-xs italic" title="Ctrl+I" onClick={insertItalic}>I</button>
        <button type="button" className="border border-slate-300 px-2 py-1 text-xs" onClick={insertHeading1}>H1</button>
        <button type="button" className="border border-slate-300 px-2 py-1 text-xs" onClick={insertHeading2}>H2</button>
        <button type="button" className="border border-slate-300 px-2 py-1 text-xs" onClick={insertHeading3}>H3</button>
        <button type="button" className="border border-slate-300 px-2 py-1 text-xs" onClick={insertBulletList}>• List</button>
        <button type="button" className="border border-slate-300 px-2 py-1 text-xs" onClick={insertNumberList}>1. List</button>
        <button type="button" className="border border-slate-300 px-2 py-1 text-xs" title="Ctrl+K" onClick={insertLink}>Link</button>
        <button type="button" className="border border-slate-300 px-2 py-1 text-xs" onClick={insertImageFromUrl}>Image URL</button>
        <label className="cursor-pointer border border-slate-300 px-2 py-1 text-xs">
          Image file
          <Input type="file" accept="image/*" className="hidden" onChange={insertImageFromDevice} />
        </label>
      </div>
      <Textarea
        ref={textareaRef}
        className="min-h-52 rounded-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onEditorKeyDown}
        placeholder={placeholder}
      />
      <div className="border border-slate-200 bg-slate-50 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Xem truoc</p>
        <MarkdownContent value={value} className="prose prose-slate max-w-none text-slate-700" />
      </div>
    </div>
  );
};

export default MarkdownEditor;
