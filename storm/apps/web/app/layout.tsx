import type { Metadata } from "next";
import type { ReactNode } from "react";

import { CategoryMenu } from "../components/domain/CategoryMenu";
import { CookieConsent } from "../components/domain/CookieConsent";
import { SiteFooter } from "../components/domain/SiteFooter";
import { SiteHeader } from "../components/domain/SiteHeader";
import { Toaster } from "../components/ui/Toaster";
import { fetchCategoryTree, type CategoryNode } from "../lib/serverFetch";
import { Providers } from "../store/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Storm",
  description: "Storm — Flipkart-style e-commerce platform",
};

async function loadDrawerCategories() {
  try {
    const tree = await fetchCategoryTree();
    return tree
      .filter((c: CategoryNode) => c.parentId === null)
      .slice(0, 12)
      .map(({ id, name, slug }) => ({ id, name, slug }));
  } catch {
    return [];
  }
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const drawerCategories = await loadDrawerCategories();
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-neutral-900 focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to content
        </a>
        <Providers>
          <SiteHeader drawerCategories={drawerCategories} />
          <CategoryMenu />
          <div id="main-content">{children}</div>
          <SiteFooter />
          <Toaster />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
