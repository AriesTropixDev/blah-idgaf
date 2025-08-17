import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/disclaimer"],
      disallow: ["/api/"],
    },
    sitemap: "https://fisher.voyage/sitemap.xml",
  }
}
