"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { CategoryNode } from "../../lib/serverFetch";

export function CategoryMenuItem({
  node,
  subcategories,
}: {
  node: CategoryNode;
  subcategories: CategoryNode[];
}) {
  const [open, setOpen] = useState(false);
  const hasSubs = subcategories.length > 0;

  return (
    <li
      className="relative"
      onMouseEnter={() => hasSubs && setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={`/c/${node.slug}`}
        className="flex h-full items-center gap-1 whitespace-nowrap px-3 py-3 text-sm font-medium text-text hover:text-primary"
        aria-haspopup={hasSubs}
        aria-expanded={hasSubs ? open : undefined}
        onFocus={() => hasSubs && setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {node.name}
        {hasSubs ? (
          <ChevronDown className="h-3.5 w-3.5 text-text-subtle" />
        ) : null}
      </Link>
      {hasSubs && open ? (
        <div className="absolute left-0 top-full z-30 min-w-[240px] rounded-md border border-border bg-surface p-2 shadow-elevated">
          <ul className="grid grid-cols-1 gap-0.5">
            {subcategories.map((sc) => (
              <li key={sc.id}>
                <Link
                  href={`/c/${sc.slug}`}
                  className="block rounded px-3 py-2 text-sm text-text hover:bg-primary-soft hover:text-primary"
                >
                  {sc.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}
