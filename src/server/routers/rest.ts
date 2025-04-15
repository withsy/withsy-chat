import type constants from "constants";
import { Hono } from "hono";
import { envConfig } from "../env-config";
import { trpcRouter } from "./trpc";

export const rest = new Hono()
  .basePath("/api")
  .get("/trpc-ui", async (c) => {
    if (envConfig.nodeEnv !== "development") {
      return c.text("Not Found", 404);
    }
    const { renderTrpcPanel } = await import("trpc-ui");
    return c.html(
      renderTrpcPanel(trpcRouter, {
        url: "/api/trpc",
        transformer: "superjson",
      })
    );
  })
  .post("/chats/:id/start", async (c) => {
    const { id } = c.req.param();
  });
