"use client";

import { Cookie } from "lucide-react";
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
      className="fixed inset-x-2 bottom-20 z-40 rounded-lg border border-border bg-surface shadow-elevated md:inset-x-auto md:bottom-6 md:left-6 md:right-6 md:mx-auto md:max-w-3xl"
    >
      <div className="flex flex-col gap-3 px-4 py-3 text-sm text-text sm:flex-row sm:items-center sm:gap-4 sm:px-5">
        <Cookie className="h-6 w-6 flex-shrink-0 text-primary" aria-hidden="true" />
        <p className="flex-1">
          We use essential cookies for sign-in and your cart.{" "}
          <Link
            href="/privacy-policy"
            className="font-semibold text-primary hover:text-primary-hover"
          >
            Learn more
          </Link>
        </p>
        <button
          type="button"
          onClick={accept}
          className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover sm:flex-shrink-0"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
