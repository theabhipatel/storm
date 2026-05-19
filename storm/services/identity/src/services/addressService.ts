import type { Address, PrismaClient } from "@prisma/client";
import {
  StormError,
  ErrorCodes,
  IdentityEventTypes,
  type AddressCreateInput,
  type AddressUpdateInput,
} from "@storm/contracts";
import type { Logger } from "@storm/logger";
import { uuidv7 } from "uuidv7";

import { appendOutbox } from "../outbox/writer.js";

const MAX_ACTIVE_ADDRESSES = 10;

export interface AddressServiceDeps {
  prisma: PrismaClient;
  logger: Logger;
}

export function addressService(deps: AddressServiceDeps) {
  const { prisma, logger } = deps;

  async function list(userId: string) {
    const rows = await prisma.address.findMany({
      where: { userId, deletedAt: null },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    return rows.map(toDto);
  }

  async function get(userId: string, addressId: string) {
    const row = await prisma.address.findFirst({
      where: { id: addressId, userId, deletedAt: null },
    });
    if (!row) throw notFound();
    return toDto(row);
  }

  async function create(userId: string, input: AddressCreateInput) {
    const activeCount = await prisma.address.count({
      where: { userId, deletedAt: null },
    });
    if (activeCount >= MAX_ACTIVE_ADDRESSES) {
      throw new StormError({
        code: ErrorCodes.ADDRESS_LIMIT_REACHED,
        message: `Max ${MAX_ACTIVE_ADDRESSES} addresses per user.`,
        status: 409,
      });
    }
    // First-ever active address becomes default automatically.
    const isDefault = input.isDefault === true || activeCount === 0;
    const id = uuidv7();

    const created = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true, deletedAt: null },
          data: { isDefault: false },
        });
      }
      const row = await tx.address.create({
        data: {
          id,
          userId,
          label: input.label,
          fullName: input.fullName,
          mobile: input.mobile,
          line1: input.line1,
          line2: input.line2 ?? null,
          landmark: input.landmark ?? null,
          city: input.city,
          state: input.state,
          pincode: input.pincode,
          country: input.country ?? "IN",
          isDefault,
        },
      });
      await appendOutbox(tx, {
        aggregateId: userId,
        eventType: IdentityEventTypes.UserAddressAdded,
        payload: { userId, addressId: id },
      });
      return row;
    });

    logger.info({ userId, addressId: id }, "address_added");
    return toDto(created);
  }

  async function update(userId: string, addressId: string, input: AddressUpdateInput) {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId, deletedAt: null },
    });
    if (!existing) throw notFound();

    const isDefaultNext =
      typeof input.isDefault === "boolean" ? input.isDefault : existing.isDefault;

    const updated = await prisma.$transaction(async (tx) => {
      if (isDefaultNext && !existing.isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true, deletedAt: null, id: { not: addressId } },
          data: { isDefault: false },
        });
      }
      const row = await tx.address.update({
        where: { id: addressId },
        data: {
          ...(input.label !== undefined ? { label: input.label } : {}),
          ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
          ...(input.mobile !== undefined ? { mobile: input.mobile } : {}),
          ...(input.line1 !== undefined ? { line1: input.line1 } : {}),
          ...(input.line2 !== undefined ? { line2: input.line2 } : {}),
          ...(input.landmark !== undefined ? { landmark: input.landmark } : {}),
          ...(input.city !== undefined ? { city: input.city } : {}),
          ...(input.state !== undefined ? { state: input.state } : {}),
          ...(input.pincode !== undefined ? { pincode: input.pincode } : {}),
          ...(input.country !== undefined ? { country: input.country } : {}),
          isDefault: isDefaultNext,
        },
      });
      await appendOutbox(tx, {
        aggregateId: userId,
        eventType: IdentityEventTypes.UserAddressUpdated,
        payload: { userId, addressId },
      });
      return row;
    });

    logger.info({ userId, addressId }, "address_updated");
    return toDto(updated);
  }

  async function remove(userId: string, addressId: string): Promise<void> {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId, deletedAt: null },
    });
    if (!existing) throw notFound();

    if (existing.isDefault) {
      const otherCount = await prisma.address.count({
        where: { userId, deletedAt: null, id: { not: addressId } },
      });
      if (otherCount > 0) {
        throw new StormError({
          code: ErrorCodes.ADDRESS_DEFAULT_REQUIRED,
          message: "Set another address as default before deleting this one.",
          status: 409,
        });
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.address.update({
        where: { id: addressId },
        data: { deletedAt: new Date(), isDefault: false },
      });
      await appendOutbox(tx, {
        aggregateId: userId,
        eventType: IdentityEventTypes.UserAddressDeleted,
        payload: { userId, addressId },
      });
    });
    logger.info({ userId, addressId }, "address_deleted");
  }

  async function setDefault(userId: string, addressId: string) {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId, deletedAt: null },
    });
    if (!existing) throw notFound();

    const updated = await prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId, isDefault: true, deletedAt: null, id: { not: addressId } },
        data: { isDefault: false },
      });
      const row = await tx.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      });
      await appendOutbox(tx, {
        aggregateId: userId,
        eventType: IdentityEventTypes.UserAddressUpdated,
        payload: { userId, addressId },
      });
      return row;
    });

    logger.info({ userId, addressId }, "address_set_default");
    return toDto(updated);
  }

  return { list, get, create, update, remove, setDefault };
}

export type AddressService = ReturnType<typeof addressService>;

function toDto(row: Address) {
  return {
    id: row.id,
    userId: row.userId,
    label: row.label,
    fullName: row.fullName,
    mobile: row.mobile,
    line1: row.line1,
    line2: row.line2,
    landmark: row.landmark,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    country: row.country,
    isDefault: row.isDefault,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function notFound(): StormError {
  return new StormError({
    code: ErrorCodes.NOT_FOUND,
    message: "Address not found.",
    status: 404,
  });
}
