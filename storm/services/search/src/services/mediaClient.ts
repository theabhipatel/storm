import { StormError, ErrorCodes, type MediaAssetDto } from "@storm/contracts";

import type { Config } from "../config.js";

export function mediaClient(config: Config) {
  async function fetchBatch(ids: string[]): Promise<MediaAssetDto[]> {
    if (ids.length === 0) return [];
    const url = `${config.mediaBaseUrl}/api/media?ids=${encodeURIComponent(ids.join(","))}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new StormError({
        code: ErrorCodes.SERVICE_UNAVAILABLE,
        message: `media responded with ${res.status}.`,
        status: 502,
      });
    }
    const body = (await res.json()) as { items: MediaAssetDto[] };
    return body.items;
  }

  return { fetchBatch };
}
