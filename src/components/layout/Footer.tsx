import { Globe } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-lg mb-3">
              <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>AT-News</span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
              A bilingual news platform helping you learn English naturally through side-by-side
              English and Vietnamese articles.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Explore</h4>
            <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              <li><Link href="/articles" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">All Articles</Link></li>
              <li><Link href="/categories" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Categories</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
              <li><Link href="/login" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Log in</Link></li>
              <li><Link href="/register" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Sign up</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400 dark:text-zinc-500">
          &copy; {new Date().getFullYear()} AT-News. Built for learning.
        </div>
      </div>
    </footer>
  );
}
