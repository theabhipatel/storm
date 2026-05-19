import type { Address, PublicUser } from "@storm/contracts";

export type { Address };

export interface MeProfile {
  id: string;
  email: string;
  name: string;
  mobile: string | null;
  role: "customer" | "admin";
  emailVerified: boolean;
  mobileVerified: boolean;
  blocked: boolean;
  createdAt: string;
  defaultAddress: {
    id: string;
    label: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
  } | null;
}

export interface MeResponse {
  user: MeProfile;
}

export interface AddressListResponse {
  items: Address[];
}

export interface AddressResponse {
  address: Address;
}

export type { PublicUser };
