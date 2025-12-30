import { openai } from "@/lib/openai/client";

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

/**
 * Generate an embedding vector for a text string
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // Truncate text if too long (model has 8191 token limit)
  const truncatedText = text.substring(0, 8000);

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: truncatedText,
  });

  const embedding = response.data[0]?.embedding;
  if (!embedding) {
    throw new Error("No embedding returned from OpenAI");
  }

  return embedding;
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  // Truncate texts if too long
  const truncatedTexts = texts.map((t) => t.substring(0, 8000));

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: truncatedTexts,
  });

  return response.data.map((d) => d.embedding);
}

/**
 * Calculate cosine similarity between two embedding vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  if (magnitude === 0) {
    return 0;
  }

  return dotProduct / magnitude;
}

/**
 * Find the most similar embedding from a list
 */
export function findMostSimilar(
  target: number[],
  candidates: { id: string; embedding: number[] }[],
  threshold: number = 0
): { id: string; similarity: number } | null {
  let bestMatch: { id: string; similarity: number } | null = null;

  for (const candidate of candidates) {
    const similarity = cosineSimilarity(target, candidate.embedding);
    if (similarity >= threshold) {
      if (!bestMatch || similarity > bestMatch.similarity) {
        bestMatch = { id: candidate.id, similarity };
      }
    }
  }

  return bestMatch;
}

/**
 * Calculate the centroid (average) of multiple embeddings
 */
export function calculateCentroid(embeddings: number[][]): number[] {
  if (embeddings.length === 0) {
    return new Array(EMBEDDING_DIMENSIONS).fill(0);
  }

  const centroid = new Array(embeddings[0].length).fill(0);

  for (const embedding of embeddings) {
    for (let i = 0; i < embedding.length; i++) {
      centroid[i] += embedding[i];
    }
  }

  for (let i = 0; i < centroid.length; i++) {
    centroid[i] /= embeddings.length;
  }

  return centroid;
}

