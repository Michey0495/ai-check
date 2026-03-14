# Changelog

## 2026-03-15

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
