import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { protoPath, InventoryProtoFile } from "@storm/contracts/proto";

export interface ReserveItem {
  sku: string;
  qty: number;
}

export interface ReserveOk {
  ok: true;
  reservationId: string;
  expiresAt: Date;
}

export interface ReserveRejected {
  ok: false;
  rejections: { sku: string; requested: number; available: number }[];
}

export type ReserveResult = ReserveOk | ReserveRejected;

interface ReserveResponseRaw {
  reservation_id: string;
  expires_at: string;
  rejections: { sku: string; requested: number | string; available: number | string }[];
}

interface InventoryClientGrpc {
  Reserve(
    req: { items: ReserveItem[]; order_id: string; ttl_seconds: number },
    options: grpc.CallOptions,
    cb: (err: grpc.ServiceError | null, res: ReserveResponseRaw) => void,
  ): void;
  Release(
    req: { reservation_id: string; reason: string },
    options: grpc.CallOptions,
    cb: (err: grpc.ServiceError | null, res: { released: boolean }) => void,
  ): void;
  close?(): void;
}

export interface InventoryClient {
  reserve(input: {
    items: ReserveItem[];
    orderId: string;
    ttlSeconds: number;
  }): Promise<ReserveResult>;
  release(reservationId: string, reason: string): Promise<void>;
  close(): void;
}

export function createInventoryClient(opts: {
  address: string;
  reserveTimeoutMs: number;
}): InventoryClient {
  const definition = protoLoader.loadSync(protoPath(InventoryProtoFile), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  const pkg = grpc.loadPackageDefinition(definition) as unknown as {
    storm: {
      inventory: {
        v1: { InventoryService: new (addr: string, creds: grpc.ChannelCredentials) => InventoryClientGrpc };
      };
    };
  };
  const InventoryService = pkg.storm.inventory.v1.InventoryService;
  const client = new InventoryService(opts.address, grpc.credentials.createInsecure());

  function deadline(ms: number): grpc.CallOptions {
    return { deadline: new Date(Date.now() + ms) };
  }

  return {
    reserve(input) {
      return new Promise((resolve, reject) => {
        client.Reserve(
          {
            items: input.items,
            order_id: input.orderId,
            ttl_seconds: input.ttlSeconds,
          },
          deadline(opts.reserveTimeoutMs),
          (err, res) => {
            if (err) return reject(err);
            if (res.reservation_id && res.reservation_id.length > 0) {
              resolve({
                ok: true,
                reservationId: res.reservation_id,
                expiresAt: new Date(res.expires_at),
              });
              return;
            }
            resolve({
              ok: false,
              rejections: (res.rejections ?? []).map((r) => ({
                sku: r.sku,
                requested: Number(r.requested),
                available: Number(r.available),
              })),
            });
          },
        );
      });
    },

    release(reservationId, reason) {
      return new Promise((resolve, reject) => {
        client.Release(
          { reservation_id: reservationId, reason },
          deadline(2000),
          (err) => {
            if (err) return reject(err);
            resolve();
          },
        );
      });
    },

    close() {
      client.close?.();
    },
  };
}
