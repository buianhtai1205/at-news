"use client";

import { useState } from "react";
import { Settings2, LayoutGrid, Rows, AlignLeft, AlignCenter, AlignJustify } from "lucide-react";
import { BilingualSentence } from "@/src/core/entities/Article";
import { DictionaryPopover } from "./DictionaryPopover";

interface BilingualReaderProps {
  content: BilingualSentence[];
}

type LayoutMode = "side-by-side" | "stacked";
type FontSize = "sm" | "base" | "lg" | "xl";
type FontFamily = "sans" | "serif" | "mono";
type TextAlign = "left" | "center" | "justify";
type LineSpacing = "normal" | "relaxed" | "loose";

export function BilingualReader({ content }: BilingualReaderProps) {
  const [layout, setLayout] = useState<LayoutMode>("side-by-side");
  const [fontSize, setFontSize] = useState<FontSize>("base");
  const [fontFamily, setFontFamily] = useState<FontFamily>("serif");
  const [textAlign, setTextAlign] = useState<TextAlign>("left");
  const [lineSpacing, setLineSpacing] = useState<LineSpacing>("relaxed");
  const [showSettings, setShowSettings] = useState(false);

  const fontSizeClasses: Record<FontSize, string> = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const fontFamilyClasses: Record<FontFamily, string> = {
    sans: "font-sans",
    serif: "font-serif",
    mono: "font-mono",
  };

  const textAlignClasses: Record<TextAlign, string> = {
    left: "text-left",
    center: "text-center",
    justify: "text-justify",
  };

  const lineSpacingClasses: Record<LineSpacing, string> = {
    normal: "leading-normal",
    relaxed: "leading-relaxed",
    loose: "leading-loose",
  };

  return (
    <div className="w-full max-w-5xl mx-auto relative">
      {/* Dictionary Popover — triggered by selecting English text */}
      <DictionaryPopover />

      {/* Settings Toolbar */}
      <div className="sticky top-16 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 py-3 px-4 mb-8 flex items-center justify-between rounded-b-2xl shadow-sm">
        <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {content.length} sentences
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Settings2 className="w-4 h-4" />
            <span className="hidden sm:inline">Reader Settings</span>
          </button>

          {showSettings && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-4 flex flex-col gap-4 z-50">
              {/* Layout Toggle */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Layout</label>
                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                  <button
                    onClick={() => setLayout("side-by-side")}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm rounded-md transition-colors ${layout === "side-by-side" ? "bg-white dark:bg-zinc-700 shadow-sm font-medium" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    Side
                  </button>
                  <button
                    onClick={() => setLayout("stacked")}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm rounded-md transition-colors ${layout === "stacked" ? "bg-white dark:bg-zinc-700 shadow-sm font-medium" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"}`}
                  >
                    <Rows className="w-4 h-4" />
                    Stack
                  </button>
                </div>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Font Size</label>
                <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                  {(["sm", "base", "lg", "xl"] as FontSize[]).map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${fontSize === size ? "bg-white dark:bg-zinc-700 shadow-sm font-medium" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"}`}
                    >
                      {size === "sm" ? "A" : size === "base" ? "A" : size === "lg" ? "A+" : "A++"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Font Family</label>
                <div className="flex flex-col gap-1">
                  {(["sans", "serif", "mono"] as FontFamily[]).map((font) => (
                    <button
                      key={font}
                      onClick={() => setFontFamily(font)}
                      className={`text-left px-3 py-2 text-sm rounded-md transition-colors ${fontFamily === font ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium" : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"}`}
                    >
                      {font === "sans" ? "Inter (Sans-serif)" : font === "serif" ? "Georgia (Serif)" : "JetBrains (Mono)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Alignment */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Alignment</label>
                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                  {([
                    { value: "left" as TextAlign, icon: AlignLeft, label: "Left" },
                    { value: "center" as TextAlign, icon: AlignCenter, label: "Center" },
                    { value: "justify" as TextAlign, icon: AlignJustify, label: "Justify" },
                  ]).map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      onClick={() => setTextAlign(value)}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-sm rounded-md transition-colors ${textAlign === value ? "bg-white dark:bg-zinc-700 shadow-sm font-medium" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Spacing */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Line Spacing</label>
                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                  {(["normal", "relaxed", "loose"] as LineSpacing[]).map((spacing) => (
                    <button
                      key={spacing}
                      onClick={() => setLineSpacing(spacing)}
                      className={`flex-1 py-1.5 text-xs rounded-md transition-colors capitalize ${lineSpacing === spacing ? "bg-white dark:bg-zinc-700 shadow-sm font-medium" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"}`}
                    >
                      {spacing}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className={`flex flex-col gap-6 pb-24 ${fontFamilyClasses[fontFamily]} ${fontSizeClasses[fontSize]} ${textAlignClasses[textAlign]} ${lineSpacingClasses[lineSpacing]}`}>
        {content.map((sentence, idx) => (
          <div 
            key={idx} 
            className={`group p-4 rounded-xl transition-colors hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 ${
              layout === "side-by-side" 
                ? "md:grid md:grid-cols-[1fr_1fr] md:gap-8 flex flex-col gap-4" 
                : "flex flex-col gap-4"
            }`}
          >
            {/* English Side */}
            <div className="text-zinc-900 dark:text-zinc-100" data-lang="en min-w-0" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>
              <span className="inline-block w-6 text-xs text-zinc-300 dark:text-zinc-600 font-mono shrink-0 select-none mr-1">
                {idx + 1}
              </span>
              {sentence.en}
            </div>
            
            {/* Vietnamese Side */}
            <div className="text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-4 md:border-t-0 md:pt-0 md:border-l md:border-zinc-200 dark:md:border-zinc-800 md:pl-8 min-w-0" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>
              {sentence.vi}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
