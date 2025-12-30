/**
 * Text Sanitization Utility
 *
 * Sanitizes external content to:
 * 1. Strip HTML/script tags
 * 2. Normalize unicode
 * 3. Detect potential prompt injection patterns
 * 4. Truncate to max length
 */

// Maximum content length (characters)
const MAX_CONTENT_LENGTH = 10000;

// Patterns that might indicate prompt injection attempts
const INJECTION_PATTERNS = [
  // Direct instruction patterns
  /ignore\s+(previous|all|above)\s+(instructions?|prompts?)/i,
  /disregard\s+(previous|all|above)\s+(instructions?|prompts?)/i,
  /forget\s+(previous|all|above)\s+(instructions?|prompts?)/i,
  /new\s+instructions?:/i,
  /system\s*:\s*/i,
  /\[system\]/i,
  /\[inst\]/i,
  /\[\/inst\]/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  // Role-playing/jailbreak patterns
  /you\s+are\s+now\s+(a|an|the)/i,
  /pretend\s+(you\s+are|to\s+be)/i,
  /act\s+as\s+(if|a|an|the)/i,
  /roleplay\s+as/i,
  // Output manipulation
  /respond\s+(only\s+)?with/i,
  /output\s+(only\s+)?the\s+following/i,
  /print\s+(only\s+)?the\s+following/i,
];

/**
 * Strip HTML tags from text
 */
function stripHtml(text: string): string {
  return text
    // Remove script and style tags with their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    // Remove all other HTML tags
    .replace(/<[^>]*>/g, " ")
    // Decode common HTML entities
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCharCode(parseInt(code, 16))
    );
}

/**
 * Normalize unicode and whitespace
 */
function normalizeText(text: string): string {
  return (
    text
      // Normalize unicode (NFC form)
      .normalize("NFC")
      // Replace various unicode spaces with regular space
      .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, " ")
      // Replace zero-width characters
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      // Replace unicode control characters (except newlines)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      // Normalize line breaks
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      // Collapse multiple spaces into one
      .replace(/ +/g, " ")
      // Collapse multiple newlines into max 2
      .replace(/\n{3,}/g, "\n\n")
      // Trim whitespace
      .trim()
  );
}

/**
 * Check if text contains potential prompt injection patterns
 */
export function detectPromptInjection(text: string): {
  detected: boolean;
  patterns: string[];
} {
  const detectedPatterns: string[] = [];

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      detectedPatterns.push(pattern.source);
    }
  }

  return {
    detected: detectedPatterns.length > 0,
    patterns: detectedPatterns,
  };
}

/**
 * Escape text to be safely used in LLM prompts
 * Wraps content in delimiters and adds a note about untrusted input
 */
export function escapeForPrompt(text: string): string {
  // Use triple backticks with a unique marker
  const delimiter = "```user_content";
  const endDelimiter = "```";

  // Escape any existing triple backticks in the content
  const escapedText = text.replace(/```/g, "'''");

  return `${delimiter}\n${escapedText}\n${endDelimiter}`;
}

export interface SanitizeOptions {
  /** Maximum content length (default: 10000) */
  maxLength?: number;
  /** Whether to check for prompt injection patterns (default: true) */
  checkInjection?: boolean;
  /** Whether to strip HTML tags (default: true) */
  stripHtml?: boolean;
}

export interface SanitizeResult {
  /** The sanitized content */
  content: string;
  /** Whether the content was truncated */
  truncated: boolean;
  /** Original content length before truncation */
  originalLength: number;
  /** Prompt injection detection result */
  injectionCheck: {
    detected: boolean;
    patterns: string[];
  };
}

/**
 * Sanitize external content for safe processing
 */
export function sanitizeContent(
  rawContent: string,
  options: SanitizeOptions = {}
): SanitizeResult {
  const {
    maxLength = MAX_CONTENT_LENGTH,
    checkInjection = true,
    stripHtml: shouldStripHtml = true,
  } = options;

  let content = rawContent;

  // Step 1: Strip HTML if requested
  if (shouldStripHtml) {
    content = stripHtml(content);
  }

  // Step 2: Normalize unicode and whitespace
  content = normalizeText(content);

  // Step 3: Check for prompt injection patterns
  const injectionCheck = checkInjection
    ? detectPromptInjection(content)
    : { detected: false, patterns: [] };

  // Step 4: Truncate if necessary
  const originalLength = content.length;
  const truncated = content.length > maxLength;

  if (truncated) {
    // Try to truncate at a word boundary
    content = content.substring(0, maxLength);
    const lastSpace = content.lastIndexOf(" ");
    if (lastSpace > maxLength * 0.8) {
      content = content.substring(0, lastSpace);
    }
    content = content.trim() + "…";
  }

  return {
    content,
    truncated,
    originalLength,
    injectionCheck,
  };
}

/**
 * Extract a short quote from content (for evidence display)
 */
export function extractQuote(
  content: string,
  options: {
    maxLength?: number;
    startFrom?: number;
  } = {}
): string {
  const { maxLength = 200, startFrom = 0 } = options;

  let quote = content.substring(startFrom);

  // If starting from middle, try to find sentence start
  if (startFrom > 0) {
    const sentenceStart = quote.search(/[.!?]\s+[A-Z]/);
    if (sentenceStart > 0 && sentenceStart < 50) {
      quote = quote.substring(sentenceStart + 2);
    }
  }

  // Truncate at maxLength
  if (quote.length > maxLength) {
    quote = quote.substring(0, maxLength);
    const lastSpace = quote.lastIndexOf(" ");
    if (lastSpace > maxLength * 0.7) {
      quote = quote.substring(0, lastSpace);
    }
    quote = quote.trim() + "…";
  }

  // Add ellipsis at start if we cut from beginning
  if (startFrom > 0) {
    quote = "…" + quote;
  }

  return quote.trim();
}

