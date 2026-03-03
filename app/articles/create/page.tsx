"use client";

import { useAuth } from "@/src/components/auth/AuthProvider";
import { ArticleForm } from "@/src/components/articles/ArticleForm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function CreateArticlePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Write New Article</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Create a bilingual article with English and Vietnamese content. Articles will be reviewed before publishing.
        </p>
      </div>

      <ArticleForm mode="create" />
    </div>
  );
}
