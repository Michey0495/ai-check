// SSRF protection and rate limiting

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_ENTRIES = 10_000;

export function checkRateLimit(ip: string, cost = 1): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();

  if (rateLimitMap.size > RATE_LIMIT_MAX_ENTRIES) {
    for (const [key, val] of rateLimitMap) {
      if (now > val.resetAt) rateLimitMap.delete(key);
    }
  }

  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    const resetAt = now + RATE_WINDOW_MS;
    if (cost > RATE_LIMIT) {
      rateLimitMap.set(ip, { count: RATE_LIMIT, resetAt });
      return { allowed: false, remaining: 0, resetAt };
    }
    rateLimitMap.set(ip, { count: cost, resetAt });
    return { allowed: true, remaining: RATE_LIMIT - cost, resetAt };
  }
  if (entry.count + cost > RATE_LIMIT) {
    return { allowed: false, remaining: Math.max(0, RATE_LIMIT - entry.count), resetAt: entry.resetAt };
  }
  entry.count += cost;
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
  if (parts.length !== 4 || parts.some((p) => p < 0 || p > 255 || !Number.isInteger(p))) return false;
  const [a, b] = parts;
  if (a === 10) return true;                          // 10.0.0.0/8
  if (a === 172 && b >= 16 && b <= 31) return true;   // 172.16.0.0/12
  if (a === 192 && b === 168) return true;             // 192.168.0.0/16
  if (a === 169 && b === 254) return true;             // 169.254.0.0/16
  if (a === 0 || a === 127) return true;               // 0.0.0.0/8, 127.0.0.0/8
  if (a >= 224) return true;                           // 224.0.0.0+ (multicast & reserved)
  if (a === 100 && b >= 64 && b <= 127) return true;   // 100.64.0.0/10 (CGNAT)
  if (a === 192 && b === 0 && parts[2] === 0) return true; // 192.0.0.0/24
  if (a === 198 && (b === 18 || b === 19)) return true; // 198.18.0.0/15 (benchmarking)
  return false;
}
