import { appRouter } from "@/server/trpc/routers/_app";
import type { NextApiRequest, NextApiResponse } from "next";
import { notFound } from "next/navigation";

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV === "production") notFound();

  const { renderTrpcPanel } = await import("trpc-ui");
  res.status(200).send(
    renderTrpcPanel(appRouter, {
      url: "/api/trpc",
      transformer: "superjson",
    })
  );
}
