import { handleApiError } from "@/src/core/errors/AppError";
import { AppError } from "@/src/core/errors/AppError";

interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: { definition: string; example?: string }[];
}

interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics?: { text?: string; audio?: string }[];
  meanings?: DictionaryMeaning[];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const word = searchParams.get("word")?.trim().toLowerCase();

    if (!word || word.length > 100 || !/^[a-z\s'-]+$/i.test(word)) {
      throw new AppError("E00070", "Invalid word", 400);
    }

    const dictRes = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!dictRes.ok) {
      throw new AppError("E00071", "Word not found", 404);
    }

    const entries: DictionaryEntry[] = await dictRes.json();
    const entry = entries[0];

    const phonetic =
      entry?.phonetic ||
      entry?.phonetics?.find((p) => p.text)?.text ||
      "";

    const audioUrl =
      entry?.phonetics?.find((p) => p.audio && p.audio.length > 0)?.audio || "";

    // Collect up to 5 definitions across all meanings
    const meanings: { partOfSpeech: string; definition: string; example?: string }[] = [];
    for (const m of entry?.meanings || []) {
      for (const d of m.definitions) {
        if (meanings.length >= 5) break;
        meanings.push({
          partOfSpeech: m.partOfSpeech,
          definition: d.definition,
          example: d.example,
        });
      }
      if (meanings.length >= 5) break;
    }

    return Response.json({ word, phonetic, audioUrl, meanings });
  } catch (error) {
    return handleApiError(error);
  }
}
