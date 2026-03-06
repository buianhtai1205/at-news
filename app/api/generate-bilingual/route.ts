import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { GoogleGenAI } from "@google/genai";
import { handleApiError } from "@/src/core/errors/AppError";
import {
  INVALID_URL,
  SCRAPE_FAILED,
  AI_GENERATION_FAILED,
  CONTENT_TOO_SHORT,
} from "@/src/core/errors/errorCodes";
import { requireAuth } from "@/src/infrastructure/auth/middleware";

// ─── Helpers ─────────────────────────────────────────────────

const URL_REGEX = /^https?:\/\/.+/i;
const MIN_CONTENT_LENGTH = 80; // chars

function isValidUrl(raw: unknown): raw is string {
  return typeof raw === "string" && URL_REGEX.test(raw.trim());
}

/**
 * Fetch the target page and extract its main readable content using
 * Mozilla Readability (the same algorithm behind Firefox Reader View).
 */
async function scrapeArticle(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; AT-News/1.0; +https://at-news.vercel.app)",
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    throw INVALID_URL(`Received HTTP ${res.status} from the target URL`);
  }

  const html = await res.text();
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article?.textContent) {
    throw SCRAPE_FAILED("Readability could not extract meaningful content");
  }

  // Clean up excessive whitespace
  return article.textContent.replace(/\s+/g, " ").trim();
}

/**
 * Build the Gemini prompt that instructs the model to produce bilingual
 * sentence-by-sentence pairs in strict JSON format.
 */
function buildPrompt(text: string): string {
  return `You are a professional translator and editor.

Given the following English article text, do the following:
1. Split the text into short, meaningful sentences (1-2 sentences per pair). Keep the original meaning intact.
2. Translate each sentence into Vietnamese.
3. Return ONLY a valid JSON array with this exact format — no markdown, no code fences, no explanation:

[
  {"en": "English sentence.", "vi": "Vietnamese translation."},
  {"en": "Next sentence.", "vi": "Bản dịch tiếp theo."}
]

Important rules:
- Each pair should be a coherent sentence or short paragraph.
- Preserve proper nouns, technical terms, and numbers.
- Translate naturally, not word-by-word.
- Output raw JSON only. No wrapping, no extra text.

---
Article text:
${text}`;
}

/**
 * Parse the Gemini response into a typed array, handling common edge-cases
 * like markdown code fences or leading/trailing text.
 */
function parseGeminiResponse(raw: string): Array<{ en: string; vi: string }> {
  // Strip markdown code fences if present
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Response is not a non-empty array");
  }

  // Validate & sanitize each pair
  return parsed.map((item: unknown, i: number) => {
    const obj = item as Record<string, unknown>;
    if (typeof obj?.en !== "string" || typeof obj?.vi !== "string") {
      throw new Error(`Invalid pair at index ${i}`);
    }
    return { en: obj.en.trim(), vi: obj.vi.trim() };
  });
}

// ─── Route Handler ───────────────────────────────────────────

export async function POST(request: Request) {
  try {
    // Auth check — only logged-in users can generate content
    await requireAuth();

    const body = await request.json();
    const { url, text: inputText } = body as { url?: string; text?: string };

    // 1. Get text — either by scraping a URL or using provided raw text
    let text: string;

    if (typeof inputText === "string" && inputText.trim().length > 0) {
      // Raw text path (paste or file upload)
      text = inputText.replace(/\s+/g, " ").trim();
    } else if (isValidUrl(url)) {
      // URL scraping path
      try {
        text = await scrapeArticle(url!.trim());
      } catch (err) {
        console.error("[generate-bilingual] Scrape error:", err);
        throw err;
      }
    } else {
      throw INVALID_URL("Please provide either a valid URL or raw text");
    }

    if (text.length < MIN_CONTENT_LENGTH) {
      throw CONTENT_TOO_SHORT(
        `Extracted only ${text.length} characters — need at least ${MIN_CONTENT_LENGTH}`
      );
    }

    // 2. Truncate to avoid exceeding token limits (~30 000 chars ≈ 8 k tokens)
    const truncated = text.slice(0, 30_000);

    // 3. Call Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw AI_GENERATION_FAILED("GEMINI_API_KEY is not configured");
    }

    const ai = new GoogleGenAI({ apiKey });
    let rawText: string | undefined;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: buildPrompt(truncated),
        config: {
          temperature: 0.3,
          maxOutputTokens: 8192,
          thinkingConfig: { thinkingBudget: 0 },
        },
      });
      rawText = response.text;
    } catch (err) {
      console.error("[generate-bilingual] Gemini API error:", err);

      // Surface rate-limit / quota errors clearly
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("quota")) {
        throw AI_GENERATION_FAILED(
          "Gemini API rate limit exceeded — please wait a minute and try again"
        );
      }

      throw AI_GENERATION_FAILED(
        err instanceof Error ? err.message : "Unknown Gemini error"
      );
    }

    if (!rawText) {
      throw AI_GENERATION_FAILED("Gemini returned an empty response");
    }

    // 4. Parse result
    let pairs: Array<{ en: string; vi: string }>;
    try {
      pairs = parseGeminiResponse(rawText);
    } catch {
      throw AI_GENERATION_FAILED(
        "Failed to parse AI response into bilingual pairs"
      );
    }

    return Response.json({ pairs }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
