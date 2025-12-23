import { headers } from "next/headers";
import HeroSection from "@/components/sections/HeroSection";
import PainSection from "@/components/sections/PainSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import FAQSection from "@/components/sections/FAQSection";
import { auth } from "@/lib/better-auth/auth";
import { getStartedUrl } from "@/lib/utils/getStartedUrl";
import ComparisonSection from "@/components/sections/ComparisonSection";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const getStartedUrlValue = getStartedUrl(!!session?.user);

  return (
    <div className="flex flex-col">
      <HeroSection getStartedUrl={getStartedUrlValue} />
      <PainSection />
      <FeaturesSection />
      <ComparisonSection />
      <FAQSection />
    </div>
  );
}
