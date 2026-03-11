import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://ai-check.ezoai.jp";

  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "Amazonbot", allow: "/" },
      { userAgent: "cohere-ai", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
      { userAgent: "Bytespider", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
      { userAgent: "Diffbot", allow: "/" },
      { userAgent: "Meta-ExternalAgent", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
