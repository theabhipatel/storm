import { Redis } from "ioredis";

let client: Redis | undefined;

export function getRedis(redisUrl: string): Redis {
  if (!client) {
    client = new Redis(redisUrl, {
      lazyConnect: false,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
    });
  }
  return client;
}

export async function disconnectRedis(): Promise<void> {
  if (client) {
    await client.quit().catch(() => undefined);
    client = undefined;
  }
}
