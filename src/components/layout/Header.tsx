"use client";

import Link from "next/link";
import { useState } from "react";
import { Globe, Menu, X, PenSquare } from "lucide-react";
import { ThemeToggle } from "@/src/components/ui/ThemeToggle";
import { useAuth } from "@/src/components/auth/AuthProvider";

export function Header() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Globe className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span>AT-News</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <Link href="/articles" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Articles
          </Link>
          <Link href="/categories" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Categories
          </Link>
          {user?.role === "ADMIN" && (
            <Link href="/admin" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Dashboard
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
          {user?.role === "ADMIN" && (
            <Link href="/admin" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>
              Dashboard
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
