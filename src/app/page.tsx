import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import TagSelectionSection from "@/components/sections/TagSelectionSection";
import FAQSection from "@/components/sections/FAQSection";
import { getTags } from "@/lib/services/tags/getTags";

export default async function Home() {
  const tags = await getTags();

  return (
    <div className="flex flex-col">
      <HeroSection />
      <FeaturesSection />
      <TagSelectionSection tags={tags} />
      <FAQSection />
    </div>
  );
}
