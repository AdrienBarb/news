import { createClient } from "next-sanity";

const client = createClient({
  projectId: "o1j15hvr",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
});

async function fetchCategories() {
  const categories = await client.fetch(`*[_type == "category"] {
    _id,
    title,
    "slug": slug.current
  }`);

  console.log("Available categories:\n");
  categories.forEach((cat: { _id: string; title: string; slug: string }) => {
    console.log(`Title: ${cat.title}`);
    console.log(`ID: ${cat._id}`);
    console.log(`Slug: ${cat.slug}`);
    console.log("---");
  });
}

fetchCategories();
