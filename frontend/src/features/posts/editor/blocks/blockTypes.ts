export const BLOCK_TYPES = {
  paragraph: "paragraph",
  heading: "heading",
  bulletList: "bulletList",
  numberedList: "numberedList",
  image: "image",
} as const;

export type BlockType = (typeof BLOCK_TYPES)[keyof typeof BLOCK_TYPES];

/** Shared shape for nesting / future composite blocks */
export type BlockBase = {
  id: string;
  /** Reserved for nested structures (e.g. nested lists) — not used in HTML round-trip yet */
  children?: Block[];
};

export type ParagraphContent = { text: string };
export type HeadingContent = { level: 1 | 2 | 3; text: string };
/** Each item is a full block (typically `paragraph`) for future rich list items */
export type ListContent = { items: Block[] };
export type ImageContent = { src: string; alt: string; caption?: string };

export type BlockContentMap = {
  paragraph: ParagraphContent;
  heading: HeadingContent;
  bulletList: ListContent;
  numberedList: ListContent;
  image: ImageContent;
};

export type Block = BlockBase & {
  [K in BlockType]: { type: K; content: BlockContentMap[K] };
}[BlockType];

export type BlockDocument = {
  version: 1;
  blocks: Block[];
};

export function createId(): string {
  return crypto.randomUUID();
}

export function emptyParagraph(): Block {
  return { id: createId(), type: "paragraph", content: { text: "" } };
}

export function emptyHeading(level: 1 | 2 | 3): Block {
  return { id: createId(), type: "heading", content: { level, text: "" } };
}

export function emptyBulletList(): Block {
  return {
    id: createId(),
    type: "bulletList",
    content: { items: [{ id: createId(), type: "paragraph", content: { text: "" } }] },
  };
}

export function emptyNumberedList(): Block {
  return {
    id: createId(),
    type: "numberedList",
    content: { items: [{ id: createId(), type: "paragraph", content: { text: "" } }] },
  };
}

export function imageBlock(src: string, alt = "", caption?: string): Block {
  return { id: createId(), type: "image", content: { src, alt, caption } };
}

export type SlashCommandId = "paragraph" | "h1" | "h2" | "h3" | "bulletList" | "numberedList" | "image";

export type SlashCommand = {
  id: SlashCommandId;
  label: string;
  keywords: string[];
};

export const SLASH_COMMANDS: SlashCommand[] = [
  { id: "paragraph", label: "Đoạn văn", keywords: ["paragraph", "text", "p"] },
  { id: "h1", label: "Tiêu đề 1", keywords: ["h1", "heading", "title"] },
  { id: "h2", label: "Tiêu đề 2", keywords: ["h2"] },
  { id: "h3", label: "Tiêu đề 3", keywords: ["h3"] },
  { id: "bulletList", label: "Danh sách bullet", keywords: ["list", "bullet", "ul"] },
  { id: "numberedList", label: "Danh sách số", keywords: ["numbered", "ol", "order"] },
  { id: "image", label: "Ảnh", keywords: ["image", "img", "photo"] },
];
