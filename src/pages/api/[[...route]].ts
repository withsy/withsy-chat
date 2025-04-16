import { rest, setSessionToRequest } from "@/server/routers/rest";
import { handle } from "@hono/node-server/vercel";
import type { NextApiRequest, NextApiResponse, PageConfig } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

const restHandler = handle(rest);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  setSessionToRequest(req, session);
  return restHandler(req, res);
}
