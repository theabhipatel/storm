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
  const topLevel = tree.filter((c) => c.parentId === null).slice(0, 8);

  if (topLevel.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Categories"
      className="hidden border-b border-neutral-200 bg-white md:block"
    >
      <ul className="mx-auto flex max-w-6xl items-stretch gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
        {topLevel.map((cat) => (
          <CategoryMenuItem
            key={cat.id}
            node={cat}
            subcategories={cat.children ?? []}
          />
        ))}
        <li className="ml-auto py-2.5">
          <Link
            href="/search"
            className="text-xs font-medium text-neutral-500 hover:text-neutral-900"
          >
            All products →
          </Link>
        </li>
      </ul>
    </nav>
  );
}
