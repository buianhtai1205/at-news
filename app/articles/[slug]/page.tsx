import { BilingualReader } from "@/src/components/articles/BilingualReader";
import { PaywallOverlay } from "@/src/components/articles/PaywallOverlay";
import { ArrowLeft, Clock, Tag, User, Crown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getArticleService } from "@/src/infrastructure/container";
import { getProfileRepo } from "@/src/infrastructure/container";
import { getAuthUser } from "@/src/infrastructure/auth/middleware";
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

  if (!article) {
    notFound();
  }

  // ─── Server-side auth & role check ─────────────────────────
  const authUser = await getAuthUser();
  const profileRepo = getProfileRepo();
  let profile = null;

  if (authUser) {
    profile = await profileRepo.findByUserId(authUser.sub);
  }

  const isAdmin = authUser?.role === "ADMIN";
  const isAuthor = !!authUser && authUser.sub === article.authorId;
  const isSubscribed = profile?.isSubscribed ?? false;

  // ─── Visibility gate (status check) ───────────────────────
  // Non-APPROVED articles are only visible to Admins and the Author
  if (article.status !== "APPROVED" && !isAdmin && !isAuthor) {
    notFound();
  }

  // ─── Premium content access (Bypass Paywall) ──────────────
  // Full content is accessible if user is Admin, Author, or Subscribed
  const canAccessFullContent =
    !article.isPremium || isAdmin || isAuthor || isSubscribed;

  // Record premium view & credit creator (only for subscribed, non-author, non-admin users)
  if (authUser && isSubscribed && article.isPremium && !isAdmin && !isAuthor) {
    try {
      await profileRepo.recordPremiumView(article.id, authUser.sub);
    } catch {
      // Non-critical — don't block page render
    }
  }

  const showPaywall = !canAccessFullContent;
  const freeContentLimit = article.premiumStartIndex ?? 3;
  const visibleContent = showPaywall
    ? article.content.slice(0, freeContentLimit)
    : article.content;
  const lockedContent = showPaywall
    ? article.content.slice(freeContentLimit)
    : [];

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
          {article.isPremium && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-3 py-1.5 rounded-full">
              <Crown className="w-3 h-3" />
              Premium
            </span>
          )}
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

      {/* Bilingual Reader — visible content */}
      <BilingualReader content={visibleContent} />

      {/* Paywall overlay for locked content */}
      {showPaywall && lockedContent.length > 0 && (
        <PaywallOverlay
          lockedCount={lockedContent.length}
          totalCount={article.content.length}
          isLoggedIn={!!authUser}
        />
      )}
    </article>
  );
}
