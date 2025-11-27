import { z } from "zod";

export const createUserTagPreferenceSchema = z.object({
  tagIds: z.array(z.string().uuid()).min(3, "Please select at least 3 tags"),
});

