import { useState } from "react";

import { AdminShell } from "../components/AdminShell";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useListCategoryTreeQuery,
  useUpdateCategoryMutation,
  type CategoryTreeNode,
} from "../features/catalog/catalog.api";

export function CatalogCategoriesPage() {
  const { data, isFetching } = useListCategoryTreeQuery();
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [newName, setNewName] = useState("");
  const [newParent, setNewParent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  // dragId is the category being dragged. Drop is only allowed onto a sibling
  // (same parentId) to keep the parent relationship intact.
  const [dragId, setDragId] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createCategory({
        name: newName,
        parentId: newParent || null,
      }).unwrap();
      setNewName("");
      setNewParent("");
    } catch (err) {
      setError(asMessage(err));
    }
  }

  async function rename(id: string) {
    const next = prompt("New name?");
    if (!next) return;
    try {
      await updateCategory({ id, data: { name: next } }).unwrap();
    } catch (err) {
      setError(asMessage(err));
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this category?")) return;
    try {
      await deleteCategory(id).unwrap();
    } catch (err) {
      setError(asMessage(err));
    }
  }

  async function dropOn(targetId: string, position: "before" | "after") {
    if (!dragId || dragId === targetId || !data) {
      setDragId(null);
      return;
    }
    const siblings = siblingsOf(data.items, targetId);
    if (!siblings.some((s) => s.id === dragId)) {
      // Cross-parent drag — not supported in Stage 1 for safety.
      setDragId(null);
      return;
    }
    const without = siblings.filter((s) => s.id !== dragId);
    const targetIdx = without.findIndex((s) => s.id === targetId);
    const insertAt = position === "before" ? targetIdx : targetIdx + 1;
    const moved = siblings.find((s) => s.id === dragId)!;
    without.splice(insertAt, 0, moved);
    setDragId(null);

    for (const [i, s] of without.entries()) {
      if (s.order !== i) {
        try {
          await updateCategory({ id: s.id, data: { order: i } }).unwrap();
        } catch (err) {
          setError(asMessage(err));
          return;
        }
      }
    }
  }

  return (
    <AdminShell title="Catalog · Categories">
      <div className="space-y-4">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <form
          onSubmit={add}
          className="flex flex-wrap items-end gap-2 rounded-md border border-neutral-200 bg-white p-3 shadow-sm"
        >
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              New category
            </label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Smartphones"
              required
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Parent
            </label>
            <select
              value={newParent}
              onChange={(e) => setNewParent(e.target.value)}
              className="mt-1 block w-56 rounded-md border border-neutral-300 px-3 py-2 text-sm"
            >
              <option value="">— root —</option>
              {flatten(data?.items ?? []).map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white"
          >
            Add
          </button>
        </form>

        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          {isFetching && <p className="text-sm text-neutral-500">Loading…</p>}
          {data && data.items.length === 0 && (
            <p className="text-sm text-neutral-500">No categories yet.</p>
          )}
          <p className="mb-2 text-xs text-neutral-500">
            Drag a category onto a sibling to reorder.
          </p>
          <ul className="space-y-1">
            {(data?.items ?? []).map((n) => (
              <Node
                key={n.id}
                node={n}
                depth={0}
                dragId={dragId}
                setDragId={setDragId}
                onRename={rename}
                onDelete={remove}
                onDrop={dropOn}
              />
            ))}
          </ul>
        </div>
      </div>
    </AdminShell>
  );
}

function Node({
  node,
  depth,
  dragId,
  setDragId,
  onRename,
  onDelete,
  onDrop,
}: {
  node: CategoryTreeNode;
  depth: number;
  dragId: string | null;
  setDragId: (id: string | null) => void;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
  onDrop: (targetId: string, position: "before" | "after") => void;
}) {
  return (
    <li>
      <div
        draggable
        onDragStart={(e) => {
          e.stopPropagation();
          setDragId(node.id);
        }}
        onDragEnd={() => setDragId(null)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // Drop on the upper half = insert before, lower half = insert after.
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          const half = rect.top + rect.height / 2;
          onDrop(node.id, e.clientY < half ? "before" : "after");
        }}
        className={
          "flex cursor-move items-center gap-2 rounded-md px-2 py-1 hover:bg-neutral-50 " +
          (dragId === node.id ? "opacity-50" : "")
        }
        style={{ paddingLeft: `${depth * 16}px` }}
      >
        <span className="text-neutral-400">⋮⋮</span>
        <span className="font-medium text-neutral-900">{node.name}</span>
        <span className="font-mono text-xs text-neutral-500">/{node.slug}</span>
        <span className="ml-auto flex gap-1 text-xs">
          <button
            onClick={() => onRename(node.id)}
            className="rounded border border-neutral-300 px-2 py-0.5"
          >
            Rename
          </button>
          <button
            onClick={() => onDelete(node.id)}
            className="rounded border border-red-300 px-2 py-0.5 text-red-700 hover:bg-red-50"
          >
            Delete
          </button>
        </span>
      </div>
      {node.children.length > 0 && (
        <ul className="space-y-1">
          {node.children.map((c) => (
            <Node
              key={c.id}
              node={c}
              depth={depth + 1}
              dragId={dragId}
              setDragId={setDragId}
              onRename={onRename}
              onDelete={onDelete}
              onDrop={onDrop}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function flatten(nodes: CategoryTreeNode[], depth = 0): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = [];
  for (const n of nodes) {
    out.push({ id: n.id, label: `${"—".repeat(depth)} ${n.name}`.trim() });
    out.push(...flatten(n.children, depth + 1));
  }
  return out;
}

function siblingsOf(roots: CategoryTreeNode[], childId: string): CategoryTreeNode[] {
  // If childId is a root, return roots; otherwise locate the parent and return its children.
  if (roots.some((r) => r.id === childId)) return roots;
  for (const r of roots) {
    if (r.children.some((c) => c.id === childId)) return r.children;
    const deeper = siblingsOf(r.children, childId);
    if (deeper.length > 0) return deeper;
  }
  return [];
}

function asMessage(err: unknown): string {
  if (typeof err === "object" && err && "data" in err) {
    const data = (err as { data?: { error?: { message?: string } } }).data;
    if (data?.error?.message) return data.error.message;
  }
  if (typeof err === "object" && err && "message" in err) {
    return String((err as { message?: string }).message);
  }
  return "Something went wrong.";
}
