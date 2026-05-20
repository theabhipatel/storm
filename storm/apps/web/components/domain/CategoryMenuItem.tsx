"use client";

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
        className="flex h-full items-center px-3 py-2.5 text-sm font-medium text-neutral-700 hover:text-neutral-900"
        aria-haspopup={hasSubs}
        aria-expanded={hasSubs ? open : undefined}
        onFocus={() => hasSubs && setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {node.name}
      </Link>
      {hasSubs && open ? (
        <div className="absolute left-0 top-full z-30 min-w-[220px] rounded-md border border-neutral-200 bg-white p-2 shadow-lg">
          <ul className="grid grid-cols-1 gap-1">
            {subcategories.map((sc) => (
              <li key={sc.id}>
                <Link
                  href={`/c/${sc.slug}`}
                  className="block rounded px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
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
