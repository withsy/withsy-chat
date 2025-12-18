import { getServerContext } from "@/server/context";
import { createProxyMiddleware } from "http-proxy-middleware";
import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { IncomingMessage } from "node:http";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

interface Context {
  apiKey: string;
  userId?: string;
}

function setContext(req: IncomingMessage, context: Context) {
  Reflect.set(req, "_context", context);
}

function getContext(req: IncomingMessage): Context {
  return Reflect.get(req, "_context");
}

const { envVars } = getServerContext();

const proxy = createProxyMiddleware({
  target: envVars.API_URL,
  changeOrigin: true,
  pathRewrite: {
    "^/api": "",
  },
  on: {
    proxyReq: (proxyReq, req) => {
      const { apiKey, userId } = getContext(req);
      if (apiKey) {
        proxyReq.setHeader("X-Api-Key", apiKey);
      }

      if (userId) {
        proxyReq.setHeader("X-User-Id", userId);
      }
    },
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({ req });
  const context: Context = {
    apiKey: envVars.API_KEY,
    userId: token?.userId ? String(token.userId) : undefined,
  };
  setContext(req, context);

  return new Promise<void>((resolve, reject) => {
    proxy(req, res, (err) => {
      if (err) {
        return reject(err);
      }

      return resolve();
    });
  });
}
