import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

/**
 * Filesystem path to a .proto file shipped with @storm/contracts.
 * Consumers use this with @grpc/proto-loader's `load`/`loadSync`.
 */
export function protoPath(file: string): string {
  // dist/proto/index.js → ../../proto/<file>
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, "..", "..", "proto", file);
}

export const InventoryProtoFile = "inventory.proto";
