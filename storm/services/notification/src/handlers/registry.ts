import { eventHandlers as identityHandlers } from "./identity.js";
import { orderEventHandlers } from "./orders.js";
import type { EventHandler } from "./identity.js";

export const allEventHandlers: Record<string, EventHandler> = {
  ...identityHandlers,
  ...orderEventHandlers,
};
