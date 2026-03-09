import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://ai-check.ezoai.jp";
  const now = "2026-03-10T00:00:00.000Z";

  return [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/check`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/check/compare`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/generate/llms-txt`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/generate/robots-txt`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/generate/json-ld`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/generate/agent-json`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/generate/badge`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guides/geo`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guides/geo-vs-seo`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guides/llms-txt`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guides/glossary`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/guides/checklist`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guides/industry`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guides/quick-start`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/developers`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/tools`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    // チェック項目別ページ
    { url: `${baseUrl}/check/robots-txt`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/check/llms-txt`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/check/structured-data`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/check/meta-tags`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/check/content-structure`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/check/ssr`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/check/sitemap`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    // 業界別ページ
    { url: `${baseUrl}/for/ec`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/for/saas`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/for/media`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/for/professional`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/for/local`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/for/education`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];
}
