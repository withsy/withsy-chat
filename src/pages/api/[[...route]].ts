import { setSessionToNextApiRequest } from "@/server/rest/middleware";
import { restServer } from "@/server/rest/router";
import { handle } from "@hono/node-server/vercel";
import type { NextApiRequest, NextApiResponse, PageConfig } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

const restHandler = handle(restServer);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  setSessionToNextApiRequest(req, session);
  return restHandler(req, res);
}
