import { StormError, ErrorCodes, type Address } from "@storm/contracts";

import type { Config } from "../config.js";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  mobile: string | null;
}

export interface IdentityClient {
  getAddress(userId: string, addressId: string): Promise<Address | null>;
  getProfile(userId: string): Promise<UserProfile | null>;
}

export function createIdentityClient(config: Config): IdentityClient {
  return {
    async getAddress(userId, addressId) {
      const res = await fetch(
        `${config.identityBaseUrl}/api/internal/users/${userId}/addresses/${addressId}`,
        { headers: { Accept: "application/json" } },
      );
      if (res.status === 404) return null;
      if (!res.ok) {
        throw new StormError({
          code: ErrorCodes.SERVICE_UNAVAILABLE,
          message: `Identity responded with ${res.status}.`,
          status: 502,
        });
      }
      const body = (await res.json()) as { address: Address };
      return body.address;
    },

    async getProfile(userId) {
      const res = await fetch(
        `${config.identityBaseUrl}/api/internal/users/${userId}/profile`,
        { headers: { Accept: "application/json" } },
      );
      if (res.status === 404) return null;
      if (!res.ok) {
        throw new StormError({
          code: ErrorCodes.SERVICE_UNAVAILABLE,
          message: `Identity responded with ${res.status}.`,
          status: 502,
        });
      }
      return (await res.json()) as UserProfile;
    },
  };
}
