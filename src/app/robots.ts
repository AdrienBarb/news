import { MetadataRoute } from "next";
import { siteMetadata } from "@/data/siteMetadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/blog", "/blog/*"],
        disallow: [
          "/api/",
          "/d/",
          "/signup",
          "/reset-password",
          "/privacy",
          "/terms",
        ],
      },
    ],
    sitemap: `${siteMetadata.siteUrl}/sitemap.xml`,
  };
}
