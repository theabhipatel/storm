import Link from "next/link";

import { fetchCategoryTree, type CategoryNode } from "../../lib/serverFetch";
import { CategoryMenuItem } from "./CategoryMenuItem";

export async function CategoryMenu() {
  let tree: CategoryNode[] = [];
  try {
    tree = await fetchCategoryTree();
  } catch {
    // Soft fail — keep the strip empty if catalog is unreachable.
  }
  const topLevel = tree.filter((c) => c.parentId === null).slice(0, 10);

  if (topLevel.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Categories"
      className="hidden border-b border-border bg-surface shadow-sm md:block"
    >
      <ul className="no-scrollbar mx-auto flex max-w-page items-stretch gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
        {topLevel.map((cat) => (
          <CategoryMenuItem
            key={cat.id}
            node={cat}
            subcategories={cat.children ?? []}
          />
        ))}
        <li className="ml-auto flex items-center py-2.5">
          <Link
            href="/search"
            className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-primary hover:text-primary-hover"
          >
            All products →
          </Link>
        </li>
      </ul>
    </nav>
  );
}
