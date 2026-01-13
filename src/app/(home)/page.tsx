import { headers } from "next/headers";
import Script from "next/script";
import HeroSection from "@/components/sections/HeroSection";
import WhatPrediqteDoesSection from "@/components/sections/WhatPrediqteDoesSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import FAQSection from "@/components/sections/FAQSection";
import PricingSection from "@/components/sections/PricingSection";
import LandingPageTracker from "@/components/tracking/LandingPageTracker";
import { auth } from "@/lib/better-auth/auth";
import { getStartedUrl } from "@/lib/utils/getStartedUrl";
import { genPageMetadata } from "@/lib/seo/genPageMetadata";
import { siteMetadata } from "@/data/siteMetadata";
import config from "@/lib/config";

// Homepage metadata
export const metadata = genPageMetadata({
  title: siteMetadata.title,
  description: siteMetadata.description,
  url: "/",
});

// Organization structured data for SEO
const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: config.project.brandName,
  url: config.project.url,
  logo: `${config.project.url}${config.project.logo}`,
  description: config.seo.description,
  contactPoint: {
    "@type": "ContactPoint",
    email: config.contact.email,
    contactType: "customer support",
  },
  sameAs: [config.social.twitter],
};

// SoftwareApplication structured data for SEO
const softwareStructuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: config.project.brandName,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: config.seo.description,
  offers: {
    "@type": "Offer",
    price: "9.50",
    priceCurrency: "USD",
  },
};

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const getStartedUrlValue = getStartedUrl(!!session?.user);

  return (
    <>
      {/* Organization Structured Data */}
      <Script
        id="organization-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationStructuredData),
        }}
      />
      {/* SoftwareApplication Structured Data */}
      <Script
        id="software-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareStructuredData),
        }}
      />
      <LandingPageTracker />
      <HeroSection getStartedUrl={getStartedUrlValue} />
      <WhatPrediqteDoesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection getStartedUrl={getStartedUrlValue} />
      <FAQSection />
    </>
  );
}
