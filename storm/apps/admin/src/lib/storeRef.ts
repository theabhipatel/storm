// Late-bound store reference. Breaks the import cycle between
// store/apiSlice.ts → lib/serviceApi.ts → store/index.ts.
// main.tsx calls setStoreRef(store) once the store is created.
import type { store as StoreType } from "../store";

let storeRef: typeof StoreType | null = null;

export function setStoreRef(s: typeof StoreType): void {
  storeRef = s;
}

export function getStoreRef(): typeof StoreType {
  if (!storeRef) throw new Error("store not initialized");
  return storeRef;
}
