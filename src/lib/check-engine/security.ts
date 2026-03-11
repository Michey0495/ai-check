// SSRF protection and rate limiting

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_ENTRIES = 10_000;

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();

  if (rateLimitMap.size > RATE_LIMIT_MAX_ENTRIES) {
    for (const [key, val] of rateLimitMap) {
      if (now > val.resetAt) rateLimitMap.delete(key);
    }
  }

  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    const resetAt = now + RATE_WINDOW_MS;
    rateLimitMap.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: RATE_LIMIT - 1, resetAt };
  }
  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT - entry.count, resetAt: entry.resetAt };
}

export { RATE_LIMIT };

export function isPrivateHostname(hostname: string): boolean {
  const h = hostname.replace(/^\[|\]$/g, "");
  if (h === "localhost" || h === "127.0.0.1" || h === "::1" || h === "0.0.0.0") return true;
  if (h.endsWith(".local") || h.endsWith(".internal")) return true;
  if (h.startsWith("fe80:") || h.startsWith("fc00:") || h.startsWith("fd00:")) return true;
  const v4Mapped = h.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (v4Mapped) return isPrivateIPv4(v4Mapped[1]);
  const parts = h.split(".");
  if (parts.length === 4 && parts.every((p) => /^\d+$/.test(p))) {
    return isPrivateIPv4(h);
  }
  return false;
}

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4) return false;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true;
  if (a === 0 || a === 127) return true;
  return false;
}
