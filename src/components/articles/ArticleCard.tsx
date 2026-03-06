import Link from "next/link";
import Image from "next/image";
import { Clock, Tag, Crown } from "lucide-react";

interface ArticleCardProps {
  slug: string;
  title: string;
  categoryName: string;
  categorySlug: string;
  authorName: string;
  coverImageUrl?: string;
  contentLength: number;
  createdAt: string;
  isPremium?: boolean;
}

export function ArticleCard({
  slug,
  title,
  categoryName,
  authorName,
  coverImageUrl,
  contentLength,
  createdAt,
  isPremium,
}: ArticleCardProps) {
  const readTime = Math.max(1, Math.ceil(contentLength / 3));
  const date = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/articles/${slug}`}
      className="group block bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300"
    >
      {/* Cover Image */}
      <div className="relative aspect-[16/9] bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 overflow-hidden">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-indigo-300 dark:text-indigo-700">
            AT
          </div>
        )}
        {isPremium && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
            <Crown className="w-3 h-3" />
            Premium
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-full">
            <Tag className="w-3 h-3" />
            {categoryName}
          </span>
          <span className="flex items-center gap-1 text-xs text-zinc-400">
            <Clock className="w-3 h-3" />
            {readTime} min read
          </span>
        </div>
        <h3 className="font-semibold text-lg leading-snug mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
          {title}
        </h3>
        <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
          <span>{authorName}</span>
          <span>{date}</span>
        </div>
      </div>
    </Link>
  );
}
