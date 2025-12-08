import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { initTRPC, TRPCError } from "@trpc/server";
import { TRPC_ERROR_CODES_BY_KEY } from "@trpc/server/unstable-core-do-not-import";
import { SuperJSON } from "superjson";
import { DataError, getCodeKeyFromPrismaError } from "../error";
import {
  createApiKeyContext,
  createUserContext,
  type PublicContext,
} from "../server-context";

export const t = initTRPC.context<PublicContext>().create({
  transformer: SuperJSON,
  errorFormatter: ({ error, shape }) => {
    const { cause } = error;
    if (cause instanceof DataError) {
      return {
        ...shape,
        data: cause.data,
      };
    }

    if (cause instanceof PrismaClientKnownRequestError) {
      const codeKey = getCodeKeyFromPrismaError(cause);
      return {
        ...shape,
        code: TRPC_ERROR_CODES_BY_KEY[codeKey],
      };
    }

    return shape;
  },
});

export const publicProcedure = t.procedure;

export const userProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const userContext = await createUserContext(ctx);
  return next({ ctx: userContext });
});

export const apiKeyProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const apiKeyContext = await createApiKeyContext(ctx);
  return next({ ctx: apiKeyContext });
});

export const devProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (
    !(process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test")
  ) {
    throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
  }

  return next({ ctx });
});
