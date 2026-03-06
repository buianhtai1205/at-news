"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  X,
  FileText,
  ClipboardPaste,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileUp,
} from "lucide-react";

interface BilingualPair {
  en: string;
  vi: string;
}

interface ImportContentModalProps {
  onClose: () => void;
  onImport: (pairs: BilingualPair[]) => void;
}

type Tab = "paste" | "upload";

const ACCEPTED_MIME: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "text/plain": [".txt"],
};

export function ImportContentModal({
  onClose,
  onImport,
}: ImportContentModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("paste");

  // ── Paste Text state ────────────────────────────────────────
  const [pastedText, setPastedText] = useState("");

  // ── Upload File state ───────────────────────────────────────
  const [droppedFile, setDroppedFile] = useState<File | null>(null);

  // ── Shared status state ─────────────────────────────────────
  const [status, setStatus] = useState<
    "idle" | "extracting" | "generating" | "done" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) {
      setDroppedFile(accepted[0]);
      setErrorMsg("");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_MIME,
    multiple: false,
    maxSize: 20 * 1024 * 1024, // 20 MB
    onDropRejected: (rejections) => {
      const reason = rejections[0]?.errors[0]?.message ?? "File rejected";
      setErrorMsg(reason);
    },
  });

  const canSubmit =
    status === "idle" || status === "error"
      ? activeTab === "paste"
        ? pastedText.trim().length > 40
        : droppedFile !== null
      : false;

  // ── Main handler ────────────────────────────────────────────
  const handleGenerate = async () => {
    setErrorMsg("");

    try {
      let text = "";

      if (activeTab === "paste") {
        text = pastedText.trim();
      } else {
        // Step 1: extract text from file
        setStatus("extracting");
        const formData = new FormData();
        formData.append("file", droppedFile!);

        const extractRes = await fetch("/api/extract-file", {
          method: "POST",
          body: formData,
        });
        const extractData = await extractRes.json();

        if (!extractRes.ok) {
          throw new Error(
            extractData.message ?? "Failed to extract file content"
          );
        }
        text = extractData.text as string;
      }

      // Step 2: generate bilingual pairs via Gemini
      setStatus("generating");
      const genRes = await fetch("/api/generate-bilingual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const genData = await genRes.json();

      if (!genRes.ok) {
        throw new Error(genData.message ?? "Failed to generate bilingual content");
      }

      const pairs: BilingualPair[] = genData.pairs;
      if (!pairs || pairs.length === 0) {
        throw new Error("No bilingual pairs were returned");
      }

      setStatus("done");

      // Short delay so user sees the success flash, then close & import
      setTimeout(() => {
        onImport(pairs);
        onClose();
      }, 600);
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const isBusy = status === "extracting" || status === "generating";

  const statusLabel =
    status === "extracting"
      ? "Extracting text from file…"
      : status === "generating"
      ? "Translating with AI — this may take 10–30 seconds…"
      : status === "done"
      ? "Done! Importing…"
      : "";

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isBusy) onClose();
      }}
    >
      {/* Panel */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 font-semibold text-base">
            <FileUp className="w-5 h-5 text-indigo-500" />
            Import Content
          </div>
          <button
            onClick={onClose}
            disabled={isBusy}
            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-6">
          {(
            [
              { id: "paste" as Tab, label: "Paste Text", icon: ClipboardPaste },
              { id: "upload" as Tab, label: "Upload File", icon: FileText },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                if (!isBusy) {
                  setActiveTab(id);
                  setErrorMsg("");
                  setStatus("idle");
                }
              }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === id
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-6 flex-1 min-h-0">
          {/* Paste Text Tab */}
          {activeTab === "paste" && (
            <div className="flex flex-col gap-3 h-full">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Paste any English article text below. AI will split and
                translate it sentence-by-sentence.
              </p>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                disabled={isBusy}
                placeholder="Paste your article text here…"
                rows={12}
                className="w-full flex-1 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none disabled:opacity-50 font-mono leading-relaxed"
              />
              <p className="text-xs text-zinc-400">
                {pastedText.trim().length} characters
              </p>
            </div>
          )}

          {/* Upload File Tab */}
          {activeTab === "upload" && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Upload a <strong>PDF</strong>, <strong>DOCX</strong>, or{" "}
                <strong>TXT</strong> file (max 20 MB). Text will be extracted
                and translated automatically.
              </p>

              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40"
                    : "border-zinc-300 dark:border-zinc-700 hover:border-indigo-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                } ${isBusy ? "pointer-events-none opacity-50" : ""}`}
              >
                <input {...getInputProps()} />
                <Upload
                  className={`w-8 h-8 ${
                    isDragActive
                      ? "text-indigo-500"
                      : "text-zinc-400"
                  }`}
                />
                {isDragActive ? (
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    Drop the file here…
                  </p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Drag &amp; drop a file here, or{" "}
                      <span className="text-indigo-600 dark:text-indigo-400 underline">
                        click to browse
                      </span>
                    </p>
                    <p className="text-xs text-zinc-400">
                      PDF, DOCX, TXT — max 20 MB
                    </p>
                  </>
                )}
              </div>

              {/* Selected file preview */}
              {droppedFile && (
                <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {droppedFile.name}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {(droppedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  {!isBusy && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDroppedFile(null);
                      }}
                      className="p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex flex-col gap-3">
          {/* Status/Error messages */}
          {isBusy && statusLabel && (
            <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              {statusLabel}
            </div>
          )}

          {status === "done" && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Bilingual content generated successfully!
            </div>
          )}

          {status === "error" && errorMsg && (
            <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {errorMsg}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isBusy}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canSubmit || isBusy}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isBusy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {status === "extracting" ? "Extracting…" : "Generating…"}
                </>
              ) : (
                <>
                  <FileUp className="w-4 h-4" />
                  Generate Bilingual Content
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
