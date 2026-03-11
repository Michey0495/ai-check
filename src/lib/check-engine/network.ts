// Network utilities: fetch, redirect chain, SSL, HTTP version, DNS

import * as dns from "dns";
import * as https from "https";
import * as tls from "tls";
import { isPrivateHostname } from "./security";

export type FetchResult = { ok: boolean; text: string; headers?: Record<string, string> };

export async function safeFetch(url: string, timeoutMs = 10000, returnHeaders = false): Promise<FetchResult> {
  try {
    const parsed = new URL(url);
    if (isPrivateHostname(parsed.hostname)) return { ok: false, text: "" };
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      redirect: "follow",
      headers: { "User-Agent": "AI-Check-Bot/1.0" },
    });
    if (!res.ok) return { ok: false, text: "" };
    const reader = res.body?.getReader();
    if (!reader) return { ok: false, text: "" };
    const chunks: Uint8Array<ArrayBuffer>[] = [];
    let totalSize = 0;
    const MAX_BODY_SIZE = 5 * 1024 * 1024;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalSize += value.byteLength;
      if (totalSize > MAX_BODY_SIZE) {
        reader.cancel();
        return { ok: false, text: "" };
      }
      chunks.push(value);
    }
    const merged = chunks.length === 1
      ? chunks[0]
      : new Uint8Array(await new Blob(chunks).arrayBuffer());
    const text = new TextDecoder().decode(merged);
    const result: FetchResult = { ok: true, text };
    if (returnHeaders) {
      const hdrs: Record<string, string> = {};
      res.headers.forEach((v, k) => { hdrs[k.toLowerCase()] = v; });
      result.headers = hdrs;
    }
    return result;
  } catch {
    return { ok: false, text: "" };
  }
}

export type RedirectInfo = {
  hops: number;
  finalUrl: string;
  hasHttpToHttps: boolean;
  hasWwwRedirect: boolean;
  chain: string[];
  statusCodes: number[];
};

export async function detectRedirectChain(url: string, maxHops = 5): Promise<RedirectInfo> {
  const chain: string[] = [url];
  const statusCodes: number[] = [];
  let currentUrl = url;
  let hasHttpToHttps = false;
  let hasWwwRedirect = false;

  for (let i = 0; i < maxHops; i++) {
    try {
      const parsed = new URL(currentUrl);
      if (isPrivateHostname(parsed.hostname)) break;
      const res = await fetch(currentUrl, {
        method: "HEAD",
        redirect: "manual",
        signal: AbortSignal.timeout(5000),
        headers: { "User-Agent": "AI-Check-Bot/1.0" },
      });
      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        if (!location) break;
        statusCodes.push(res.status);
        const nextUrl = location.startsWith("http") ? location : new URL(location, currentUrl).toString();
        chain.push(nextUrl);
        if (currentUrl.startsWith("http://") && nextUrl.startsWith("https://")) {
          hasHttpToHttps = true;
        }
        const curHost = new URL(currentUrl).hostname;
        const nextHost = new URL(nextUrl).hostname;
        if (
          (curHost.startsWith("www.") && !nextHost.startsWith("www.") && curHost.slice(4) === nextHost) ||
          (!curHost.startsWith("www.") && nextHost.startsWith("www.") && "www." + curHost === nextHost)
        ) {
          hasWwwRedirect = true;
        }
        currentUrl = nextUrl;
      } else {
        break;
      }
    } catch {
      break;
    }
  }

  return { hops: chain.length - 1, finalUrl: currentUrl, hasHttpToHttps, hasWwwRedirect, chain, statusCodes };
}

export type SslCertInfo = {
  issuer: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  protocol: string;
  subjectAltNames?: string[];
};

export async function detectSslCertificate(hostname: string): Promise<SslCertInfo | undefined> {
  if (isPrivateHostname(hostname)) return undefined;
  return new Promise((resolve) => {
    const socket = tls.connect(
      { host: hostname, port: 443, servername: hostname, timeout: 5000 },
      () => {
        try {
          const cert = socket.getPeerCertificate();
          const protocol = socket.getProtocol() ?? "unknown";
          if (!cert || !cert.valid_from) {
            socket.destroy();
            resolve(undefined);
            return;
          }
          const validFrom = new Date(cert.valid_from).toISOString();
          const validTo = new Date(cert.valid_to).toISOString();
          const daysRemaining = Math.floor(
            (new Date(cert.valid_to).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          const rawIssuer = cert.issuer?.O ?? cert.issuer?.CN ?? "unknown";
          const issuerOrg = Array.isArray(rawIssuer) ? rawIssuer[0] : rawIssuer;
          const sanStr = cert.subjectaltname ?? "";
          const subjectAltNames = sanStr
            ? sanStr.split(",").map((s: string) => s.trim().replace("DNS:", "")).filter(Boolean).slice(0, 10)
            : undefined;
          socket.destroy();
          resolve({ issuer: issuerOrg, validFrom, validTo, daysRemaining, protocol, subjectAltNames });
        } catch {
          socket.destroy();
          resolve(undefined);
        }
      }
    );
    socket.on("error", () => { socket.destroy(); resolve(undefined); });
    socket.on("timeout", () => { socket.destroy(); resolve(undefined); });
  });
}

export async function detectHttpVersion(url: string): Promise<string | undefined> {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return "HTTP/1.1";
    if (isPrivateHostname(parsed.hostname)) return undefined;
    return new Promise((resolve) => {
      const req = https.request(
        { hostname: parsed.hostname, port: 443, path: parsed.pathname, method: "HEAD", timeout: 5000 },
        (res) => {
          const version = res.httpVersion ? `HTTP/${res.httpVersion}` : undefined;
          res.destroy();
          resolve(version);
        }
      );
      req.on("error", () => resolve(undefined));
      req.on("timeout", () => { req.destroy(); resolve(undefined); });
      req.end();
    });
  } catch {
    return undefined;
  }
}

export async function measureDnsResolution(hostname: string): Promise<number | undefined> {
  if (isPrivateHostname(hostname)) return undefined;
  try {
    const start = Date.now();
    await Promise.race([
      dns.promises.resolve(hostname),
      new Promise((_, reject) => setTimeout(() => reject(new Error("DNS timeout")), 5000)),
    ]);
    return Date.now() - start;
  } catch {
    return undefined;
  }
}
