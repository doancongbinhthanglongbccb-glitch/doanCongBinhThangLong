/**
 * Dot-path read for site config objects, e.g. `home.mainFeedTitle`.
 */
export function getByPath(source: unknown, path: string): unknown {
  const parts = path.split(".").filter(Boolean);
  let current: unknown = source;
  for (const segment of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}
