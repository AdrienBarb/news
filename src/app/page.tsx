import { headers } from "next/headers";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import TagSelectionSection from "@/components/sections/TagSelectionSection";
import FAQSection from "@/components/sections/FAQSection";
import { getTags } from "@/lib/services/tags/getTags";
import { auth } from "@/lib/better-auth/auth";
import { getStartedUrl } from "@/lib/utils/getStartedUrl";

export default async function Home() {
  const tags = await getTags();
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const getStartedUrlValue = getStartedUrl(!!session?.user);

  return (
    <div className="flex flex-col">
      <HeroSection getStartedUrl={getStartedUrlValue} />
      <FeaturesSection getStartedUrl={getStartedUrlValue} />
      <TagSelectionSection tags={tags} getStartedUrl={getStartedUrlValue} />
      <FAQSection />
    </div>
  );
}
