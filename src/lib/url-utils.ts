/**
 * Normalize a URL by trimming whitespace and adding https:// if no protocol is specified.
 */
export function normalizeUrl(url: string): string {
  let normalized = url.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = "https://" + normalized;
  }
  return normalized;
}
