export const slugify = (input: string): string => {
  const raw = String(input || "").trim().toLowerCase();
  if (!raw) return "";

  // Minimal Vietnamese-friendly slugify: remove accents, keep alnum, collapse dashes.
  const normalized = raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

  return normalized
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
};

