import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://ai-check.ezoai.jp";
  const now = new Date().toISOString();

  return [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/check`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/check/compare`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/generate/llms-txt`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/generate/robots-txt`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/generate/json-ld`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/generate/agent-json`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/guides/geo`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guides/geo-vs-seo`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guides/llms-txt`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guides/glossary`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/guides/checklist`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guides/industry`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/developers`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}
