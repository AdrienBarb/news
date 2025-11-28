import { getTags } from "@/lib/services/tags/getTags";
import OnboardingPageClient from "./OnboardingPageClient";

// Server component wrapper that fetches tags
export default async function OnboardingPage() {
  const tags = await getTags();
  return <OnboardingPageClient tags={tags} />;
}
