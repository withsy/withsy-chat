// import { TRPCErrorFormatter, TRPCErrorShape } from "@trpc/server";
// import { TRPC_ERROR_CODES_BY_KEY } from "@trpc/server/rpc";
// import { DataError, getCodeKeyFromPrismaError } from "src/error";
// import { PrismaClientKnownRequestError } from "src/generated/prisma/internal/prismaNamespace";
// import { PublicContext } from "src/router-context";
// import { t } from "./trpc-server";

// export const userProcedure = publicProcedure.use(async ({ ctx, next }) => {
//   const userContext = await createUserContext(ctx);
//   return next({ ctx: userContext });
// });

// export const apiKeyProcedure = publicProcedure.use(async ({ ctx, next }) => {
//   const apiKeyContext = await createApiKeyContext(ctx);
//   return next({ ctx: apiKeyContext });
// });

// export const devProcedure = publicProcedure.use(async ({ ctx, next }) => {
//   if (
//     !(process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test")
//   ) {
//     throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
//   }

//   return next({ ctx });
// });
