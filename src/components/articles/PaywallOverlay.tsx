"use client";

import Link from "next/link";
import { Crown, Lock, ArrowRight } from "lucide-react";

interface PaywallOverlayProps {
  lockedCount: number;
  totalCount: number;
  isLoggedIn: boolean;
}

export function PaywallOverlay({ lockedCount, totalCount, isLoggedIn }: PaywallOverlayProps) {
  return (
    <div className="relative mt-0">
      {/* Gradient fade over last visible content */}
      <div className="absolute -top-32 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-white/80 to-white dark:via-zinc-950/80 dark:to-zinc-950 pointer-events-none z-10" />

      {/* Paywall Card */}
      <div className="relative z-20 border border-amber-200 dark:border-amber-800 rounded-2xl overflow-hidden">
        {/* Decorative top gradient */}
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />

        <div className="bg-gradient-to-b from-amber-50/80 to-white dark:from-amber-950/30 dark:to-zinc-900 px-6 py-10 sm:px-10 sm:py-14 text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30">
            <Lock className="w-7 h-7 text-white" />
          </div>

          {/* Title */}
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Premium Content
          </h3>

          {/* Description */}
          <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-2">
            {lockedCount} of {totalCount} bilingual sentences are locked.
          </p>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-8 text-sm">
            Upgrade to AT-News Pro to unlock full articles, support creators, and enjoy
            an ad-free bilingual learning experience.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-amber-200/40 dark:shadow-amber-900/20 hover:shadow-xl"
            >
              <Crown className="w-4 h-4" />
              Upgrade to Pro
              <ArrowRight className="w-4 h-4" />
            </Link>

            {!isLoggedIn && (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-6 py-3.5 rounded-xl font-medium text-sm transition-colors"
              >
                Log in to continue
              </Link>
            )}
          </div>

          {/* Features preview */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { label: "Full Articles", desc: "Unlock all content" },
              { label: "Support Creators", desc: "Revenue sharing" },
              { label: "Ad-Free", desc: "Clean reading" },
            ].map((f) => (
              <div
                key={f.label}
                className="text-center p-3 rounded-xl bg-white/60 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800"
              >
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{f.label}</p>
                <p className="text-xs text-zinc-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
