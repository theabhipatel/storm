import { promises as fs } from "node:fs";
import { dirname, resolve } from "node:path";

export interface InvoiceStore {
  save(orderId: string, pdf: Buffer): Promise<{ path: string }>;
  load(orderId: string): Promise<Buffer | null>;
}

export function createLocalInvoiceStore(opts: { baseDir: string }): InvoiceStore {
  const baseDir = resolve(opts.baseDir);

  function pathFor(orderId: string): string {
    if (!/^[0-9a-f-]+$/i.test(orderId)) {
      throw new Error("invalid orderId for invoice path");
    }
    return resolve(baseDir, `${orderId}.pdf`);
  }

  return {
    async save(orderId, pdf) {
      const file = pathFor(orderId);
      await fs.mkdir(dirname(file), { recursive: true });
      await fs.writeFile(file, pdf);
      return { path: file };
    },
    async load(orderId) {
      try {
        return await fs.readFile(pathFor(orderId));
      } catch (err: unknown) {
        if ((err as { code?: string }).code === "ENOENT") return null;
        throw err;
      }
    },
  };
}
