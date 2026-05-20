import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { protoPath, InventoryProtoFile } from "@storm/contracts/proto";
import type { Logger } from "@storm/logger";

import type { ReservationService } from "../services/reservationService.js";
import type { StockService } from "../services/stockService.js";

export interface GrpcServerHandle {
  start(): Promise<void>;
  stop(): Promise<void>;
}

interface ReserveRequest {
  items: { sku: string; qty: number }[];
  order_id: string;
  ttl_seconds: number;
}

interface ConfirmRequest {
  reservation_id: string;
}

interface ReleaseRequest {
  reservation_id: string;
  reason: string;
}

interface RestockRequest {
  order_id: string;
  reason: string;
}

interface GetStockRequest {
  skus: string[];
}

export function createGrpcServer(deps: {
  reservations: ReservationService;
  stock: StockService;
  port: number;
  defaultTtlSec: number;
  logger: Logger;
}): GrpcServerHandle {
  const definition = protoLoader.loadSync(protoPath(InventoryProtoFile), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  const pkg = grpc.loadPackageDefinition(definition) as unknown as {
    storm: { inventory: { v1: { InventoryService: { service: grpc.ServiceDefinition } } } };
  };
  const serviceDef = pkg.storm.inventory.v1.InventoryService.service;

  const server = new grpc.Server();
  server.addService(serviceDef, {
    Reserve: (call: grpc.ServerUnaryCall<ReserveRequest, unknown>, cb: grpc.sendUnaryData<unknown>) => {
      const req = call.request;
      const ttl = req.ttl_seconds && req.ttl_seconds > 0 ? req.ttl_seconds : deps.defaultTtlSec;
      deps.reservations
        .reserve({
          items: req.items.map((i) => ({ sku: i.sku, qty: Number(i.qty) })),
          orderId: req.order_id,
          ttlSeconds: ttl,
        })
        .then((result) => {
          if (result.ok) {
            cb(null, {
              reservation_id: result.reservationId,
              expires_at: result.expiresAt.toISOString(),
              rejections: [],
            });
          } else {
            cb(null, {
              reservation_id: "",
              expires_at: "",
              rejections: result.rejections.map((r) => ({
                sku: r.sku,
                requested: r.requested,
                available: r.available,
              })),
            });
          }
        })
        .catch((err: Error) => {
          deps.logger.error({ err }, "grpc_reserve_failed");
          cb({ code: grpc.status.INTERNAL, message: err.message });
        });
    },

    ConfirmReservation: (call: grpc.ServerUnaryCall<ConfirmRequest, unknown>, cb: grpc.sendUnaryData<unknown>) => {
      deps.reservations
        .confirm(call.request.reservation_id)
        .then(() => cb(null, { confirmed: true }))
        .catch((err: Error) => {
          deps.logger.error({ err }, "grpc_confirm_failed");
          cb({ code: grpc.status.INTERNAL, message: err.message });
        });
    },

    Release: (call: grpc.ServerUnaryCall<ReleaseRequest, unknown>, cb: grpc.sendUnaryData<unknown>) => {
      deps.reservations
        .release(call.request.reservation_id, "manual")
        .then(() => cb(null, { released: true }))
        .catch((err: Error) => {
          deps.logger.error({ err }, "grpc_release_failed");
          cb({ code: grpc.status.INTERNAL, message: err.message });
        });
    },

    Restock: (call: grpc.ServerUnaryCall<RestockRequest, unknown>, cb: grpc.sendUnaryData<unknown>) => {
      deps.reservations
        .restock(call.request.order_id, call.request.reason || "manual")
        .then(() => cb(null, { restocked: true }))
        .catch((err: Error) => {
          deps.logger.error({ err }, "grpc_restock_failed");
          cb({ code: grpc.status.INTERNAL, message: err.message });
        });
    },

    GetStock: (call: grpc.ServerUnaryCall<GetStockRequest, unknown>, cb: grpc.sendUnaryData<unknown>) => {
      deps.stock
        .getStock(call.request.skus)
        .then((items) =>
          cb(null, {
            items: items.map((i) => ({
              sku: i.sku,
              product_id: i.productId,
              quantity_on_hand: i.quantityOnHand,
              quantity_reserved: i.quantityReserved,
              quantity_available: i.quantityAvailable,
              in_stock: i.quantityAvailable > 0,
            })),
          }),
        )
        .catch((err: Error) => {
          deps.logger.error({ err }, "grpc_getstock_failed");
          cb({ code: grpc.status.INTERNAL, message: err.message });
        });
    },
  });

  return {
    async start() {
      await new Promise<void>((resolve, reject) => {
        server.bindAsync(
          `0.0.0.0:${deps.port}`,
          grpc.ServerCredentials.createInsecure(),
          (err) => (err ? reject(err) : resolve()),
        );
      });
      deps.logger.info({ port: deps.port }, "grpc_server_started");
    },
    async stop() {
      await new Promise<void>((resolve) => {
        server.tryShutdown(() => resolve());
      });
    },
  };
}
