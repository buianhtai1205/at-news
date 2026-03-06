"use client";

import { useAuth } from "@/src/components/auth/AuthProvider";
import { ArticleForm } from "@/src/components/articles/ArticleForm";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface ArticleData {
  id: string;
  title: string;
  categoryId: string;
  coverImageUrl?: string;
  content: { en: string; vi: string }[];
  status: string;
}

export default function CreateArticlePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [articleData, setArticleData] = useState<ArticleData | null>(null);
  const [loadingArticle, setLoadingArticle] = useState(!!editId);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!editId || !user) return;

    setLoadingArticle(true);
    setLoadError("");

    fetch(`/api/articles/${editId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load article");
        return res.json();
      })
      .then((data) => {
        const a = data.article;
        // Security: only load if the article belongs to this user
        if (a.authorId !== user.id) {
          router.push("/dashboard/articles");
          return;
        }
        setArticleData({
          id: a.id,
          title: a.title,
          categoryId: a.categoryId,
          coverImageUrl: a.coverImageUrl ?? "",
          content: a.content,
          status: a.status,
        });
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoadingArticle(false));
  }, [editId, user, router]);

  if (loading || loadingArticle) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!user) return null;

  if (loadError) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
          {loadError}
        </div>
      </div>
    );
  }

  const isEdit = !!editId && !!articleData;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {isEdit ? "Edit Article" : "Write New Article"}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          {isEdit
            ? "Update your article content and re-submit for review when ready."
            : "Create a bilingual article with English and Vietnamese content. Articles will be reviewed before publishing."}
        </p>
      </div>

      <ArticleForm mode={isEdit ? "edit" : "create"} initialData={articleData ?? undefined} />
    </div>
  );
}

