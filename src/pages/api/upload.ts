import { appRouter } from "@/server/trpc/routers/_app";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(404).send("Not Found");
  }

  req.body();
}
