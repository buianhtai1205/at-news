"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/src/components/auth/AuthProvider";
import {
  Loader2,
  PenLine,
  Plus,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Trash2,
} from "lucide-react";

type ArticleStatus = "DRAFT" | "APPLIED" | "APPROVED" | "REJECTED" | "DELETED";

interface Article {
  id: string;
  slug: string;
  title: string;
  status: ArticleStatus;
  categoryName?: string;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ArticleStatus,
  { label: string; className: string; icon: React.ElementType }
> = {
  DRAFT: {
    label: "Draft",
    className:
      "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700",
    icon: FileText,
  },
  APPLIED: {
    label: "Pending Review",
    className:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
    icon: Clock,
  },
  APPROVED: {
    label: "Published",
    className:
      "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-300 border border-green-200 dark:border-green-800",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    className:
      "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800",
    icon: XCircle,
  },
  DELETED: {
    label: "Deleted",
    className:
      "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-700",
    icon: Trash2,
  },
};

function StatusBadge({ status }: { status: ArticleStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${config.className}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyArticlesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [articles, setArticles] = useState<Article[]>([]);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    fetch("/api/articles/mine")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load articles");
        return res.json();
      })
      .then((data) => setArticles(data.articles ?? []))
      .catch((err) => setFetchError(err.message))
      .finally(() => setFetching(false));
  }, [user]);

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">My Articles</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Manage your drafts and track the review status of submitted articles.
          </p>
        </div>
        <Link
          href="/articles/create"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Article
        </Link>
      </div>

      {fetchError && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {fetchError}
        </div>
      )}

      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <FileText className="w-8 h-8 text-zinc-400" />
          </div>
          <div>
            <p className="font-medium text-zinc-700 dark:text-zinc-300">No articles yet</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Start writing your first bilingual article.
            </p>
          </div>
          <Link
            href="/articles/create"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Write Article
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {articles.map((article) => (
            <ArticleRow key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Article Row ──────────────────────────────────────────────────────────────

function ArticleRow({ article }: { article: Article }) {
  const canEdit =
    article.status === "DRAFT" ||
    article.status === "REJECTED";

  const formattedDate = new Date(article.createdAt).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="group p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
      {/* Top row: title + badge + actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate leading-snug">
              {article.title}
            </h2>
            <StatusBadge status={article.status} />
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            {article.categoryName && (
              <span className="font-medium">{article.categoryName}</span>
            )}
            <span>·</span>
            <span>Created {formattedDate}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {article.status === "APPROVED" && (
            <Link
              href={`/articles/${article.slug}`}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline px-3 py-1.5"
            >
              View
            </Link>
          )}
          {canEdit && (
            <Link
              href={`/articles/create?id=${article.id}`}
              className="flex items-center gap-1.5 text-xs font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              <PenLine className="w-3.5 h-3.5" />
              Edit
            </Link>
          )}
        </div>
      </div>

      {/* Rejection reason */}
      {article.status === "REJECTED" && article.rejectionReason && (
        <div className="mt-3 flex items-start gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
          <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-0.5">
              Rejection reason
            </p>
            <p className="text-sm text-red-600 dark:text-red-400">
              {article.rejectionReason}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
