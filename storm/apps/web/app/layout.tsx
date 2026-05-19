import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteHeader } from "../components/domain/SiteHeader";
import { Providers } from "../store/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Storm",
  description: "Storm — Flipkart-style e-commerce platform",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SiteHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
