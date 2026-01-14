import { createClient } from "next-sanity";

export const client = createClient({
  projectId: "o1j15hvr",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
});
