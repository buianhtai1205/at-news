"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/components/auth/AuthProvider";
import {
  Loader2,
  DollarSign,
  Crown,
  TrendingUp,
  FileText,
  Wallet,
} from "lucide-react";

interface ProfileData {
  userId: string;
  isSubscribed: boolean;
  balance: number;
  subscribedAt: string | null;
}

interface Article {
  id: string;
  title: string;
  status: string;
  isPremium: boolean;
  createdAt: string;
}

export default function CreatorDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    Promise.all([
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/articles/mine").then((r) => r.json()),
    ])
      .then(([profileData, articlesData]) => {
        setProfile(profileData.profile);
        setArticles(articlesData.articles ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!user || !profile) return null;

  const premiumCount = articles.filter((a) => a.isPremium).length;
  const publishedCount = articles.filter((a) => a.status === "APPROVED").length;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Creator Dashboard</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Track your earnings and article performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {/* Balance */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-100 dark:from-emerald-950/40 to-transparent rounded-bl-full" />
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ${profile.balance.toFixed(2)}
          </p>
          <p className="text-xs text-zinc-400 mt-1">Earnings Balance</p>
        </div>

        {/* Subscription Status */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-amber-100 dark:from-amber-950/40 to-transparent rounded-bl-full" />
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-bold">
            {profile.isSubscribed ? (
              <span className="text-amber-600 dark:text-amber-400">Pro</span>
            ) : (
              <span className="text-zinc-400">Free</span>
            )}
          </p>
          <p className="text-xs text-zinc-400 mt-1">Subscription</p>
        </div>

        {/* Published Articles */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-100 dark:from-blue-950/40 to-transparent rounded-bl-full" />
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold">{publishedCount}</p>
          <p className="text-xs text-zinc-400 mt-1">Published</p>
        </div>

        {/* Premium Articles */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-100 dark:from-purple-950/40 to-transparent rounded-bl-full" />
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold">{premiumCount}</p>
          <p className="text-xs text-zinc-400 mt-1">Premium Articles</p>
        </div>
      </div>

      {/* Earnings Info */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-lg font-semibold">How Earnings Work</h2>
        </div>
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
          <p>
            When a <strong className="text-amber-600 dark:text-amber-400">Pro subscriber</strong> reads one of your{" "}
            <strong>premium articles</strong>, you earn <strong className="text-emerald-600 dark:text-emerald-400">$0.05</strong> per unique view.
          </p>
          <p>
            Each subscriber can only generate one view per article — no duplicate earnings.
            Earnings are tracked automatically and added to your balance.
          </p>
          <div className="flex items-center gap-2 mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
            <Crown className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-amber-700 dark:text-amber-300 text-xs">
              Tip: Mark your best articles as Premium to start earning.
            </p>
          </div>
        </div>
      </div>

      {/* Premium Articles List */}
      {premiumCount > 0 && (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold mb-4">Your Premium Articles</h2>
          <div className="space-y-3">
            {articles
              .filter((a) => a.isPremium)
              .map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-sm font-medium truncate">{article.title}</span>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    article.status === "APPROVED"
                      ? "bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                  }`}>
                    {article.status === "APPROVED" ? "Live" : article.status}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
