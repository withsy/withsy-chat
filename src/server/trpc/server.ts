import { initTRPC } from "@trpc/server";
import { SuperJSON } from "superjson";
import {
  createApiKeyContext,
  createUserContext,
  type PublicContext,
} from "../server-context";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TRPC_ERROR_CODES_BY_KEY } from "@trpc/server/unstable-core-do-not-import";

export const t = initTRPC.context<PublicContext>().create({
  transformer: SuperJSON,
  errorFormatter: ({ error, shape }) => {
    const { cause } = error;
    if (cause instanceof PrismaClientKnownRequestError) {
      if (cause.code === "P2025") {
        return {
          ...shape,
          code: TRPC_ERROR_CODES_BY_KEY.NOT_FOUND,
        };
      }
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
