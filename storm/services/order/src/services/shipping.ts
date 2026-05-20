import type { Config } from "../config.js";

export function calculateShippingPaise(subtotalPaise: number, config: Config): number {
  if (subtotalPaise >= config.freeShippingThresholdPaise) return 0;
  return config.flatShippingFeePaise;
}
