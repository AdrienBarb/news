import { MetadataRoute } from "next";
import { siteMetadata } from "@/data/siteMetadata";
import { client } from "@/lib/sanity/client";
import {
  SITEMAP_POSTS_QUERY,
  SITEMAP_CATEGORIES_QUERY,
  SITEMAP_COMPETITORS_QUERY,
} from "@/lib/sanity/queries";

// Revalidate sitemap every 60 seconds (ISR)
export const revalidate = 60;

const fetchOptions = { next: { revalidate: 60 } };

// Static use cases pages
const useCasesPages = [
  "/use-cases",
  "/use-cases/find-saas-customers-on-reddit",
  "/use-cases/validate-saas-idea-on-reddit",
  "/use-cases/launch-saas-on-reddit",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteMetadata.siteUrl;

  // Fetch dynamic content from Sanity
  const [posts, categories, competitors] = await Promise.all([
    client.fetch<{ slug: string; updatedAt: string }[]>(
      SITEMAP_POSTS_QUERY,
      {},
      fetchOptions
    ),
    client.fetch<{ slug: string }[]>(
      SITEMAP_CATEGORIES_QUERY,
      {},
      fetchOptions
    ),
    client.fetch<{ slug: string; updatedAt: string }[]>(
      SITEMAP_COMPETITORS_QUERY,
      {},
      fetchOptions
    ),
  ]);

  // Landing page
  const landingPage: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  // Use cases pages (static)
  const useCasesSitemap: MetadataRoute.Sitemap = useCasesPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: path === "/use-cases" ? 0.9 : 0.8,
  }));

  // Blog index page
  const blogIndexSitemap: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Blog category pages (dynamic from Sanity)
  const categorySitemap: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/blog/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Blog post pages (dynamic from Sanity)
  const postsSitemap: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Alternatives index page
  const alternativesIndexSitemap: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/alternatives`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Competitor/Alternative pages (dynamic from Sanity)
  const competitorsSitemap: MetadataRoute.Sitemap = competitors.map(
    (competitor) => ({
      url: `${baseUrl}/alternatives/${competitor.slug}`,
      lastModified: new Date(competitor.updatedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    })
  );

  return [
    ...landingPage,
    // ...useCasesSitemap,
    ...blogIndexSitemap,
    ...categorySitemap,
    ...postsSitemap,
    ...alternativesIndexSitemap,
    ...competitorsSitemap,
  ];
}
