import { Metadata } from "next";
import { siteMetadata } from "@/data/siteMetadata";

interface PageSEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  [key: string]: string | undefined;
}

/**
 * Generates page metadata following the SEO template: <Primary Keyword or Promise> | Prediqte
 */
export function genPageMetadata({
  title,
  description,
  image,
  url = "./",
  ...rest
}: PageSEOProps): Metadata {
  const absoluteUrl = url.startsWith("http")
    ? url
    : `${siteMetadata.siteUrl}${url}`;

  const imageUrl = image
    ? image
    : `${siteMetadata.siteUrl}${siteMetadata.socialBanner}`;

  // Full title following template: <Primary Keyword or Promise> | Prediqte
  const fullTitle = `${title} | ${siteMetadata.brandName}`;

  return {
    metadataBase: new URL(siteMetadata.siteUrl),
    title: {
      default: fullTitle,
      template: `%s | ${siteMetadata.brandName}`,
    },
    description: description || siteMetadata.description,
    keywords: [
      "reddit lead generation",
      "reddit marketing",
      "find leads on reddit",
      "reddit prospecting",
      "inbound leads reddit",
      "social selling reddit",
      "reddit for saas",
      "reddit monitoring tool",
    ],
    authors: [{ name: siteMetadata.brandName }],
    creator: siteMetadata.brandName,
    publisher: siteMetadata.brandName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: fullTitle,
      description: description || siteMetadata.description,
      url: absoluteUrl,
      siteName: siteMetadata.brandName,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      title: fullTitle,
      description: description || siteMetadata.description,
      card: "summary_large_image",
      images: [
        {
          url: imageUrl,
          alt: fullTitle,
        },
      ],
      creator: siteMetadata.twitter,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: absoluteUrl,
    },
    ...rest,
  };
}
