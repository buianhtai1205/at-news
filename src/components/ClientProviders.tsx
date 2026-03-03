"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@/src/components/ui/ThemeProvider";
import { AuthProvider } from "@/src/components/auth/AuthProvider";
import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
