"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { IconButton } from "./IconButton";

interface RailProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  seeAllHref?: string;
  seeAllLabel?: string;
  children: ReactNode;
  className?: string;
}

export function Rail({
  title,
  subtitle,
  seeAllHref,
  seeAllLabel = "See all",
  children,
  className = "",
}: RailProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateButtons = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateButtons();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    return () => {
      el.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, [updateButtons]);

  function scrollBy(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" });
  }

  const showHeader = title || seeAllHref;

  return (
    <section className={`bg-surface ${className}`}>
      {showHeader ? (
        <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-4 sm:px-6">
          <div>
            {title ? (
              <h2 className="text-lg font-semibold text-text sm:text-xl">{title}</h2>
            ) : null}
            {subtitle ? (
              <p className="mt-0.5 text-sm text-text-muted">{subtitle}</p>
            ) : null}
          </div>
          {seeAllHref ? (
            <Link
              href={seeAllHref}
              className="hidden text-sm font-semibold text-primary hover:text-primary-hover sm:inline"
            >
              {seeAllLabel} →
            </Link>
          ) : null}
        </div>
      ) : null}
      <div className="relative">
        <div
          ref={scrollerRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-4 sm:px-6"
        >
          {children}
        </div>
        {canLeft ? (
          <div className="pointer-events-none absolute left-1 top-1/2 hidden -translate-y-1/2 md:block">
            <div className="pointer-events-auto">
              <IconButton
                aria-label="Scroll left"
                variant="outline"
                onClick={() => scrollBy(-1)}
                className="shadow-elevated"
              >
                <ChevronLeft className="h-5 w-5" />
              </IconButton>
            </div>
          </div>
        ) : null}
        {canRight ? (
          <div className="pointer-events-none absolute right-1 top-1/2 hidden -translate-y-1/2 md:block">
            <div className="pointer-events-auto">
              <IconButton
                aria-label="Scroll right"
                variant="outline"
                onClick={() => scrollBy(1)}
                className="shadow-elevated"
              >
                <ChevronRight className="h-5 w-5" />
              </IconButton>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
