/** Strip HTML and detect empty editor output (TipTap default empty doc). */
export function isEditorHtmlEmpty(html: string): boolean {
  const trimmed = (html || "").trim();
  if (!trimmed) return true;
  const noTags = trimmed.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
  if (!noTags) return true;
  const emptyParagraphs = /^(\s*<p>\s*<\/p>\s*)+$/i;
  return emptyParagraphs.test(trimmed);
}

export const EXCERPT_MAX_LENGTH = 500;
