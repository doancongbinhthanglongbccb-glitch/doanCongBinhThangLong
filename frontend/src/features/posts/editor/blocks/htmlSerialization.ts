import type { Block } from "./blockTypes";
import { BLOCK_TYPES, createId, emptyParagraph, imageBlock } from "./blockTypes";
import { listItemParagraph, migrateBlocks } from "./blockTreeUtils";
import { sanitizeBlocks } from "./sanitizeBlocks";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderInlineMarkers(rawText: string): string {
  const escaped = escapeHtml(rawText);
  const withBold = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  return withBold.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (full, label, url) => {
    // Minimal safe-link policy: only allow http(s) and mailto
    if (!/^(https?:\/\/|mailto:)/i.test(String(url))) return full;
    return `<a href="${url}" target="_blank" rel="noreferrer">${label}</a>`;
  });
}

function listItemToHtml(item: Block): string {
  if (item.type === "paragraph") {
    const txt = renderInlineMarkers(item.content.text);
    return `<li>${txt.replace(/\n/g, "<br>")}</li>`;
  }
  return `<li></li>`;
}

/** Serialize blocks to HTML fragment (same shape as before + optional figure for captioned images). */
export function blocksToHtml(blocks: Block[]): string {
  if (!blocks.length) return "<p></p>";

  const parts: string[] = [];

  for (const b of blocks) {
    switch (b.type) {
      case BLOCK_TYPES.paragraph:
        parts.push(`<p>${renderInlineMarkers(b.content.text).replace(/\n/g, "<br>")}</p>`);
        break;
      case BLOCK_TYPES.heading: {
        const L = b.content.level;
        parts.push(`<h${L}>${renderInlineMarkers(b.content.text)}</h${L}>`);
        break;
      }
      case BLOCK_TYPES.bulletList: {
        const lis = b.content.items.map(listItemToHtml).join("");
        parts.push(`<ul>${lis}</ul>`);
        break;
      }
      case BLOCK_TYPES.numberedList: {
        const lis = b.content.items.map(listItemToHtml).join("");
        parts.push(`<ol>${lis}</ol>`);
        break;
      }
      case BLOCK_TYPES.image: {
        const alt = escapeHtml(b.content.alt || "image");
        const src = b.content.src.replace(/"/g, "&quot;");
        const cap = b.content.caption?.trim();
        if (cap) {
          parts.push(
            `<figure><img src="${src}" alt="${alt}"><figcaption>${renderInlineMarkers(cap)}</figcaption></figure>`
          );
        } else {
          parts.push(`<img src="${src}" alt="${alt}">`);
        }
        break;
      }
      default:
        break;
    }
  }

  return parts.join("");
}

function richTextToMarkers(root: Node): string {
  if (root.nodeType === Node.TEXT_NODE) {
    return root.textContent || "";
  }
  if (root.nodeType === Node.ELEMENT_NODE) {
    const el = root as HTMLElement;
    const tag = el.tagName.toLowerCase();
    if (tag === "br") return "\n";
    if (tag === "strong") {
      const inner = Array.from(el.childNodes).map((n) => richTextToMarkers(n)).join("");
      return `**${inner}**`;
    }
    if (tag === "a") {
      const label = Array.from(el.childNodes).map((n) => richTextToMarkers(n)).join("");
      const href = (el as HTMLAnchorElement).getAttribute("href") || "";
      return `[${label}](${href})`;
    }
    return Array.from(el.childNodes).map((n) => richTextToMarkers(n)).join("");
  }
  return Array.from(root.childNodes).map((n) => richTextToMarkers(n)).join("");
}

function textFromNodes(el: Element): string {
  return richTextToMarkers(el).trimEnd();
}

/** Parse saved HTML back into blocks (best-effort). */
export function htmlToBlocks(html: string): Block[] {
  const raw = (html || "").trim();
  if (!raw) return [emptyParagraph()];

  const wrapped = raw.startsWith("<") ? raw : `<p>${escapeHtml(raw)}</p>`;
  const doc = new DOMParser().parseFromString(`<div id="block-root">${wrapped}</div>`, "text/html");
  const root = doc.getElementById("block-root");
  if (!root) return [emptyParagraph()];

  const out: Block[] = [];

  const visit = (el: Element) => {
    const tag = el.tagName.toLowerCase();

    if (tag === "p") {
      const text = textFromNodes(el);
      out.push({ id: createId(), type: "paragraph", content: { text } });
      return;
    }

    if (tag === "h1" || tag === "h2" || tag === "h3") {
      const level = Number(tag[1]) as 1 | 2 | 3;
      out.push({ id: createId(), type: "heading", content: { level, text: textFromNodes(el).trim() || "" } });
      return;
    }

    if (tag === "ul") {
      const items = Array.from(el.querySelectorAll(":scope > li")).map((li) =>
        listItemParagraph(textFromNodes(li))
      );
      out.push({
        id: createId(),
        type: "bulletList",
        content: { items: items.length ? items : [listItemParagraph("")] },
      });
      return;
    }

    if (tag === "ol") {
      const items = Array.from(el.querySelectorAll(":scope > li")).map((li) =>
        listItemParagraph(textFromNodes(li))
      );
      out.push({
        id: createId(),
        type: "numberedList",
        content: { items: items.length ? items : [listItemParagraph("")] },
      });
      return;
    }

    if (tag === "figure") {
      const img = el.querySelector("img");
      if (img) {
        const src = img.getAttribute("src") || "";
        const alt = img.getAttribute("alt") || "";
        const capEl = el.querySelector("figcaption");
        const cap = capEl ? textFromNodes(capEl as Element).trim() : "";
        if (src) out.push({ id: createId(), type: "image", content: { src, alt, caption: cap || undefined } });
      }
      return;
    }

    if (tag === "img") {
      const src = el.getAttribute("src") || "";
      const alt = el.getAttribute("alt") || "";
      if (src) out.push(imageBlock(src, alt));
      return;
    }

    if (tag === "div") {
      Array.from(el.children).forEach((c) => visit(c as Element));
      return;
    }
  };

  const children = Array.from(root.children);
  if (children.length === 0) {
    out.push(emptyParagraph());
  } else {
    children.forEach((c) => visit(c as Element));
  }

  const merged = out.length ? out : [emptyParagraph()];
  return sanitizeBlocks(migrateBlocks(merged));
}
