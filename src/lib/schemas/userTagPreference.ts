import { z } from "zod";

export const createUserTagPreferenceSchema = z.object({
  tagIds: z.array(z.uuid()).min(3, "Please select at least 3 tags"),
});
