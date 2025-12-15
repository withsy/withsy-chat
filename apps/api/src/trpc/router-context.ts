import { TRPCError } from "@trpc/server";

export function createPublicContext(input: {
  request: NextApiRequest;
  response: NextApiResponse;
}) {
  return { ...input, serverContext };
}

export type PublicContext = ReturnType<typeof createPublicContext>;

export async function createUserContext(ctx: PublicContext) {
  const { request, response } = ctx;

  let userId = "";
  const session = await getServerSession(request, response, getAuthOptions());
  if (session) {
    const userSession = UserSession.parse(session);
    userId = userSession.user.id;
  }

  if (!userId) {
    const token = await getToken({ req: request });
    if (token) {
      const userJwt = UserJwt.parse(token);
      userId = userJwt.sub;
    }
  }

  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  if (
    request.method === "POST" ||
    request.method === "PUT" ||
    request.method === "DELETE" ||
    request.method === "PATCH"
  ) {
    const csrfToken = request.headers["x-csrf-token"];
    if (typeof csrfToken !== "string") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    serverContext.nextAuthCsrfService.validateCsrfTokenWithReq({
      csrfToken,
      req: request,
    });
  }

  return {
    ...ctx,
    userId,
  };
}

export type UserContext = Awaited<ReturnType<typeof createUserContext>>;

export async function createApiKeyContext(ctx: PublicContext) {
  const { serverContext, request } = ctx;
  const apiKey = request.headers["x-api-key"];
  if (typeof apiKey !== "string") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid X-Api-Key header.",
    });
  }

  const isValid = await serverContext.apiKeyService.validateApiKey({
    apiKey,
  });
  if (!isValid) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid API Key." });
  }

  return {
    ...ctx,
  };
}
