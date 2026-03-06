import { getArticleService } from "@/src/infrastructure/container";
import { getCategoryService } from "@/src/infrastructure/container";
import { ArticleCard } from "@/src/components/articles/ArticleCard";
import { ArticlesFilter } from "@/src/components/articles/ArticlesFilter";

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const articleService = getArticleService();
  const categoryService = getCategoryService();

  const [articles, categories] = await Promise.all([
    articleService.getPublishedArticles(),
    categoryService.getAllCategories(),
  ]);

  const sortedArticles = articles.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Explore Articles</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
          Read bilingual news articles across various categories to improve your English vocabulary and comprehension.
        </p>
      </div>

      <ArticlesFilter
        articles={sortedArticles.map((a) => ({
          id: a.id,
          slug: a.slug,
          title: a.title,
          categoryId: a.categoryId,
          categoryName: a.categoryName,
          categorySlug: a.categorySlug,
          authorName: a.authorName,
          coverImageUrl: a.coverImageUrl,
          contentLength: a.content.length,
          createdAt: a.createdAt,
          isPremium: a.isPremium,
        }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
