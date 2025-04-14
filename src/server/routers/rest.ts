import { Hono } from "hono";
import { trpcRouter } from "./trpc";

export const rest = new Hono().basePath("/api").get("/trpc-ui", async (c) => {
  if (process.env.NODE_ENV !== "development") {
    return c.text("Not Found", 404);
  }
  const { renderTrpcPanel } = await import("trpc-ui");
  return c.html(
    renderTrpcPanel(trpcRouter, {
      url: "/api/trpc",
      transformer: "superjson",
    })
  );
});
