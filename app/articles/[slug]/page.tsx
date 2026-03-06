import { BilingualReader } from "@/src/components/articles/BilingualReader";
import { ArrowLeft, Clock, Tag, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getArticleService } from "@/src/infrastructure/container";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  
  let article;
  try {
    article = await getArticleService().getArticleBySlug(slug);
  } catch {
    notFound();
  }

  if (!article || article.status !== "APPROVED") {
    notFound();
  }

  const readTime = Math.max(1, Math.ceil(article.content.length / 3));
  const date = new Date(article.createdAt).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back link */}
      <Link
        href="/articles"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to articles
      </Link>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-3 py-1.5 rounded-full">
            <Tag className="w-3 h-3" />
            {article.categoryName}
          </span>
          <span className="flex items-center gap-1 text-xs text-zinc-400">
            <Clock className="w-3 h-3" />
            {readTime} min read
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-balance">
          {article.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="font-medium">{article.authorName}</span>
          </div>
          <span>•</span>
          <time>{date}</time>
        </div>
      </header>

      {/* Cover Image */}
      {article.coverImageUrl && (
        <div className="relative aspect-[2/1] rounded-2xl overflow-hidden mb-10">
          <Image
            src={article.coverImageUrl}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
            priority
          />
        </div>
      )}

      {/* Bilingual Reader */}
      <BilingualReader content={article.content} />
    </article>
  );
}
