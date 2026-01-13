import { MetadataRoute } from "next";
import { siteMetadata } from "@/data/siteMetadata";

// Static use cases pages
const useCasesPages = [
  "/use-cases",
  "/use-cases/find-saas-customers-on-reddit",
  "/use-cases/validate-saas-idea-on-reddit",
  "/use-cases/launch-saas-on-reddit",
];

// Static blog pages
const blogPages = [
  "/blog",
  "/blog/how-to-find-customers-on-reddit",
  "/blog/reddit-buying-intent-signals",
  "/blog/reddit-market-research-for-saas",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteMetadata.siteUrl;

  // Landing page
  const landingPage: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  // Use cases pages
  const useCasesSitemap: MetadataRoute.Sitemap = useCasesPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: path === "/use-cases" ? 0.9 : 0.8,
  }));

  // Blog pages
  const blogSitemap: MetadataRoute.Sitemap = blogPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "/blog" ? 0.9 : 0.8,
  }));

  // TODO: Add dynamic use cases from database
  // const dynamicUseCases = await getUseCasesFromDB();

  // TODO: Add dynamic blog articles from database
  // const dynamicBlogPosts = await getBlogPostsFromDB();

  return [...landingPage, ...useCasesSitemap, ...blogSitemap];
}
