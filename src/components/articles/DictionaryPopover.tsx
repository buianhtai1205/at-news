"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Volume2, Loader2, X, BookOpen } from "lucide-react";

interface DictionaryMeaning {
  partOfSpeech: string;
  definition: string;
  example?: string;
}

interface DictionaryData {
  word: string;
  phonetic: string;
  audioUrl: string;
  meanings: DictionaryMeaning[];
}

interface PopoverPosition {
  x: number;
  y: number;
}

export function DictionaryPopover() {
  const [selectedWord, setSelectedWord] = useState("");
  const [position, setPosition] = useState<PopoverPosition | null>(null);
  const [data, setData] = useState<DictionaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const close = useCallback(() => {
    setSelectedWord("");
    setPosition(null);
    setData(null);
    setError("");
    setLoading(false);
    abortRef.current?.abort();
    window.getSelection()?.removeAllRanges();
  }, []);

  // Listen for text selection on English text elements
  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      // Small delay to let selection finalize
      requestAnimationFrame(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim();

        if (!text || text.length === 0 || text.length > 100) {
          return;
        }

        // Check if selection is inside an English text element
        const anchorNode = selection?.anchorNode;
        const parentEl = anchorNode?.parentElement;
        const enContainer = parentEl?.closest("[data-lang='en']");

        if (!enContainer) return;

        // Get selection position
        const range = selection?.getRangeAt(0);
        if (!range) return;

        const rect = range.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.bottom + 8;

        setSelectedWord(text);
        setPosition({ x, y });
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Close popover when clicking outside
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [close]);

  // Fetch dictionary data when word is selected
  useEffect(() => {
    if (!selectedWord) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setData(null);
    setError("");

    fetch(
      `/api/dictionary?word=${encodeURIComponent(selectedWord)}`,
      { signal: controller.signal }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Lookup failed");
        return res.json();
      })
      .then((result: DictionaryData) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError("Could not look up this word");
        setLoading(false);
      });

    return () => controller.abort();
  }, [selectedWord]);

  // Play pronunciation
  const playAudio = useCallback(() => {
    if (data?.audioUrl) {
      const audio = new Audio(data.audioUrl);
      audio.play().catch(() => {
        // Fallback to speechSynthesis
        speakWord(data.word);
      });
    } else if (data?.word) {
      speakWord(data.word);
    }
  }, [data]);

  if (!selectedWord || !position) return null;

  // Calculate popover position (centered above selection, clamped to viewport)
  const popoverWidth = 320;
  const left = Math.max(
    8,
    Math.min(position.x - popoverWidth / 2, window.innerWidth - popoverWidth - 8)
  );
  const top = position.y;

  return (
    <div
      ref={popoverRef}
      className="fixed z-[9999]"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${popoverWidth}px`,
      }}
    >
      {/* Popover card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate max-w-[180px]">
              {selectedWord}
            </span>
            {data?.phonetic && (
              <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                {data.phonetic}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {(data?.audioUrl || data?.word) && (
              <button
                onClick={playAudio}
                className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
                title="Play pronunciation"
              >
                <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
              </button>
            )}
            <button
              onClick={close}
              className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-3 py-2.5 space-y-2">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-zinc-400 py-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Looking up...
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          {data && !loading && (
            <>
              {data.meanings.length > 0 ? (
                <ul className="space-y-1.5">
                  {data.meanings.map((m, i) => (
                    <li key={i} className="text-sm leading-snug">
                      <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mr-1.5">
                        {m.partOfSpeech}
                      </span>
                      <span className="text-zinc-700 dark:text-zinc-300">
                        {m.definition}
                      </span>
                      {m.example && (
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 italic mt-0.5 pl-2 border-l-2 border-zinc-200 dark:border-zinc-700">
                          &ldquo;{m.example}&rdquo;
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-zinc-400">
                  No definition found for this word.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Arrow pointing up to selection */}
      <div
        className="absolute top-0 -translate-y-full"
        style={{ left: `${Math.max(16, Math.min(position.x - left, popoverWidth - 16))}px` }}
      >
        <div className="w-3 h-3 rotate-45 bg-white dark:bg-zinc-900 border-l border-t border-zinc-200 dark:border-zinc-700 translate-y-1.5" />
      </div>
    </div>
  );
}

function speakWord(word: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}
