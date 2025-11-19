import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { isDriverAdapterError } from "@prisma/driver-adapter-utils";

export function isExpectedUniqueConstraintViolation(
  e: any,
  expectedFields: string[]
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
