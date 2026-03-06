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

// ─── Config ──────────────────────────────────────────────────

const URL_REGEX = /^https?:\/\/.+/i;
const MIN_CONTENT_LENGTH = 80;        // chars
const CHUNK_SIZE       = 5_000;       // chars per Gemini call  (~1 300 input tokens)
const MAX_TOTAL_CHARS  = 60_000;      // hard cap before chunking (~12 chunks max)
const CHUNK_DELAY_MS   = 300;         // throttle between API calls

// ─── Helpers ─────────────────────────────────────────────────

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

  return article.textContent.replace(/\s+/g, " ").trim();
}

/**
 * Split text into chunks of at most CHUNK_SIZE characters,
 * breaking only at sentence-ending punctuation so pairs stay coherent.
 */
function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= CHUNK_SIZE) {
      chunks.push(remaining);
      break;
    }

    // Try to break at a sentence boundary (. ! ?) within the chunk window
    let cutAt = CHUNK_SIZE;
    const sentenceEnd = remaining.lastIndexOf(". ", CHUNK_SIZE);
    const excEnd      = remaining.lastIndexOf("! ", CHUNK_SIZE);
    const qEnd        = remaining.lastIndexOf("? ", CHUNK_SIZE);
    const best        = Math.max(sentenceEnd, excEnd, qEnd);

    if (best > CHUNK_SIZE * 0.5) {
      // +1 to include the period itself
      cutAt = best + 1;
    }

    chunks.push(remaining.slice(0, cutAt).trim());
    remaining = remaining.slice(cutAt).trim();
  }

  return chunks;
}

/**
 * Build the Gemini prompt for a single chunk.
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
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Response is not a non-empty array");
  }

  return parsed.map((item: unknown, i: number) => {
    const obj = item as Record<string, unknown>;
    if (typeof obj?.en !== "string" || typeof obj?.vi !== "string") {
      throw new Error(`Invalid pair at index ${i}`);
    }
    return { en: obj.en.trim(), vi: obj.vi.trim() };
  });
}

/** Single Gemini call with retries on rate-limit (429). */
async function callGemini(
  ai: GoogleGenAI,
  prompt: string,
  attempt = 0
): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 8192,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });
    if (!response.text) throw new Error("Empty response");
    return response.text;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const isRateLimit =
      msg.includes("429") ||
      msg.includes("RESOURCE_EXHAUSTED") ||
      msg.includes("quota");

    if (isRateLimit && attempt < 3) {
      // Exponential back-off: 2 s, 4 s, 8 s
      const wait = 2_000 * Math.pow(2, attempt);
      console.warn(`[generate-bilingual] Rate-limit hit, retrying in ${wait}ms…`);
      await new Promise((r) => setTimeout(r, wait));
      return callGemini(ai, prompt, attempt + 1);
    }

    if (isRateLimit) {
      throw AI_GENERATION_FAILED(
        "Gemini API rate limit exceeded — please wait a minute and try again"
      );
    }

    throw AI_GENERATION_FAILED(msg || "Unknown Gemini error");
  }
}

// ─── Route Handler ───────────────────────────────────────────

export async function POST(request: Request) {
  try {
    await requireAuth();

    const body = await request.json();
    const { url, text: inputText } = body as { url?: string; text?: string };

    // 1. Obtain raw text
    let text: string;

    if (typeof inputText === "string" && inputText.trim().length > 0) {
      text = inputText.replace(/\s+/g, " ").trim();
    } else if (isValidUrl(url)) {
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

    // 2. Cap total and split into chunks
    const capped  = text.slice(0, MAX_TOTAL_CHARS);
    const chunks  = chunkText(capped);
    console.log(
      `[generate-bilingual] text=${text.length} chars → capped=${capped.length} → ${chunks.length} chunk(s)`
    );

    // 3. Check Gemini key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw AI_GENERATION_FAILED("GEMINI_API_KEY is not configured");

    const ai = new GoogleGenAI({ apiKey });

    // 4. Process chunks sequentially and collect pairs
    const allPairs: Array<{ en: string; vi: string }> = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`[generate-bilingual] chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`);

      const rawText = await callGemini(ai, buildPrompt(chunk));

      let chunkPairs: Array<{ en: string; vi: string }>;
      try {
        chunkPairs = parseGeminiResponse(rawText);
      } catch {
        throw AI_GENERATION_FAILED(
          `Failed to parse AI response for chunk ${i + 1}/${chunks.length}`
        );
      }

      allPairs.push(...chunkPairs);

      // Throttle between calls (skip after last chunk)
      if (i < chunks.length - 1) {
        await new Promise((r) => setTimeout(r, CHUNK_DELAY_MS));
      }
    }

    if (allPairs.length === 0) {
      throw AI_GENERATION_FAILED("No bilingual pairs were generated");
    }

    return Response.json({ pairs: allPairs }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

