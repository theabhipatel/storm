"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const COOKIE_NAME = "cookie_consent";
const ONE_YEAR_DAYS = 365;

function hasConsent(): boolean {
  if (typeof document === "undefined") return true;
  return document.cookie
    .split(";")
    .some((c) => c.trim().startsWith(`${COOKIE_NAME}=accepted`));
}

function setConsentCookie(): void {
  const maxAge = ONE_YEAR_DAYS * 24 * 60 * 60;
  document.cookie = `${COOKIE_NAME}=accepted; path=/; max-age=${maxAge}; samesite=lax`;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasConsent()) setVisible(true);
  }, []);

  if (!visible) return null;

  function accept(): void {
    setConsentCookie();
    setVisible(false);
  }

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white shadow-lg"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 text-sm text-neutral-700 sm:flex-row sm:items-center sm:gap-4 sm:px-6 lg:px-8">
        <p className="flex-1">
          We use essential cookies for sign-in and your cart. By continuing you
          accept our use of these cookies.{" "}
          <Link href="/privacy-policy" className="font-medium underline-offset-2 hover:underline">
            Learn more
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <Link
            href="/privacy-policy"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:border-neutral-400"
          >
            Learn more
          </Link>
          <button
            type="button"
            onClick={accept}
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
