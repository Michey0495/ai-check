# Changelog

## 2026-03-17

### Maintenance (19th pass)

- **fix**: Removed static `public/robots.txt` (recurring issue — wrong domain `web-url-a.ezoai.jp`, overrides dynamic `src/app/robots.ts` with correct `ai-check.ezoai.jp` and 15 crawlers)
- **fix**: Added `public/robots.txt` to `.gitignore` to permanently prevent this recurring issue (dynamic route is authoritative)
- **check**: Build passes, TypeScript clean, 0 npm vulnerabilities, no open GitHub issues
- **check**: AI public files verified (robots.ts dynamic route, llms.txt, agent.json all valid)
- **check**: No safe dependency updates available (eslint 9→10, @types/node 20→25 are major — skipped)

### Maintenance (18th pass)

- **fix**: Removed static `public/robots.txt` (7 crawlers) that was overriding dynamic `src/app/robots.ts` (15 crawlers including Diffbot, Meta-ExternalAgent, OAI-SearchBot, GoogleOther, Twitterbot)
- **chore**: Updated `shadcn` 4.0.7 → 4.0.8
- **check**: Build passes, TypeScript clean, 0 npm vulnerabilities, no open GitHub issues
- **check**: AI public files verified (robots.ts dynamic route, llms.txt, agent.json all valid)

### Maintenance (17th pass)

- **fix**: Converted 8 remaining hardcoded `dateModified` values in page-level JSON-LD to dynamic `new Date().toISOString().split("T")[0]` (guides/geo, geo-vs-seo, glossary, quick-start, checklist, industry + check/[indicator] + for/[industry])
- **chore**: Updated `agent.json` dateUpdated to 2026-03-17
- **check**: Build passes, TypeScript clean, ESLint clean, 0 npm vulnerabilities
- **check**: No open GitHub issues
- **check**: AI public files verified (robots.ts dynamic route, llms.txt, agent.json all present and valid)
- **check**: No safe dependency updates available (eslint 9→10, @types/node 20→25 are major — skipped)
- **note**: DNS for `ai-check.ezoai.jp` still needs CNAME → `cname.vercel-dns.com` at Xserver
- **deployed**: Vercel production deploy successful (`web-url-a.ezoai.jp`)

## 2026-03-16

### Maintenance (16th pass)

- **fix**: Removed stale `public/robots.txt` again (wrong domain `web-url-a.ezoai.jp`, overrides dynamic `src/app/robots.ts` which uses correct `ai-check.ezoai.jp`)
- **check**: Build passes, TypeScript clean, ESLint clean, 0 npm vulnerabilities
- **check**: No open GitHub issues
- **check**: AI public files verified (robots.ts dynamic route, llms.txt, agent.json all valid)
- **check**: No TODO/FIXME/HACK comments, no stale dates, no hardcoded secrets
- **check**: No safe dependency updates available (eslint 9→10, @types/node 20→25 are major — skipped)
- **note**: DNS for `ai-check.ezoai.jp` still needs CNAME → `cname.vercel-dns.com`

### Maintenance (15th pass)

- **fix(a11y)**: Restore keyboard focus to ExportDropdown trigger button on Escape key close
- **check**: Build passes, TypeScript clean, ESLint clean, 0 npm vulnerabilities
- **check**: No open GitHub issues
- **check**: AI public files verified (robots.txt, llms.txt, agent.json all valid and up-to-date)
- **check**: No TODO/FIXME/HACK comments in codebase
- **check**: No safe dependency updates available (eslint 9→10, @types/node 20→25 are major — skipped)
- **note**: DNS for `ai-check.ezoai.jp` still needs CNAME → `cname.vercel-dns.com`

### QA Pass 14 — Security & Robustness

- **fix(security)**: Block TEST-NET reserved IP ranges (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24) in SSRF protection
- **fix(security)**: Block `blob:` and `about:` protocols in favicon URL validation
- **fix(perf)**: Add periodic time-based cleanup to all rate limiters (prevent unbounded memory growth)
- **fix(ux)**: Show clipboard error feedback in CurlCopy component
- **fix(react)**: Clean up FeedbackWidget setTimeout on unmount to prevent React warnings

### Maintenance (14th pass)

- **check**: Build passes, TypeScript clean, ESLint clean, 0 npm vulnerabilities
- **check**: No open GitHub issues
- **check**: AI public files verified (robots.txt, llms.txt, agent.json all valid and up-to-date)
- **check**: No TODO/FIXME/HACK comments in codebase
- **check**: No safe dependency updates available (eslint 9→10, @types/node 20→25 are major — skipped)
- **check**: No hardcoded secrets or API keys in source code
- **check**: Server-side console.error in error boundaries and API catch blocks — acceptable for production logging
- **note**: DNS for `ai-check.ezoai.jp` still needs CNAME → `cname.vercel-dns.com`

### Maintenance (12th pass)

- **check**: Build passes, TypeScript clean, ESLint clean, 0 npm vulnerabilities
- **check**: No open GitHub issues
- **check**: AI public files verified (robots.ts route, llms.txt, agent.json all valid)
- **check**: No TODO/FIXME comments in codebase
- **check**: No safe dependency updates available (eslint 9→10, @types/node 20→25 are major — skipped)
- **note**: DNS for `ai-check.ezoai.jp` / `web-url-a.ezoai.jp` still resolves to Xserver (162.43.104.27). No CNAME records set. Requires CNAME: `ai-check.ezoai.jp → cname.vercel-dns.com` (or `web-url-a.ezoai.jp` depending on desired subdomain)

### Maintenance (11th pass)

- **check**: Build passes, TypeScript clean, ESLint clean, 0 npm vulnerabilities
- **check**: No open GitHub issues
- **check**: AI public files verified (robots.ts route, llms.txt, agent.json all valid)
- **check**: Source code security scan — all API routes clean, SSRF/rate-limiting/input validation intact
- **check**: No safe dependency updates available (eslint 9→10, @types/node 20→25 are major — skipped)
- **note**: DNS for `ai-check.ezoai.jp` still points to Xserver. Requires A record: `ai-check.ezoai.jp → 76.76.21.21`

### Maintenance (10th pass)

- **check**: Build passes, TypeScript clean, 0 npm vulnerabilities
- **check**: No open GitHub issues
- **check**: AI public files verified (robots.ts route, llms.txt, agent.json all valid)
- **update**: shadcn 4.0.7 → 4.0.8 (patch update)
- **note**: eslint 9→10, @types/node 20→25 are major version bumps — skipped per policy
- **note**: DNS CNAME for `ai-check.ezoai.jp` still needs to be pointed to Vercel

## 2026-03-15

### Maintenance (9th pass)

- **check**: Build passes, TypeScript clean, ESLint clean, 0 npm vulnerabilities
- **check**: No open GitHub issues
- **check**: AI public files verified (robots.ts, llms.txt, agent.json all valid)
- **check**: Sitemap complete — all 32 URLs covered
- **check**: All API routes have proper input validation, rate limiting, and error handling
- **check**: No safe dependency updates available (eslint 9→10, @types/node 20→25 are major — skipped)
- **note**: DNS for `*.ezoai.jp` still resolves to Xserver (SSL cert mismatch on all subdomains). Requires CNAME: `web-url-a.ezoai.jp → cname.vercel-dns.com`

### Maintenance (8th pass)

- **check**: Build passes, TypeScript clean, ESLint clean, 0 npm vulnerabilities
- **check**: No open GitHub issues
- **check**: AI public files verified (robots.ts, llms.txt, agent.json all valid)
- **check**: Sitemap complete — all 31 pages covered
- **check**: No safe dependency updates available (eslint 9→10, @types/node 20→25 are major — skipped)
- **note**: DNS for `ai-check.ezoai.jp` still points to Xserver (SSL mismatch). Requires manual A record: `ai-check.ezoai.jp → 76.76.21.21`

### Maintenance (7th pass)

- **check**: Build passes, TypeScript clean, 0 npm vulnerabilities
- **check**: No open GitHub issues
- **check**: AI public files verified (robots.ts, llms.txt, agent.json all valid)
- **check**: No safe dependency updates available (eslint 9→10, @types/node 20→25 are major — skipped)
- **fix**: Made `dateModified` dynamic in 5 page JSON-LD schemas (page.tsx, geo, checklist, glossary, quick-start) — prevents stale dates
- **fix**: Renamed package.json `name` from `web-url-a` to `ai-check` for consistency with actual project name
- **deployed**: Vercel production deploy

### Maintenance (6th pass)

- **check**: Build passes, TypeScript clean, 0 npm vulnerabilities
- **check**: No open GitHub issues
- **check**: AI public files verified (robots.ts, llms.txt, agent.json all valid)
- **check**: No safe dependency updates available (eslint 9→10, @types/node 20→25 are major — skipped)
- **fix**: Removed stale `public/robots.txt` (wrong domain `web-url-a.ezoai.jp`, conflicted with dynamic `src/app/robots.ts`)
- **fix**: Corrected JSON-LD `sameAs` URL from `Michey0495/web-url-a` to `Michey0495/ai-check`
- **fix**: Fixed feedback route `ALLOWED_REPOS` to use `ai-check` repo name (was `web-url-a`, causing GitHub issue creation to fail)
- **fix**: Updated `FeedbackWidget` repoName prop to `ai-check`
- **deployed**: Vercel production deploy

### Maintenance (5th pass)

- **check**: Build passes, TypeScript clean, 0 npm vulnerabilities
- **check**: No open GitHub issues
- **check**: All dependencies at latest minor/patch versions
- **check**: AI public files verified (robots.ts, llms.txt, agent.json all valid)
- **fix**: Added input size limits to MCP API route — array fields capped at 50 items, string fields capped at 500 chars to prevent abuse
- **fix**: Improved TypeScript type narrowing in MCP JSON-LD generator with type predicates
- **deployed**: Vercel production deploy

### Maintenance

- **fix**: Patched npm vulnerabilities (flatted high severity, hono moderate severity) via `npm audit fix`
- **check**: Build passes (`npm run build`) - no errors
- **check**: TypeScript strict mode passes (`tsc --noEmit`) - no errors
- **check**: No open GitHub issues
- **check**: AI public files verified:
  - `public/llms.txt` - complete and up-to-date
  - `public/.well-known/agent.json` - valid JSON, capabilities list current
  - `src/app/robots.ts` - Next.js metadata API, 15 AI crawlers explicitly allowed
- **check**: No stale dates or outdated content found in source code
- **note**: Domain `ai-check.ezoai.jp` DNS resolves to Xserver (162.43.104.27) instead of Vercel. SSL cert generation for Vercel alias failed. DNS CNAME record needs to be configured at Xserver to point to `cname.vercel-dns.com`
- **deployed**: Vercel production deploy successful (`web-url-a.ezoai.jp`)

### Maintenance (2nd pass)

- **check**: Build passes, TypeScript clean, 0 npm vulnerabilities
- **check**: No open GitHub issues
- **update**: Patch dependency updates — react 19.2.3→19.2.4, react-dom 19.2.3→19.2.4, eslint 9.39.3→9.39.4, shadcn 4.0.0→4.0.7
- **fix**: Corrected repository URL in `public/.well-known/agent.json` (web-url-a → ai-check)

### Maintenance (3rd pass)

- **check**: Build passes, TypeScript clean, 0 npm vulnerabilities
- **check**: No open GitHub issues
- **check**: AI public files verified (robots.txt, llms.txt, agent.json all present and valid)
- **check**: No TODO/FIXME/HACK comments in codebase
- **check**: No debug console.log in client code (only appropriate error logging in API routes)
- **update**: Updated `agent.json` dateUpdated to 2026-03-15
- **skip**: @types/node 20→25 and eslint 9→10 are major version bumps (patch/minor only policy)
- **deployed**: Vercel production deploy successful (`web-url-a.ezoai.jp`)

### Maintenance (4th pass)

- **check**: Build passes, TypeScript clean, 0 npm vulnerabilities
- **check**: No open GitHub issues
- **check**: All dependencies at latest minor/patch versions
- **fix**: Removed stale `public/robots.txt` (referenced wrong domain `web-url-a.ezoai.jp`). Dynamic `src/app/robots.ts` (using `ai-check.ezoai.jp`) is the authoritative source
- **check**: AI public files verified (llms.txt, agent.json valid; dynamic robots.ts serves correct robots.txt)
- **check**: Code quality scan — no security issues, no unused imports, accessibility good, no stale dates
