import { Router, type RequestHandler } from "express";
import type { Logger } from "@storm/logger";

import { requireAdmin } from "../auth/middleware.js";
import type { Config } from "../config.js";
import {
  getExport,
  listExports,
  startExport,
  type ExportKind,
} from "../services/exports.js";

function pickFilters(input: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(input)) {
    if (typeof v === "string" && v.length > 0) out[k] = v;
  }
  return out;
}

export function exportsRouter(deps: { config: Config; logger: Logger }): Router {
  const router = Router();
  router.use(requireAdmin());

  router.post(
    "/api/admin/orders/export",
    asyncRoute(async (req, res) => {
      const filters = pickFilters({ ...(req.body ?? {}), ...req.query });
      const record = await startExport({
        kind: "orders",
        filters,
        upstreamBaseUrl: deps.config.orderBaseUrl,
        upstreamPath: "/api/admin/orders",
        req,
      });
      res.status(202).json({ exportId: record.id, status: record.status });
    }),
  );

  router.post(
    "/api/admin/users/export",
    asyncRoute(async (req, res) => {
      const filters = pickFilters({ ...(req.body ?? {}), ...req.query });
      const record = await startExport({
        kind: "users",
        filters,
        upstreamBaseUrl: deps.config.identityBaseUrl,
        upstreamPath: "/api/admin/users",
        req,
      });
      res.status(202).json({ exportId: record.id, status: record.status });
    }),
  );

  router.get(
    "/api/admin/exports",
    asyncRoute(async (_req, res) => {
      const items = listExports().map((r) => ({
        id: r.id,
        kind: r.kind,
        status: r.status,
        createdAt: r.createdAt,
        completedAt: r.completedAt ?? null,
        filename: r.filename,
        rowCount: r.rowCount ?? null,
        errorMessage: r.errorMessage ?? null,
      }));
      res.json({ items });
    }),
  );

  router.get(
    "/api/admin/exports/:id",
    asyncRoute(async (req, res) => {
      const record = getExport(req.params["id"]!);
      if (!record) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: "Export not found." } });
        return;
      }
      res.json({
        id: record.id,
        kind: record.kind,
        status: record.status,
        createdAt: record.createdAt,
        completedAt: record.completedAt ?? null,
        filename: record.filename,
        rowCount: record.rowCount ?? null,
        errorMessage: record.errorMessage ?? null,
        downloadUrl:
          record.status === "ready" ? `/api/admin/exports/${record.id}/file` : null,
      });
    }),
  );

  router.get(
    "/api/admin/exports/:id/file",
    asyncRoute(async (req, res) => {
      const record = getExport(req.params["id"]!);
      if (!record) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: "Export not found." } });
        return;
      }
      if (record.status !== "ready" || !record.body) {
        res.status(409).json({
          error: { code: "EXPORT_NOT_READY", message: `Export is ${record.status}.` },
        });
        return;
      }
      res.setHeader("content-type", "text/csv; charset=utf-8");
      res.setHeader("content-disposition", `attachment; filename="${record.filename}"`);
      res.status(200).send(record.body);
    }),
  );

  return router;
}

function asyncRoute(
  fn: (req: Parameters<RequestHandler>[0], res: Parameters<RequestHandler>[1]) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res).catch(next);
  };
}

export type { ExportKind };
