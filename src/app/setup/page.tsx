import { getTags } from "@/lib/services/tags/getTags";
import TagSelection from "@/components/setup/TagSelection";

export default async function SetupPage() {
  const tags = await getTags();

  return <TagSelection tags={tags} />;
}
