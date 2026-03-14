# Changelog

## 2026-03-15

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
