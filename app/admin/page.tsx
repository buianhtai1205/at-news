"use client";

import { useAuth } from "@/src/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  Loader2,
  Check,
  X,
  Trash2,
  Clock,
  FileText,
  AlertCircle,
} from "lucide-react";

interface Article {
  id: string;
  slug: string;
  title: string;
  authorId: string;
  categoryId: string;
  status: string;
  content: { en: string; vi: string }[];
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("APPLIED");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    try {
      const res = await fetch(`/api/articles?status=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      setLoading(true);
      fetchArticles();
    }
  }, [user, activeTab, fetchArticles]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/articles/${id}/approve`, { method: "POST" });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/articles/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
        setRejectId(null);
        setRejectReason("");
      }
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  const tabs = ["APPLIED", "APPROVED", "REJECTED", "DRAFT"];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage articles and moderation</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            {tab === "APPLIED" && <Clock className="w-4 h-4 inline mr-1.5" />}
            {tab === "APPROVED" && <Check className="w-4 h-4 inline mr-1.5" />}
            {tab === "REJECTED" && <AlertCircle className="w-4 h-4 inline mr-1.5" />}
            {tab === "DRAFT" && <FileText className="w-4 h-4 inline mr-1.5" />}
            {tab === "APPLIED" ? "Pending Review" : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Articles List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <FileText className="w-10 h-10 mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
          <p>No {activeTab.toLowerCase()} articles</p>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{article.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                    <span>{article.content.length} sentences</span>
                    <span>•</span>
                    <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                  </div>
                  {article.rejectionReason && (
                    <div className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-lg">
                      Rejection reason: {article.rejectionReason}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {activeTab === "APPLIED" && (
                    <>
                      <button
                        onClick={() => handleApprove(article.id)}
                        disabled={actionLoading === article.id}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === article.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          rejectId === article.id
                            ? setRejectId(null)
                            : setRejectId(article.id)
                        }
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                      >
                        <X className="w-3 h-3" />
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(article.id)}
                    disabled={actionLoading === article.id}
                    className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Reject Form */}
              {rejectId === article.id && (
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection..."
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    onClick={() => handleReject(article.id)}
                    disabled={actionLoading === article.id || !rejectReason.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    Confirm
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
