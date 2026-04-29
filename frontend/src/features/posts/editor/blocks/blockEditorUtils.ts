/** Match a slash command at end of text (after start, newline, or space). */
export function parseSlashState(text: string): { open: boolean; query: string } {
  const lines = text.split("\n");
  const line = lines[lines.length - 1] ?? "";
  if (!line.includes("/")) return { open: false, query: "" };
  const slashIdx = line.lastIndexOf("/");
  const before = slashIdx === 0 ? "" : line[slashIdx - 1];
  if (slashIdx > 0 && before !== " " && before !== "\t") return { open: false, query: "" };
  const after = line.slice(slashIdx + 1);
  if (after.includes(" ") || after.includes("\n")) return { open: false, query: "" };
  return { open: true, query: after };
}

export function stripSlashFromText(text: string): string {
  const lines = text.split("\n");
  const last = lines.length - 1;
  const line = lines[last] ?? "";
  const slashIdx = line.lastIndexOf("/");
  if (slashIdx < 0) return text;
  const before = slashIdx === 0 ? "" : line[slashIdx - 1];
  if (slashIdx > 0 && before !== " " && before !== "\t") return text;
  const newLine = line.slice(0, slashIdx).replace(/\s+$/, "");
  lines[last] = newLine;
  return lines.join("\n").replace(/\n+$/, "");
}

export function getCaretRect(): DOMRect | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0).cloneRange();
  range.collapse(true);
  const rects = range.getClientRects();
  if (rects.length > 0) return rects[0] ?? null;
  const marker = document.createElement("span");
  marker.textContent = "\u200b";
  range.insertNode(marker);
  const r = marker.getBoundingClientRect();
  marker.remove();
  return r;
}

export function isCaretAtStart(el: HTMLElement): boolean {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return true;
  const range = sel.getRangeAt(0);
  if (!el.contains(range.startContainer)) return false;
  const pre = range.cloneRange();
  pre.selectNodeContents(el);
  pre.setEnd(range.startContainer, range.startOffset);
  return pre.toString().length === 0;
}

export function isCaretAtEnd(el: HTMLElement): boolean {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return true;
  const range = sel.getRangeAt(0);
  if (!el.contains(range.endContainer)) return false;
  const post = range.cloneRange();
  post.selectNodeContents(el);
  post.setStart(range.endContainer, range.endOffset);
  return post.toString().length === 0;
}
