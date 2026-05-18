import { Router } from "express";

import type { KeySet } from "../auth/keys.js";

export function jwksRouter(keys: KeySet): Router {
  const router = Router();

  router.get("/.well-known/jwks.json", (_req, res) => {
    res.set("Cache-Control", "public, max-age=3600");
    res.json({ keys: [keys.publicJwk] });
  });

  return router;
}
