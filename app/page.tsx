import Link from "next/link";
import { ArrowRight, BookOpen, Globe2, Languages, Sparkles } from "lucide-react";
import { getArticleService } from "@/src/infrastructure/container";
import { ArticleCard } from "@/src/components/articles/ArticleCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const service = getArticleService();
  const articles = await service.getPublishedArticles();
  const latestArticles = articles
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div>
      {/* Hero Section */}
      <section className="py-24 md:py-32 px-4 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          Bilingual Reading Experience
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-balance">
          Learn English Naturally with{" "}
          <span className="text-indigo-600 dark:text-indigo-400">Bilingual News</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-10 text-balance max-w-2xl mx-auto">
          Read the latest global news with side-by-side English and Vietnamese translations. Improve your vocabulary and comprehension effortlessly.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/articles"
            className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-full font-medium hover:bg-indigo-700 transition-colors w-full sm:w-auto justify-center"
          >
            <BookOpen className="w-5 h-5" />
            Start Reading
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 px-8 py-4 rounded-full font-medium hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors w-full sm:w-auto justify-center"
          >
            Create Account
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Languages className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-semibold mb-2">Side-by-Side Reading</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              English and Vietnamese side by side. Learn new words in context naturally.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Globe2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold mb-2">Real-World News</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Stay updated with current events while building language skills.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold mb-2">Custom Reader</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Adjust font, size, layout, and spacing for your perfect reading experience.
            </p>
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="py-16 px-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Latest Articles</h2>
            <Link
              href="/articles"
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {latestArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  slug={article.slug}
                  title={article.title}
                  categoryName={article.categoryName}
                  categorySlug={article.categorySlug}
                  authorName={article.authorName}
                  coverImageUrl={article.coverImageUrl}
                  contentLength={article.content.length}
                  createdAt={article.createdAt}
                  isPremium={article.isPremium}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-zinc-500 py-12">No articles published yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
