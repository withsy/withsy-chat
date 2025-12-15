import { initTRPC, TRPCError } from "@trpc/server";
import { TRPC_ERROR_CODES_BY_KEY } from "@trpc/server/unstable-core-do-not-import";
import { DataError, getCodeKeyFromPrismaError } from "src/error";
import { PrismaClientKnownRequestError } from "src/generated/prisma/internal/prismaNamespace";
import { SuperJSON } from "superjson";
import {
  createApiKeyContext,
  createUserContext,
  type PublicContext,
} from "../router-context";
import { errorFormatter } from "./trpc-utils";

export const t = initTRPC.context<PublicContext>().create({
  transformer: SuperJSON,
  errorFormatter,
});
