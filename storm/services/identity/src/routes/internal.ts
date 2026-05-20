import { Router, type RequestHandler } from "express";
import type { PrismaClient } from "@prisma/client";
import { StormError, ErrorCodes } from "@storm/contracts";

import { addressService } from "../services/addressService.js";
import { profileService } from "../services/profileService.js";
import type { Config } from "../config.js";
import type { Logger } from "@storm/logger";
import type { Redis } from "ioredis";

export interface InternalRouterDeps {
  prisma: PrismaClient;
  redis: Redis;
  config: Config;
  logger: Logger;
}

export function internalRouter(deps: InternalRouterDeps): Router {
  const router = Router();
  const addresses = addressService(deps);
  const profile = profileService(deps);

  router.get(
    "/api/internal/users/:userId/addresses/:addressId",
    asyncRoute(async (req, res) => {
      const userId = req.params.userId!;
      const addressId = req.params.addressId!;
      if (!isUuid(userId) || !isUuid(addressId)) {
        throw new StormError({
          code: ErrorCodes.VALIDATION_FAILED,
          message: "userId and addressId must be UUIDs.",
          status: 400,
        });
      }
      const address = await addresses.get(userId, addressId);
      res.json({ address });
    }),
  );

  router.get(
    "/api/internal/users/:userId/profile",
    asyncRoute(async (req, res) => {
      const userId = req.params.userId!;
      if (!isUuid(userId)) {
        throw new StormError({
          code: ErrorCodes.VALIDATION_FAILED,
          message: "userId must be a UUID.",
          status: 400,
        });
      }
      const user = await profile.getMe(userId);
      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        mobile: user.mobile,
      });
    }),
  );

  return router;
}

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

function asyncRoute(fn: (req: Parameters<RequestHandler>[0], res: Parameters<RequestHandler>[1]) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    fn(req, res).catch(next);
  };
}
