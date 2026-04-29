/** Parse a date string for sorting CMS items by recency. Returns 0 if missing or invalid. */
export function parseContentTime(value?: string): number {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}
