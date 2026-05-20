import { Router, type RequestHandler } from "express";

import type { Config } from "../config.js";
import { requireAuth } from "../auth/middleware.js";
import type { CartClient } from "../services/cartClient.js";
import { calculateShippingPaise } from "../services/shipping.js";

export function checkoutRouter(deps: { cart: CartClient; config: Config }): Router {
  const router = Router();
  router.use(requireAuth());

  router.post(
    "/api/checkout/init",
    asyncRoute(async (req, res) => {
      const cart = await deps.cart.getCart(req.identity!.userId);
      const items = cart.items.map((i) => ({
        sku: i.sku,
        productId: i.productId,
        name: i.name,
        image: i.primaryImageUrl ? { url: i.primaryImageUrl } : null,
        unitPricePaise: i.currentPrice,
        qty: i.qty,
        lineTotalPaise: i.currentPrice * i.qty,
        available: i.available,
      }));
      const subtotalPaise = items.reduce((acc, i) => acc + i.lineTotalPaise, 0);
      const shippingFeePaise = calculateShippingPaise(subtotalPaise, deps.config);
      const totalPaise = subtotalPaise + shippingFeePaise;
      res.json({
        items,
        itemsCount: items.reduce((acc, i) => acc + i.qty, 0),
        subtotalPaise,
        shippingFeePaise,
        totalPaise,
        currency: "INR",
        freeShippingThresholdPaise: deps.config.freeShippingThresholdPaise,
      });
    }),
  );

  return router;
}

function asyncRoute(fn: (req: Parameters<RequestHandler>[0], res: Parameters<RequestHandler>[1]) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    fn(req, res).catch(next);
  };
}
