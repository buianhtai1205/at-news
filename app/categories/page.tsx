import Link from "next/link";
import { getCategoryService } from "@/src/infrastructure/container";
import { getArticleService } from "@/src/infrastructure/container";
import { Folder } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categoryService = getCategoryService();
  const articleService = getArticleService();

  const [categories, articles] = await Promise.all([
    categoryService.getAllCategories(),
    articleService.getPublishedArticles(),
  ]);

  const categoriesWithCount = categories.map((cat) => ({
    ...cat,
    articleCount: articles.filter((a) => a.categoryId === cat.id).length,
  }));

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Categories</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Browse articles by topic.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categoriesWithCount.map((cat) => (
          <Link
            key={cat.id}
            href={`/articles?category=${cat.slug}`}
            className="group flex items-start gap-4 p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center shrink-0">
              <Folder className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {cat.name}
              </h3>
              {cat.description && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{cat.description}</p>
              )}
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
                {cat.articleCount} {cat.articleCount === 1 ? "article" : "articles"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
