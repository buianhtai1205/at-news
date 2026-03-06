"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { ArticleCard } from "./ArticleCard";

interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  authorName: string;
  coverImageUrl?: string;
  contentLength: number;
  createdAt: string;
  isPremium?: boolean;
}

interface ArticlesFilterProps {
  articles: ArticleItem[];
  categories: { id: string; name: string }[];
}

export function ArticlesFilter({ articles, categories }: ArticlesFilterProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        !search ||
        article.title.toLowerCase().includes(search.toLowerCase()) ||
        article.authorName.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !selectedCategory || article.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [articles, search, selectedCategory]);

  return (
    <>
      {/* Search */}
      <div className="relative w-full md:w-80 mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-zinc-400" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles..."
          className="block w-full pl-10 pr-3 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-colors"
        />
      </div>

      {/* Categories Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            !selectedCategory
              ? "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900"
              : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900"
                : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((article) => (
            <ArticleCard key={article.id} {...article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-zinc-500 dark:text-zinc-400">No articles found matching your criteria.</p>
        </div>
      )}
    </>
  );
}
