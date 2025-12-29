import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { isDriverAdapterError } from "@prisma/driver-adapter-utils";
import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/unstable-core-do-not-import";

export function isExpectedUniqueConstraintViolation(
  e: unknown,
  expectedFields: string[],
) {
  if (!(e instanceof PrismaClientKnownRequestError)) return false;

  const { meta } = e;
  if (!meta) return false;
  if (!("driverAdapterError" in meta)) return false;

  const { driverAdapterError } = meta;
  if (!isDriverAdapterError(driverAdapterError)) return false;

  const { cause } = driverAdapterError;
  const { kind, originalCode } = cause;
  if (kind !== "UniqueConstraintViolation") return false;

  // Reference: https://www.postgresql.org/docs/current/errcodes-appendix.html
  if (originalCode !== "23505") return false;

  const { constraint } = cause;
  if (!constraint) return false;
  if (!("fields" in constraint)) return false;

  const { fields } = constraint;
  if (expectedFields.length !== fields.length) {
    return false;
  }

  const sortedExpectedFields = expectedFields.toSorted();
  const sortedFields = fields.toSorted();
  for (let i = 0; i < sortedExpectedFields.length; ++i) {
    if (sortedExpectedFields[i] !== sortedFields[i]) {
      return false;
    }
  }

  return true;
}

export function isNotFoundForAnUpdate(e: unknown): boolean {
  if (!(e instanceof PrismaClientKnownRequestError)) {
    return false;
  }

  if (e.code !== "P2025") {
    return false;
  }

  if (!e.meta) {
    return false;
  }

  if (!("operation" in e.meta)) {
    return false;
  }

  if (e.meta["operation"] !== "an update") {
    return false;
  }

  return true;
}

export function getCodeKeyFromPrismaError(
  e: PrismaClientKnownRequestError,
): TRPC_ERROR_CODE_KEY {
  switch (e.code) {
    case "P2025":
      return "NOT_FOUND";
    default:
      return "INTERNAL_SERVER_ERROR";
  }
}
