export interface CheckIndicator {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  weight: number;
}

export const CHECK_INDICATORS: CheckIndicator[] = [
  {
    id: "robots-txt",
    name: "AIクローラーアクセス",
    nameEn: "AI Crawler Accessibility",
    description: "robots.txtでAIクローラー（GPTBot, ClaudeBot等）を許可しているか",
    weight: 15,
  },
  {
    id: "llms-txt",
    name: "llms.txt",
    nameEn: "llms.txt Presence",
    description: "AI向けサイト説明ファイル（llms.txt）が存在するか",
    weight: 15,
  },
  {
    id: "structured-data",
    name: "構造化データ",
    nameEn: "Schema & Structured Data",
    description: "JSON-LD構造化データが適切に設置されているか",
    weight: 20,
  },
  {
    id: "meta-tags",
    name: "メタタグ & 鮮度",
    nameEn: "Meta Tags & Freshness",
    description: "title, description, OGP等のメタタグが適切か",
    weight: 15,
  },
  {
    id: "content-structure",
    name: "コンテンツ構造",
    nameEn: "Content Structure",
    description: "セマンティックHTML（h1-h6, article, section等）を正しく使用しているか",
    weight: 15,
  },
  {
    id: "ssr",
    name: "サーバーサイドレンダリング",
    nameEn: "Server-Side Rendering",
    description: "コンテンツがサーバーサイドでレンダリングされ、AIクローラーが読み取れるか",
    weight: 10,
  },
  {
    id: "sitemap",
    name: "サイトマップ品質",
    nameEn: "Sitemap Quality",
    description: "sitemap.xmlが存在し、適切に構成されているか",
    weight: 10,
  },
];

export const GENERATOR_TYPES = [
  {
    id: "llms-txt",
    name: "llms.txt",
    description: "AI向けサイト説明ファイルを生成",
    path: "/generate/llms-txt",
  },
  {
    id: "robots-txt",
    name: "robots.txt",
    description: "AIクローラー対応のrobots.txtを生成",
    path: "/generate/robots-txt",
  },
  {
    id: "json-ld",
    name: "JSON-LD",
    description: "Schema.org準拠の構造化データを生成",
    path: "/generate/json-ld",
  },
  {
    id: "agent-json",
    name: "agent.json",
    description: "A2A Agent Card（AIエージェント名刺）を生成",
    path: "/generate/agent-json",
  },
  {
    id: "badge",
    name: "GEOスコアバッジ",
    description: "READMEやサイトに埋め込めるスコアバッジを生成",
    path: "/generate/badge",
  },
] as const;

export type CheckResult = {
  id: string;
  score: number;
  maxScore: number;
  status: "pass" | "warn" | "fail";
  message: string;
  details?: string;
  code?: string;
};

export type CheckReport = {
  url: string;
  totalScore: number;
  maxScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
  results: CheckResult[];
  checkedAt: string;
  responseTimeMs?: number;
  ogImage?: string;
  siteTitle?: string;
  favicon?: string;
  htmlSizeKB?: number;
  isHttps?: boolean;
  internalLinkCount?: number;
  externalLinkCount?: number;
  suggestedSchemas?: string[];
  accessibility?: {
    imgCount: number;
    imgWithAlt: number;
    hasSkipNav: boolean;
    ariaLandmarks: number;
    hasAriaLabels: boolean;
  };
  securityHeaders?: {
    hasHsts: boolean;
    hasCsp: boolean;
    hasXFrameOptions: boolean;
    hasXContentTypeOptions: boolean;
    hasReferrerPolicy: boolean;
    score: number; // 0-5
  };
  performanceHints?: {
    preconnectCount: number;
    prefetchCount: number;
    lazyImageCount: number;
    totalImageCount: number;
    hasFontDisplay: boolean;
    hasModuleScripts: boolean;
    deferScriptCount: number;
    asyncScriptCount: number;
    totalScriptCount: number;
  };
  contentLanguage?: string;
  hreflangTags?: string[];
  detectedTech?: string[];
  ogImageAccessible?: boolean;
  pwaManifest?: {
    exists: boolean;
    hasName: boolean;
    hasIcons: boolean;
    hasStartUrl: boolean;
    hasDisplay: boolean;
    hasThemeColor: boolean;
  };
  socialMeta?: {
    twitterSite?: string;
    twitterCreator?: string;
    fbAppId?: string;
    ogSiteName?: string;
  };
  redirectChain?: {
    hops: number;
    finalUrl: string;
    hasHttpToHttps: boolean;
    hasWwwRedirect: boolean;
    chain: string[];
  };
  canonicalUrl?: string;
  canonicalMismatch?: boolean;
  contentEncoding?: string;
  serverHeader?: string;
  coreWebVitals?: {
    lcpCandidate?: string; // e.g. "img", "h1", "video"
    lcpImageCount: number; // above-fold large images without explicit dimensions
    clsRiskFactors: string[]; // e.g. "images without dimensions", "dynamic content injection"
    renderBlockingCount: number; // render-blocking CSS/JS
    inlineCssSize: number; // bytes of inline <style>
    hasViewportMeta: boolean;
    hasFetchPriority: boolean; // fetchpriority="high" on LCP image
  };
};

export function getGrade(score: number, maxScore: number): CheckReport["grade"] {
  if (maxScore === 0) return "F";
  const pct = (score / maxScore) * 100;
  if (pct >= 90) return "A";
  if (pct >= 75) return "B";
  if (pct >= 60) return "C";
  if (pct >= 40) return "D";
  return "F";
}
