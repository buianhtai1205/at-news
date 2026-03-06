"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/components/auth/AuthProvider";
import {
  Crown,
  Check,
  Loader2,
  Sparkles,
  BookOpen,
  Shield,
  DollarSign,
  Zap,
} from "lucide-react";

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [subscribing, setSubscribing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setSubscribing(true);
    setError("");

    try {
      const res = await fetch("/api/profile/subscribe", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Subscription failed");
      }

      setSuccess(true);
      // Redirect after brief delay
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubscribing(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-4 animate-in fade-in">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-200/40 dark:shadow-amber-900/20">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold">Welcome to AT-News Pro!</h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            You now have unlimited access to all premium content.
          </p>
          <p className="text-sm text-zinc-400">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-4 py-2 rounded-full mb-4">
          <Sparkles className="w-4 h-4" />
          Level up your learning
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Choose Your Plan
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto text-lg">
          Learn English naturally through bilingual news. Upgrade for unlimited access and support the creators you love.
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Free Plan */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8">
          <h3 className="text-lg font-semibold mb-1">Free</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
            Get started with basic access
          </p>
          <div className="flex items-baseline gap-1 mb-8">
            <span className="text-4xl font-bold">$0</span>
            <span className="text-zinc-400 text-sm">/forever</span>
          </div>
          <ul className="space-y-3 mb-8">
            {[
              "Read all free articles",
              "Bilingual reader with settings",
              "Create & submit articles",
              "Preview of premium articles",
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-400">
                <Check className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <div className="text-center text-sm text-zinc-400 font-medium py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl">
            Current Plan
          </div>
        </div>

        {/* Pro Plan */}
        <div className="relative rounded-2xl border-2 border-amber-400 dark:border-amber-500 bg-white dark:bg-zinc-900 p-8 shadow-xl shadow-amber-100/50 dark:shadow-amber-900/10">
          {/* Popular badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
              <Crown className="w-3 h-3" />
              MOST POPULAR
            </span>
          </div>

          <h3 className="text-lg font-semibold mb-1 mt-2">Pro</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
            Unlock everything
          </p>
          <div className="flex items-baseline gap-1 mb-8">
            <span className="text-4xl font-bold text-amber-600 dark:text-amber-400">$9.99</span>
            <span className="text-zinc-400 text-sm">/month</span>
          </div>
          <ul className="space-y-3 mb-8">
            {[
              { text: "Everything in Free", icon: Check },
              { text: "Unlimited premium articles", icon: BookOpen },
              { text: "Support creators directly", icon: DollarSign },
              { text: "Ad-free experience", icon: Shield },
              { text: "Early access to new features", icon: Zap },
            ].map(({ text, icon: Icon }) => (
              <li key={text} className="flex items-start gap-2.5 text-sm text-zinc-700 dark:text-zinc-300">
                <Icon className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                {text}
              </li>
            ))}
          </ul>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 mb-4 text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleSubscribe}
            disabled={subscribing}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-amber-200/40 dark:shadow-amber-900/20 hover:shadow-xl disabled:opacity-50"
          >
            {subscribing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Crown className="w-4 h-4" />
            )}
            {subscribing ? "Processing..." : "Upgrade to Pro"}
          </button>

          <p className="text-xs text-zinc-400 text-center mt-3">
            Mock payment — instantly activates Pro access
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: "What is a Premium article?",
              a: "Premium articles are high-quality bilingual content created by our community. Free users can preview the first few sentences, while Pro members get full access.",
            },
            {
              q: "How do creators earn money?",
              a: "Every time a Pro subscriber reads a premium article, the creator earns $0.05. This encourages high-quality content creation.",
            },
            {
              q: "Can I cancel anytime?",
              a: "Yes! You can cancel or re-subscribe at any time from your dashboard. No questions asked.",
            },
          ].map(({ q, a }) => (
            <div
              key={q}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
            >
              <h3 className="font-semibold text-sm mb-2">{q}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
