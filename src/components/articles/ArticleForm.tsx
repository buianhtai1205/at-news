"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/src/components/auth/AuthProvider";

interface BilingualPair {
  en: string;
  vi: string;
}

interface Category {
  id: string;
  name: string;
}

interface ArticleFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: string;
    title: string;
    categoryId: string;
    coverImageUrl?: string;
    content: BilingualPair[];
  };
}

export function ArticleForm({ mode, initialData }: ArticleFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImageUrl ?? "");
  const [content, setContent] = useState<BilingualPair[]>(
    initialData?.content ?? [{ en: "", vi: "" }]
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  const addPair = () => setContent([...content, { en: "", vi: "" }]);
  const removePair = (index: number) => {
    if (content.length <= 1) return;
    setContent(content.filter((_, i) => i !== index));
  };
  const updatePair = (index: number, lang: "en" | "vi", value: string) => {
    const updated = [...content];
    updated[index] = { ...updated[index], [lang]: value };
    setContent(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const body = { title, categoryId, coverImageUrl, content };
      const url = mode === "edit" ? `/api/articles/${initialData?.id}` : "/api/articles";
      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.detail || "Failed to save article");
      }

      const data = await res.json();
      router.push(`/articles/${data.article.slug}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-2">Article Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter article title..."
          required
          className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
        />
      </div>

      {/* Category + Cover Image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select a category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Cover Image URL (optional)</label>
          <input
            type="url"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://picsum.photos/seed/..."
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Bilingual Content */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium">Bilingual Content</label>
          <button
            type="button"
            onClick={addPair}
            className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            <Plus className="w-4 h-4" /> Add Sentence
          </button>
        </div>

        <div className="space-y-4">
          {content.map((pair, index) => (
            <div
              key={index}
              className="group relative grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800"
            >
              <div className="absolute -top-2.5 left-3 bg-zinc-50 dark:bg-zinc-900 px-2 text-xs text-zinc-400 font-mono">
                #{index + 1}
              </div>
              <textarea
                value={pair.en}
                onChange={(e) => updatePair(index, "en", e.target.value)}
                placeholder="English text..."
                required
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
              />
              <textarea
                value={pair.vi}
                onChange={(e) => updatePair(index, "vi", e.target.value)}
                placeholder="Vietnamese text..."
                required
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
              />
              {content.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePair(index)}
                  className="absolute top-2 right-2 p-1.5 text-zinc-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {mode === "create" ? "Submit for Review" : "Update Article"}
        </button>
      </div>
    </form>
  );
}
