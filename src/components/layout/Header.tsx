"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, PenSquare, LayoutDashboard, Crown } from "lucide-react";
import { ThemeToggle } from "@/src/components/ui/ThemeToggle";
import { useAuth } from "@/src/components/auth/AuthProvider";

export function Header() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo-at-news2.png"
            alt="AT-News"
            width={180}
            height={48}
            className="h-12 w-auto"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <Link href="/articles" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Articles
          </Link>
          <Link href="/categories" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Categories
          </Link>
          <Link href="/pricing" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            Pricing
          </Link>
          {user?.role === "ADMIN" && (
            <Link href="/admin" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Admin
            </Link>
          )}
          {user && (
            <Link href="/dashboard/articles" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              My Articles
            </Link>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <>
              <Link
                href="/articles/create"
                className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                <PenSquare className="w-4 h-4" />
                Write
              </Link>
              <Link
                href="/dashboard/articles"
                className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                My Articles
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
              >
                <Crown className="w-4 h-4" />
                Earnings
              </Link>
              <div className="flex items-center gap-3 pl-3 border-l border-zinc-200 dark:border-zinc-700">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">{user.name}</span>
                <button
                  onClick={logout}
                  className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  Log out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-4 space-y-3">
          <Link href="/articles" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>
            Articles
          </Link>
          <Link href="/categories" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>
            Categories
          </Link>
          <Link href="/pricing" className="block text-sm font-medium py-2 flex items-center gap-1" onClick={() => setMobileOpen(false)}>
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            Pricing
          </Link>
          {user?.role === "ADMIN" && (
            <Link href="/admin" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>
              Admin Dashboard
            </Link>
          )}
          <hr className="border-zinc-200 dark:border-zinc-800" />
          {user ? (
            <>
              <Link
                href="/articles/create"
                className="block text-sm font-medium text-indigo-600 dark:text-indigo-400 py-2"
                onClick={() => setMobileOpen(false)}
              >
                Write Article
              </Link>
              <Link
                href="/dashboard/articles"
                className="block text-sm font-medium py-2"
                onClick={() => setMobileOpen(false)}
              >
                My Articles
              </Link>
              <Link
                href="/dashboard"
                className="block text-sm font-medium py-2 text-amber-600 dark:text-amber-400"
                onClick={() => setMobileOpen(false)}
              >
                Earnings
              </Link>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-zinc-500">{user.name} ({user.role})</span>
                <button onClick={logout} className="text-sm text-red-500">
                  Log out
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-3 py-2">
              <Link href="/login" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>
                Log in
              </Link>
              <Link
                href="/register"
                className="bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 px-4 py-1.5 rounded-full text-sm font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
