import { useEffect, useState } from "react";

type Value = string | number | boolean;
type Row = { id: string; key: string; type: "string" | "number" | "boolean"; value: string };

export function AttributeEditor({
  value,
  onChange,
}: {
  value: Record<string, Value>;
  onChange: (next: Record<string, Value>) => void;
}) {
  const [rows, setRows] = useState<Row[]>(() => toRows(value));

  // External resets (after server save) flow back in.
  useEffect(() => {
    setRows(toRows(value));
  }, [value]);

  function emit(next: Row[]) {
    const out: Record<string, Value> = {};
    for (const r of next) {
      const k = r.key.trim();
      if (!k) continue;
      if (r.type === "number") {
        const n = Number(r.value);
        if (!Number.isNaN(n)) out[k] = n;
      } else if (r.type === "boolean") {
        out[k] = r.value === "true";
      } else {
        out[k] = r.value;
      }
    }
    onChange(out);
  }

  function update(id: string, patch: Partial<Row>) {
    setRows((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, ...patch } : r));
      emit(next);
      return next;
    });
  }

  function add() {
    setRows((prev) => [
      ...prev,
      { id: crypto.randomUUID(), key: "", type: "string", value: "" },
    ]);
  }

  function remove(id: string) {
    setRows((prev) => {
      const next = prev.filter((r) => r.id !== id);
      emit(next);
      return next;
    });
  }

  return (
    <div className="space-y-2">
      {rows.length === 0 && (
        <p className="text-sm text-neutral-500">No attributes yet.</p>
      )}
      {rows.map((r) => (
        <div key={r.id} className="flex flex-wrap items-center gap-2">
          <input
            value={r.key}
            placeholder="key (e.g. ram)"
            onChange={(e) => update(r.id, { key: e.target.value })}
            className="w-40 rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          />
          <select
            value={r.type}
            onChange={(e) =>
              update(r.id, { type: e.target.value as Row["type"], value: "" })
            }
            className="w-28 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
          >
            <option value="string">string</option>
            <option value="number">number</option>
            <option value="boolean">boolean</option>
          </select>
          {r.type === "boolean" ? (
            <select
              value={r.value}
              onChange={(e) => update(r.id, { value: e.target.value })}
              className="w-28 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            >
              <option value="">--</option>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          ) : (
            <input
              type={r.type === "number" ? "number" : "text"}
              value={r.value}
              placeholder="value"
              onChange={(e) => update(r.id, { value: e.target.value })}
              className="flex-1 min-w-[160px] rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
            />
          )}
          <button
            type="button"
            onClick={() => remove(r.id)}
            className="rounded-md border border-neutral-300 px-2 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="rounded-md border border-dashed border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:border-neutral-400"
      >
        + Add attribute
      </button>
    </div>
  );
}

function toRows(value: Record<string, Value>): Row[] {
  return Object.entries(value).map(([k, v]) => ({
    id: crypto.randomUUID(),
    key: k,
    type:
      typeof v === "number"
        ? "number"
        : typeof v === "boolean"
        ? "boolean"
        : "string",
    value: String(v),
  }));
}
